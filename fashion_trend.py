"""
Fashion Trend Prediction — End-to-End Modeling Pipeline
=========================================================

Predicts `is_trending_binary` for the merged US/IN fashion dataset described in
`merged_fashion_dataset_us_in.csv` (columns: parent_asin, title, gender,
individual_category, price_usd, brand, average_rating, rating_number,
is_trending, source_market, is_trending_binary).

IMPORTANT — DATA LEAKAGE WARNING
---------------------------------
In this dataset `is_trending` is *defined* as a threshold on `average_rating`
(rating >= 4.2 -> Yes, see the perfect split at 4.2 in the "Rating by Trending
Status" table: max rating for "No" is 4.1, min rating for "Yes" is 4.2). That
means `average_rating` is not a predictive feature — it IS the label in
disguise. Feeding it into the model produces a trivial ~100% accuracy
classifier that has learned nothing except "is average_rating >= 4.2", which
is useless for the real-world task (predicting trend potential for a product
BEFORE it has accumulated enough ratings to know its average).

This script therefore trains the REALISTIC model by default:
    is_trending ~ gender + individual_category + price_usd + brand +
                  source_market + title-derived features
i.e. everything you would know about a product at LISTING time, before
reviews come in. `average_rating` is excluded from features entirely.
`rating_number` (review volume) is kept — it is only weakly correlated with
the target (~0.03) and is not deterministic of it, so it is legitimate
signal (mature, well-exposed listings), not leakage.

Pass --include_rating_features to also fit the leaky/demonstration model for
comparison purposes (clearly labeled as such in all outputs).

Usage
-----
    python fashion_trend_pipeline.py --data /path/to/merged_fashion_dataset_us_in.csv

Outputs (written to --outdir, default ./outputs):
    plots/*.png                 EDA + evaluation charts
    metrics.json                 all metrics for every model
    model_realistic.joblib       best realistic-mode pipeline (preprocessing+model)
    model_leaky.joblib           (only if --include_rating_features)
    feature_importance.csv
    run_log.txt                  full console log
"""

import argparse
import json
import sys
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import (
    train_test_split, StratifiedKFold, cross_validate, RandomizedSearchCV
)
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import (
    classification_report, confusion_matrix, roc_auc_score, roc_curve,
    precision_recall_curve, average_precision_score, ConfusionMatrixDisplay,
    f1_score
)
from sklearn.inspection import permutation_importance
import category_encoders as ce
import xgboost as xgb
import lightgbm as lgb
import joblib

warnings.filterwarnings("ignore")
sns.set_theme(style="whitegrid", palette="deep")
RANDOM_STATE = 42


# ---------------------------------------------------------------------------
# Logging helper: tee print() to both console and a log file
# ---------------------------------------------------------------------------
class Tee:
    def __init__(self, *streams):
        self.streams = streams

    def write(self, data):
        for s in self.streams:
            s.write(data)
            s.flush()

    def flush(self):
        for s in self.streams:
            s.flush()


def section(title):
    bar = "=" * 78
    print(f"\n{bar}\n{title}\n{bar}")


# ---------------------------------------------------------------------------
# 1. Load & inspect
# ---------------------------------------------------------------------------
def load_data(path):
    section("1. LOADING DATA")
    df = pd.read_csv(path)
    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print(f"\nMissing values per column:\n{df.isnull().sum()}")
    print(f"\nDtypes:\n{df.dtypes}")
    dup = df.duplicated(subset=["parent_asin"]).sum() if "parent_asin" in df.columns else df.duplicated().sum()
    print(f"\nDuplicate rows (by id): {dup}")
    return df


def inspect_target(df, target_col="is_trending_binary"):
    section("2. TARGET INSPECTION & LEAKAGE CHECK")
    print(df[target_col].value_counts(normalize=True).rename("proportion"))

    if "average_rating" in df.columns:
        g = df.groupby(target_col)["average_rating"].agg(["mean", "min", "max", "count"])
        print("\naverage_rating by target class (checking for a deterministic threshold):")
        print(g)
        no_max = df.loc[df[target_col] == 0, "average_rating"].max()
        yes_min = df.loc[df[target_col] == 1, "average_rating"].min()
        if no_max < yes_min:
            print(
                f"\n*** LEAKAGE CONFIRMED: max(rating | not trending)={no_max} < "
                f"min(rating | trending)={yes_min}. The target is a deterministic "
                f"threshold on average_rating. average_rating and any feature "
                f"engineered purely from it will be EXCLUDED from the realistic "
                f"model's feature set. ***"
            )
    return df


