# Fashion Trend Prediction — Modeling Pipeline

Trains, tunes, and evaluates a classifier for `is_trending_binary` on
`merged_fashion_dataset_us_in.csv`.

## Read this first: the leakage finding

Your own stats confirm it: **max `average_rating` for "Not trending" = 4.1**,
**min `average_rating` for "Trending" = 4.2**. There's no overlap. That means
`is_trending` isn't something the model *predicts from* `average_rating` — it
*is* `average_rating`, rewritten as a threshold. This matches the "≥4.2"
target definition from your original team proposal.

If you feed `average_rating` in as a feature, every model — logistic
regression included — will hit essentially 100% accuracy. That's not a good
model, it's the model rediscovering arithmetic. It also means the resulting
model would be useless in the real scenario you actually care about:
flagging a product as likely-to-trend *before* it has enough reviews to have
a settled average rating.

So the pipeline trains the **realistic model** by default, using only what's
known at listing time:

```
is_trending ~ gender + individual_category + price_usd + brand +
              source_market + title text features
```

`rating_number` (review count) is kept as a feature — unlike `average_rating`
it's only weakly correlated with the target (~0.03) and isn't deterministic
of it, so it's legitimate (if modest) signal about how established a listing
is, not a leak of the label.

Pass `--include_rating_features` if you also want to fit the leaky version
side-by-side, purely so you can see the contrast in a report or presentation
— every output from that run is clearly labeled `leaky_demo` so it can't be
mistaken for the real result.

## Setup

```bash
pip install -r requirements.txt
```

## Run

```bash
python fashion_trend_pipeline.py --data /path/to/merged_fashion_dataset_us_in.csv
```

Useful flags:
- `--outdir ./outputs` — where all results go (default `./outputs`)
- `--sample_frac 0.3` — train on a random subsample first to iterate faster
  before committing to a run on the full 214k rows
- `--include_rating_features` — also fits the leaky demo model for comparison

On the full 214,318-row file, expect the run (model comparison + tuning +
both evaluations) to take roughly 10–30 minutes on a laptop CPU, mostly spent
in the XGBoost/LightGBM hyperparameter search. Use `--sample_frac` while
you're debugging, then drop it for the final run.

## What it does, step by step

1. **Load & inspect** — shape, dtypes, missing values, duplicate check.
2. **Leakage check** — verifies and prints the rating/target threshold
   relationship described above.
3. **EDA** — target balance, price distribution, trending rate by gender,
   top categories by trending rate, price-vs-trending boxplot, correlation
   heatmap (all saved as PNGs in `outputs/plots/`).
4. **Feature engineering**:
   - Title → length, word count, gender-keyword flags
   - `log1p(price_usd)`, `log1p(rating_number)`
   - Rare brands (< 10 listings) collapsed to `"Other"`
5. **Preprocessing** — built as an `sklearn` `ColumnTransformer`:
   - One-hot encoding for `gender`, `source_market`
   - Target encoding (with smoothing) for `individual_category` and grouped
     `brand`, via `category_encoders.TargetEncoder`, fit *inside* the
     pipeline so it never sees validation/test folds during fitting — this
     avoids the more subtle leakage that comes from computing target
     encodings on the whole dataset before splitting.
6. **Model comparison** — Logistic Regression, Random Forest, XGBoost,
   LightGBM, compared with 5-fold stratified CV on ROC-AUC, F1, accuracy.
7. **Hyperparameter tuning** — `RandomizedSearchCV` (20 iterations, 5-fold CV)
   on whichever model won the comparison.
8. **Test-set evaluation** — classification report, confusion matrix, ROC
   curve, precision-recall curve, calibration curve.
9. **Subgroup evaluation** — ROC-AUC and F1 broken out by gender and by
   source market, so you can see if performance holds up evenly rather than
   being driven by one subgroup.
10. **Feature importance** — native importances from the tree model, plus
    model-agnostic permutation importance on the raw input columns (more
    trustworthy than native importances for high-cardinality categoricals).

## Outputs

```
outputs/
├── plots/                          all PNG charts
├── metrics.json                    every metric from every stage
├── model_realistic.joblib          the deployable pipeline (preprocessing + model)
├── model_leaky_demo.joblib         (only if --include_rating_features)
├── feature_importance_realistic.csv
└── run_log.txt                     full console output, saved for your report
```

## Using the saved model on new products

```python
import joblib
import pandas as pd

pipe = joblib.load("outputs/model_realistic.joblib")

new_products = pd.DataFrame([{
    "price_usd": 24.99,
    "log_price": None,          # recomputed below
    "log_rating_count": 0.0,    # brand-new listing, no reviews yet
    "title_length": 42,
    "title_word_count": 7,
    "kw_women": 1, "kw_men": 0, "kw_kids": 0,
    "gender": "Women",
    "source_market": "US",
    "individual_category": "leggings",
    "brand_grouped": "Nike",
}])
import numpy as np
new_products["log_price"] = np.log1p(new_products["price_usd"])

proba = pipe.predict_proba(new_products)[:, 1]
print(f"P(trending) = {proba[0]:.3f}")
```

## Notes on tuning further

- Swap in `Optuna` for smarter search if `RandomizedSearchCV`'s 20 iterations
  aren't enough — the pipeline structure doesn't need to change.
- If the realistic model's AUC still looks low on your real data,
  that itself is informative: it means gender/category/price/brand at
  listing time genuinely don't determine whether a product ends up highly
  rated — sensible, since rating quality mostly reflects the product's
  quality and customer experience, not its listing metadata. Report that
  finding honestly rather than reaching for `average_rating` to inflate it.