# ---------------------------------------------------------------------------
# 2. EDA plots
# ---------------------------------------------------------------------------
def run_eda(df, plot_dir, target_col="is_trending_binary"):
    section("3. EXPLORATORY DATA ANALYSIS")
    plot_dir.mkdir(parents=True, exist_ok=True)

    # Target balance
    fig, ax = plt.subplots(figsize=(5, 4))
    df[target_col].value_counts().sort_index().plot(kind="bar", ax=ax, color=["#d9534f", "#5cb85c"])
    ax.set_xticklabels(["No (0)", "Yes (1)"], rotation=0)
    ax.set_title("Target balance: is_trending")
    ax.set_ylabel("count")
    fig.tight_layout()
    fig.savefig(plot_dir / "01_target_balance.png", dpi=150)
    plt.close(fig)

    # Price distribution (log scale)
    if "price_usd" in df.columns:
        fig, ax = plt.subplots(figsize=(6, 4))
        sns.histplot(np.log1p(df["price_usd"]), bins=60, ax=ax, kde=True)
        ax.set_title("Log(1+price_usd) distribution")
        fig.tight_layout()
        fig.savefig(plot_dir / "02_log_price_distribution.png", dpi=150)
        plt.close(fig)

    # Gender vs trending rate
    if "gender" in df.columns:
        fig, ax = plt.subplots(figsize=(5, 4))
        df.groupby("gender")[target_col].mean().sort_values().plot(kind="barh", ax=ax)
        ax.set_title("Trending rate by gender")
        ax.set_xlabel("trending rate")
        fig.tight_layout()
        fig.savefig(plot_dir / "03_trending_rate_by_gender.png", dpi=150)
        plt.close(fig)

    # Top categories by trending rate (min sample size filter)
    if "individual_category" in df.columns:
        cat_stats = df.groupby("individual_category")[target_col].agg(["mean", "count"])
        cat_stats = cat_stats[cat_stats["count"] >= 100].sort_values("mean", ascending=False).head(20)
        fig, ax = plt.subplots(figsize=(7, 6))
        cat_stats["mean"].sort_values().plot(kind="barh", ax=ax)
        ax.set_title("Top 20 categories by trending rate (count >= 100)")
        ax.set_xlabel("trending rate")
        fig.tight_layout()
        fig.savefig(plot_dir / "04_top_categories_trending_rate.png", dpi=150)
        plt.close(fig)

    # Price by trending status (boxplot, log scale)
    if "price_usd" in df.columns:
        fig, ax = plt.subplots(figsize=(5, 4))
        plot_df = df.copy()
        plot_df["log_price"] = np.log1p(plot_df["price_usd"])
        sns.boxplot(data=plot_df, x=target_col, y="log_price", ax=ax)
        ax.set_xticklabels(["No", "Yes"])
        ax.set_title("Log price by trending status")
        fig.tight_layout()
        fig.savefig(plot_dir / "05_price_by_trending.png", dpi=150)
        plt.close(fig)

    # Correlation heatmap (numeric, excluding rating features handled separately)
    numeric_cols = [c for c in ["price_usd", "rating_number", target_col] if c in df.columns]
    if len(numeric_cols) > 1:
        fig, ax = plt.subplots(figsize=(5, 4))
        sns.heatmap(df[numeric_cols].corr(), annot=True, fmt=".3f", cmap="coolwarm", center=0, ax=ax)
        ax.set_title("Correlation (features actually used, no rating leakage)")
        fig.tight_layout()
        fig.savefig(plot_dir / "06_correlation_heatmap.png", dpi=150)
        plt.close(fig)

    print(f"EDA plots saved to {plot_dir}")


# ---------------------------------------------------------------------------
# 3. Feature engineering
# ---------------------------------------------------------------------------
def engineer_features(df, rare_brand_threshold=10):
    section("4. FEATURE ENGINEERING")
    df = df.copy()

    # --- Title-derived features (safe: known at listing time) ---
    if "title" in df.columns:
        df["title_length"] = df["title"].astype(str).str.len()
        df["title_word_count"] = df["title"].astype(str).str.split().str.len()
        title_lower = df["title"].astype(str).str.lower()
        df["kw_women"] = title_lower.str.contains(r"women|woman|ladies", regex=True, na=False).astype(int)
        df["kw_men"] = title_lower.str.contains(r"\bmen\b|\bman\b|male", regex=True, na=False).astype(int)
        df["kw_kids"] = title_lower.str.contains(r"kids|children|boy|girl|youth", regex=True, na=False).astype(int)
    else:
        df["title_length"] = 0
        df["title_word_count"] = 0
        df["kw_women"] = df["kw_men"] = df["kw_kids"] = 0

    # --- Price transform ---
    df["log_price"] = np.log1p(df["price_usd"])

    # --- Review-volume transform (kept — weak, non-deterministic signal) ---
    if "rating_number" in df.columns:
        df["log_rating_count"] = np.log1p(df["rating_number"])
    else:
        df["log_rating_count"] = 0

    # --- Brand grouping: collapse rare brands into "Other" ---
    if "brand" in df.columns:
        counts = df["brand"].value_counts()
        rare = counts[counts < rare_brand_threshold].index
        df["brand_grouped"] = df["brand"].where(~df["brand"].isin(rare), "Other")
        print(f"Brands: {df['brand'].nunique()} raw -> {df['brand_grouped'].nunique()} after grouping rare (<{rare_brand_threshold}) into 'Other'")
    else:
        df["brand_grouped"] = "Unknown"

    print("Engineered columns added: title_length, title_word_count, kw_women, kw_men, "
          "kw_kids, log_price, log_rating_count, brand_grouped")
    return df


REALISTIC_FEATURES_NUMERIC = ["price_usd", "log_price", "log_rating_count",
                               "title_length", "title_word_count",
                               "kw_women", "kw_men", "kw_kids"]
REALISTIC_FEATURES_ONEHOT = ["gender", "source_market"]
REALISTIC_FEATURES_TARGETENC = ["individual_category", "brand_grouped"]

LEAKY_EXTRA_NUMERIC = ["average_rating"]  # only used in --include_rating_features demo mode


def build_preprocessor(numeric_cols, onehot_cols, targetenc_cols):
    """ColumnTransformer: passthrough numeric, one-hot low-cardinality cats,
    target-encode high-cardinality cats. Fit only ever happens on the
    training fold, so target encoding cannot leak across CV folds."""
    transformers = []
    if numeric_cols:
        transformers.append(("num", "passthrough", numeric_cols))
    if onehot_cols:
        transformers.append(("onehot", OneHotEncoder(handle_unknown="ignore"), onehot_cols))
    if targetenc_cols:
        transformers.append(("targetenc", ce.TargetEncoder(cols=targetenc_cols, smoothing=10), targetenc_cols))
    return ColumnTransformer(transformers, remainder="drop")


# ---------------------------------------------------------------------------
# 4. Model zoo + CV comparison
# ---------------------------------------------------------------------------
def get_model_zoo():
    return {
        "LogisticRegression": LogisticRegression(max_iter=2000, class_weight="balanced", random_state=RANDOM_STATE),
        "RandomForest": RandomForestClassifier(
            n_estimators=400, max_depth=None, min_samples_leaf=2,
            class_weight="balanced_subsample", n_jobs=-1, random_state=RANDOM_STATE
        ),
        "XGBoost": xgb.XGBClassifier(
            n_estimators=400, max_depth=6, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8, eval_metric="logloss",
            n_jobs=-1, random_state=RANDOM_STATE
        ),
        "LightGBM": lgb.LGBMClassifier(
            n_estimators=400, max_depth=-1, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8, n_jobs=-1,
            random_state=RANDOM_STATE, verbosity=-1
        ),
    }


def compare_models(X_train, y_train, preprocessor, plot_dir, tag=""):
    section(f"5. MODEL COMPARISON (5-fold CV, ROC-AUC) [{tag}]")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    results = {}
    for name, model in get_model_zoo().items():
        pipe = Pipeline([("prep", preprocessor), ("clf", model)])
        scores = cross_validate(
            pipe, X_train, y_train, cv=cv,
            scoring=["roc_auc", "f1", "accuracy"], n_jobs=1, return_train_score=False
        )
        results[name] = {
            "roc_auc_mean": float(np.mean(scores["test_roc_auc"])),
            "roc_auc_std": float(np.std(scores["test_roc_auc"])),
            "f1_mean": float(np.mean(scores["test_f1"])),
            "accuracy_mean": float(np.mean(scores["test_accuracy"])),
        }
        print(f"{name:18s}  AUC={results[name]['roc_auc_mean']:.4f} (+/-{results[name]['roc_auc_std']:.4f})  "
              f"F1={results[name]['f1_mean']:.4f}  Acc={results[name]['accuracy_mean']:.4f}")

    # Comparison bar chart
    fig, ax = plt.subplots(figsize=(6, 4))
    names = list(results.keys())
    aucs = [results[n]["roc_auc_mean"] for n in names]
    errs = [results[n]["roc_auc_std"] for n in names]
    ax.bar(names, aucs, yerr=errs, capsize=4, color=sns.color_palette("deep", len(names)))
    ax.set_ylabel("CV ROC-AUC")
    ax.set_title(f"Model comparison — {tag}")
    ax.set_ylim(0.5, 1.0)
    plt.xticks(rotation=20)
    fig.tight_layout()
    fig.savefig(plot_dir / f"07_model_comparison_{tag}.png", dpi=150)
    plt.close(fig)

    best_name = max(results, key=lambda n: results[n]["roc_auc_mean"])
    print(f"\nBest model by CV ROC-AUC: {best_name}")
    return results, best_name


# ---------------------------------------------------------------------------
# 5. Hyperparameter tuning
# ---------------------------------------------------------------------------
def tune_best_model(best_name, X_train, y_train, preprocessor):
    section(f"6. HYPERPARAMETER TUNING ({best_name})")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    param_grids = {
        "XGBoost": {
            "clf__n_estimators": [200, 400, 600],
            "clf__max_depth": [4, 6, 8],
            "clf__learning_rate": [0.03, 0.05, 0.1],
            "clf__subsample": [0.7, 0.8, 1.0],
            "clf__colsample_bytree": [0.6, 0.8, 1.0],
            "clf__min_child_weight": [1, 3, 5],
        },
        "LightGBM": {
            "clf__n_estimators": [200, 400, 600],
            "clf__num_leaves": [31, 63, 127],
            "clf__learning_rate": [0.03, 0.05, 0.1],
            "clf__subsample": [0.7, 0.8, 1.0],
            "clf__colsample_bytree": [0.6, 0.8, 1.0],
        },
        "RandomForest": {
            "clf__n_estimators": [300, 500, 800],
            "clf__max_depth": [None, 10, 20, 30],
            "clf__min_samples_leaf": [1, 2, 4],
            "clf__max_features": ["sqrt", "log2"],
        },
        "LogisticRegression": {
            "clf__C": [0.01, 0.1, 1.0, 10.0],
            "clf__penalty": ["l2"],
        },
    }

    model = get_model_zoo()[best_name]
    pipe = Pipeline([("prep", preprocessor), ("clf", model)])
    grid = param_grids.get(best_name, {})

    if not grid:
        pipe.fit(X_train, y_train)
        return pipe, {}

    search = RandomizedSearchCV(
        pipe, param_distributions=grid, n_iter=20, scoring="roc_auc",
        cv=cv, random_state=RANDOM_STATE, n_jobs=1, verbose=1
    )
    search.fit(X_train, y_train)
    print(f"Best params: {search.best_params_}")
    print(f"Best CV ROC-AUC: {search.best_score_:.4f}")
    return search.best_estimator_, search.best_params_


# ---------------------------------------------------------------------------
# 6. Final evaluation
# ---------------------------------------------------------------------------
def evaluate_model(pipe, X_test, y_test, plot_dir, tag=""):
    section(f"7. FINAL TEST-SET EVALUATION [{tag}]")
    y_pred = pipe.predict(X_test)
    y_proba = pipe.predict_proba(X_test)[:, 1]

    report = classification_report(y_test, y_pred, output_dict=True)
    print(classification_report(y_test, y_pred))
    auc = roc_auc_score(y_test, y_proba)
    ap = average_precision_score(y_test, y_proba)
    print(f"ROC-AUC: {auc:.4f}   Average Precision: {ap:.4f}")

    # Confusion matrix
    fig, ax = plt.subplots(figsize=(5, 4))
    cm = confusion_matrix(y_test, y_pred)
    ConfusionMatrixDisplay(cm, display_labels=["No", "Yes"]).plot(ax=ax, cmap="Blues", colorbar=False)
    ax.set_title(f"Confusion Matrix — {tag}")
    fig.tight_layout()
    fig.savefig(plot_dir / f"08_confusion_matrix_{tag}.png", dpi=150)
    plt.close(fig)

    # ROC curve
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    fig, ax = plt.subplots(figsize=(5, 4))
    ax.plot(fpr, tpr, label=f"AUC = {auc:.3f}")
    ax.plot([0, 1], [0, 1], "k--", alpha=0.5)
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title(f"ROC Curve — {tag}")
    ax.legend()
    fig.tight_layout()
    fig.savefig(plot_dir / f"09_roc_curve_{tag}.png", dpi=150)
    plt.close(fig)

    # Precision-Recall curve
    prec, rec, _ = precision_recall_curve(y_test, y_proba)
    fig, ax = plt.subplots(figsize=(5, 4))
    ax.plot(rec, prec, label=f"AP = {ap:.3f}")
    ax.set_xlabel("Recall")
    ax.set_ylabel("Precision")
    ax.set_title(f"Precision-Recall Curve — {tag}")
    ax.legend()
    fig.tight_layout()
    fig.savefig(plot_dir / f"10_pr_curve_{tag}.png", dpi=150)
    plt.close(fig)

    # Calibration curve
    frac_pos, mean_pred = calibration_curve(y_test, y_proba, n_bins=10, strategy="quantile")
    fig, ax = plt.subplots(figsize=(5, 4))
    ax.plot(mean_pred, frac_pos, "o-", label="Model")
    ax.plot([0, 1], [0, 1], "k--", alpha=0.5, label="Perfectly calibrated")
    ax.set_xlabel("Mean predicted probability")
    ax.set_ylabel("Fraction of positives")
    ax.set_title(f"Calibration Curve — {tag}")
    ax.legend()
    fig.tight_layout()
    fig.savefig(plot_dir / f"11_calibration_curve_{tag}.png", dpi=150)
    plt.close(fig)

    return {"roc_auc": auc, "average_precision": ap, "classification_report": report}


def subgroup_evaluation(pipe, X_test, y_test, group_cols, plot_dir, tag=""):
    section(f"8. SUBGROUP (FAIRNESS) EVALUATION [{tag}]")
    y_proba = pipe.predict_proba(X_test)[:, 1]
    y_pred = pipe.predict(X_test)
    out = {}
    for col in group_cols:
        if col not in X_test.columns:
            continue
        rows = []
        for val, idx in X_test.groupby(col).groups.items():
            yt, yp, ypr = y_test.loc[idx], y_pred[X_test.index.get_indexer(idx)], y_proba[X_test.index.get_indexer(idx)]
            if len(set(yt)) < 2 or len(yt) < 20:
                continue
            rows.append({
                "group": val, "n": len(yt),
                "roc_auc": roc_auc_score(yt, ypr),
                "f1": f1_score(yt, yp),
            })
        sub_df = pd.DataFrame(rows).sort_values("roc_auc", ascending=False)
        print(f"\nBy {col}:\n{sub_df.to_string(index=False)}")
        out[col] = sub_df.to_dict(orient="records")
    return out


def feature_importance_report(pipe, X_train, y_train, plot_dir, tag=""):
    section(f"9. FEATURE IMPORTANCE [{tag}]")
    prep = pipe.named_steps["prep"]
    clf = pipe.named_steps["clf"]

    feature_names = []
    for name, trans, cols in prep.transformers_:
        if trans == "drop":
            continue
        if trans == "passthrough":
            feature_names.extend(cols)
        elif hasattr(trans, "get_feature_names_out"):
            try:
                feature_names.extend(list(trans.get_feature_names_out(cols)))
            except Exception:
                feature_names.extend(cols)
        else:
            feature_names.extend(cols)

    importances = None
    if hasattr(clf, "feature_importances_"):
        importances = clf.feature_importances_
    elif hasattr(clf, "coef_"):
        importances = np.abs(clf.coef_[0])

    if importances is not None and len(importances) == len(feature_names):
        imp_df = pd.DataFrame({"feature": feature_names, "importance": importances})
        imp_df = imp_df.sort_values("importance", ascending=False)
        fig, ax = plt.subplots(figsize=(7, 6))
        top = imp_df.head(20).sort_values("importance")
        ax.barh(top["feature"], top["importance"])
        ax.set_title(f"Feature Importance (model-native) — {tag}")
        fig.tight_layout()
        fig.savefig(plot_dir / f"12_feature_importance_{tag}.png", dpi=150)
        plt.close(fig)
    else:
        imp_df = pd.DataFrame({"feature": feature_names})
        print("Could not align native importances with feature names; skipping native plot.")

    # Permutation importance (model-agnostic, on transformed test-independent sample)
    try:
        perm = permutation_importance(
            pipe, X_train, y_train, n_repeats=5, random_state=RANDOM_STATE,
            scoring="roc_auc", n_jobs=1
        )
        perm_df = pd.DataFrame({
            "feature": X_train.columns,
            "perm_importance_mean": perm.importances_mean,
            "perm_importance_std": perm.importances_std,
        }).sort_values("perm_importance_mean", ascending=False)
        fig, ax = plt.subplots(figsize=(7, 6))
        top = perm_df.head(15).sort_values("perm_importance_mean")
        ax.barh(top["feature"], top["perm_importance_mean"], xerr=top["perm_importance_std"])
        ax.set_title(f"Permutation Importance (raw input columns) — {tag}")
        fig.tight_layout()
        fig.savefig(plot_dir / f"13_permutation_importance_{tag}.png", dpi=150)
        plt.close(fig)
        print(perm_df.to_string(index=False))
    except Exception as e:
        print(f"Permutation importance skipped: {e}")
        perm_df = pd.DataFrame()

    return imp_df, perm_df


# ---------------------------------------------------------------------------
# Main orchestration
# ---------------------------------------------------------------------------
def run_pipeline(data_path, outdir, include_rating_features=False, sample_frac=None):
    outdir = Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    plot_dir = outdir / "plots"
    plot_dir.mkdir(exist_ok=True)

    log_path = outdir / "run_log.txt"
    log_file = open(log_path, "w")
    sys.stdout = Tee(sys.__stdout__, log_file)

    df = load_data(data_path)
    if sample_frac:
        df = df.sample(frac=sample_frac, random_state=RANDOM_STATE).reset_index(drop=True)
        print(f"Sampled down to {df.shape[0]} rows (sample_frac={sample_frac})")

    df = inspect_target(df)
    run_eda(df, plot_dir)
    df = engineer_features(df)

    target_col = "is_trending_binary"
    all_metrics = {}

    # ---------------- Realistic model (recommended, no leakage) ----------------
    feat_cols = REALISTIC_FEATURES_NUMERIC + REALISTIC_FEATURES_ONEHOT + REALISTIC_FEATURES_TARGETENC
    X = df[feat_cols].copy()
    y = df[target_col].copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    preprocessor = build_preprocessor(
        REALISTIC_FEATURES_NUMERIC, REALISTIC_FEATURES_ONEHOT, REALISTIC_FEATURES_TARGETENC
    )
    cv_results, best_name = compare_models(X_train, y_train, preprocessor, plot_dir, tag="realistic")
    best_pipe, best_params = tune_best_model(best_name, X_train, y_train, preprocessor)
    test_metrics = evaluate_model(best_pipe, X_test, y_test, plot_dir, tag="realistic")
    subgroup_metrics = subgroup_evaluation(
        best_pipe, X_test, y_test, ["gender", "source_market"], plot_dir, tag="realistic"
    )
    imp_df, perm_df = feature_importance_report(best_pipe, X_train, y_train, plot_dir, tag="realistic")

    joblib.dump(best_pipe, outdir / "model_realistic.joblib")
    imp_df.to_csv(outdir / "feature_importance_realistic.csv", index=False)

    all_metrics["realistic"] = {
        "best_model": best_name,
        "best_params": best_params,
        "cv_results": cv_results,
        "test_metrics": {"roc_auc": test_metrics["roc_auc"], "average_precision": test_metrics["average_precision"]},
        "subgroup_metrics": subgroup_metrics,
        "features_used": feat_cols,
    }

    # ---------------- Optional leaky demonstration model ----------------
    if include_rating_features:
        print("\n\n" + "!" * 78)
        print("RUNNING --include_rating_features DEMO MODE.")
        print("This model includes average_rating, which deterministically defines")
        print("the label. Expect near-perfect AUC. This is NOT a usable model — it")
        print("is included only to show what happens when leakage is present.")
        print("!" * 78 + "\n")

        feat_cols_leaky = feat_cols + LEAKY_EXTRA_NUMERIC
        Xl = df[feat_cols_leaky].copy()
        Xl_train, Xl_test, yl_train, yl_test = train_test_split(
            Xl, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
        )
        preprocessor_leaky = build_preprocessor(
            REALISTIC_FEATURES_NUMERIC + LEAKY_EXTRA_NUMERIC,
            REALISTIC_FEATURES_ONEHOT, REALISTIC_FEATURES_TARGETENC
        )
        cv_results_l, best_name_l = compare_models(Xl_train, yl_train, preprocessor_leaky, plot_dir, tag="leaky_demo")
        best_pipe_l, best_params_l = tune_best_model(best_name_l, Xl_train, yl_train, preprocessor_leaky)
        test_metrics_l = evaluate_model(best_pipe_l, Xl_test, yl_test, plot_dir, tag="leaky_demo")

        joblib.dump(best_pipe_l, outdir / "model_leaky_demo.joblib")
        all_metrics["leaky_demo"] = {
            "best_model": best_name_l,
            "best_params": best_params_l,
            "cv_results": cv_results_l,
            "test_metrics": {"roc_auc": test_metrics_l["roc_auc"], "average_precision": test_metrics_l["average_precision"]},
            "features_used": feat_cols_leaky,
            "warning": "Includes average_rating; label is a deterministic threshold on this column.",
        }

    with open(outdir / "metrics.json", "w") as f:
        json.dump(all_metrics, f, indent=2, default=str)

    section("PIPELINE COMPLETE")
    print(f"Realistic model AUC (test): {all_metrics['realistic']['test_metrics']['roc_auc']:.4f}")
    if include_rating_features:
        print(f"Leaky demo model AUC (test): {all_metrics['leaky_demo']['test_metrics']['roc_auc']:.4f}  (inflated by leakage)")
    print(f"\nAll artifacts written to: {outdir.resolve()}")

    sys.stdout = sys.__stdout__
    log_file.close()
    return all_metrics


def parse_args():
    p = argparse.ArgumentParser(description="Fashion trend prediction training pipeline")
    p.add_argument("--data", type=str, required=True, help="Path to merged_fashion_dataset_us_in.csv")
    p.add_argument("--outdir", type=str, default="./outputs", help="Directory to write all outputs")
    p.add_argument("--include_rating_features", action="store_true",
                   help="Also fit a leakage-inclusive demo model (average_rating as a feature)")
    p.add_argument("--sample_frac", type=float, default=None,
                   help="Optional: fraction of rows to sample (speeds up iteration on the full 214k rows)")
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run_pipeline(args.data, args.outdir, args.include_rating_features, args.sample_frac)