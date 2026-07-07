#!/usr/bin/env Rscript
# =============================================================================
# Fashion Trend Prediction -- End-to-End Modeling Pipeline (R port)
# =============================================================================
#
# Predicts `is_trending_binary` for the merged US/IN fashion dataset described
# in `merged_fashion_dataset_us_in.csv` (columns: parent_asin, title, gender,
# individual_category, price_usd, brand, average_rating, rating_number,
# is_trending, source_market, is_trending_binary).
#
# IMPORTANT -- DATA LEAKAGE WARNING
# ---------------------------------
# In this dataset `is_trending` is *defined* as a threshold on `average_rating`
# (rating >= 4.2 -> Yes, see the perfect split at 4.2 in the "Rating by
# Trending Status" table: max rating for "No" is 4.1, min rating for "Yes" is
# 4.2). That means `average_rating` is not a predictive feature -- it IS the
# label in disguise. Feeding it into the model produces a trivial ~100%
# accuracy classifier that has learned nothing except "is average_rating >=
# 4.2", which is useless for the real-world task (predicting trend potential
# for a product BEFORE it has accumulated enough ratings to know its
# average).
#
# This script therefore trains the REALISTIC model by default:
#     is_trending ~ gender + individual_category + price_usd + brand +
#                   source_market + title-derived features
# i.e. everything you would know about a product at LISTING time, before
# reviews come in. `average_rating` is excluded from features entirely.
# `rating_number` (review volume) is kept -- it is only weakly correlated
# with the target (~0.03) and is not deterministic of it, so it is
# legitimate signal (mature, well-exposed listings), not leakage.
#
# Pass --include_rating_features to also fit the leaky/demonstration model
# for comparison purposes (clearly labeled as such in all outputs).
#
# Usage
# -----
#     Rscript fashion_trend_pipeline.R --data /path/to/merged_fashion_dataset_us_in.csv
#
# Outputs (written to --outdir, default ./outputs):
#     plots/*.png                  EDA + evaluation charts
#     metrics.json                  all metrics for every model
#     model_realistic.rds           best realistic-mode pipeline (encoders+model)
#     model_leaky_demo.rds          (only if --include_rating_features)
#     feature_importance_realistic.csv
#     run_log.txt                   full console log
# =============================================================================

suppressPackageStartupMessages({
  library(optparse)     # argparse equivalent
  library(data.table)   # fast CSV IO
  library(dplyr)
  library(stringr)
  library(tidyr)
  library(ggplot2)
  library(caret)        # createFolds (stratified), confusionMatrix, dummyVars
  library(randomForest)
  library(xgboost)
  library(lightgbm)
  library(pROC)         # roc_auc
  library(PRROC)        # average precision (PR-AUC)
  library(jsonlite)     # metrics.json
  library(glue)
})

RANDOM_STATE <- 42
set.seed(RANDOM_STATE)
theme_set(theme_minimal(base_size = 11))

# -----------------------------------------------------------------------------
# Logging helper: tee cat()/print() output to both console and a log file
# (R equivalent of the Python `Tee` class, implemented via sink(split = TRUE))
# -----------------------------------------------------------------------------
start_tee <- function(log_path) {
  con <- file(log_path, open = "wt")
  sink(con, split = TRUE)          # stdout mirrored to console + file
  sink(con, type = "message", append = TRUE)
  con
}

stop_tee <- function(con) {
  sink(type = "message")
  sink()
  close(con)
}

section <- function(title) {
  bar <- paste(rep("=", 78), collapse = "")
  cat(sprintf("\n%s\n%s\n%s\n", bar, title, bar))
}

# -----------------------------------------------------------------------------
# 1. Load & inspect
# -----------------------------------------------------------------------------
load_data <- function(path) {
  section("1. LOADING DATA")
  df <- as.data.frame(data.table::fread(path, showProgress = FALSE))
  cat(sprintf("Shape: %d rows x %d cols\n", nrow(df), ncol(df)))
  cat("Columns:", paste(colnames(df), collapse = ", "), "\n")
  cat("\nMissing values per column:\n")
  print(colSums(is.na(df)))
  cat("\nDtypes:\n")
  print(sapply(df, class))
  if ("parent_asin" %in% colnames(df)) {
    dup <- sum(duplicated(df$parent_asin))
  } else {
    dup <- sum(duplicated(df))
  }
  cat(sprintf("\nDuplicate rows (by id): %d\n", dup))
  df
}

inspect_target <- function(df, target_col = "is_trending_binary") {
  section("2. TARGET INSPECTION & LEAKAGE CHECK")
  prop <- prop.table(table(df[[target_col]]))
  cat("proportion\n")
  print(prop)

  if ("average_rating" %in% colnames(df)) {
    g <- df %>%
      group_by(.data[[target_col]]) %>%
      summarise(
        mean = mean(average_rating, na.rm = TRUE),
        min  = min(average_rating, na.rm = TRUE),
        max  = max(average_rating, na.rm = TRUE),
        count = n(),
        .groups = "drop"
      )
    cat("\naverage_rating by target class (checking for a deterministic threshold):\n")
    print(g)

    no_max  <- max(df$average_rating[df[[target_col]] == 0], na.rm = TRUE)
    yes_min <- min(df$average_rating[df[[target_col]] == 1], na.rm = TRUE)
    if (no_max < yes_min) {
      cat(sprintf(
        "\n*** LEAKAGE CONFIRMED: max(rating | not trending)=%.4f < min(rating | trending)=%.4f. The target is a deterministic threshold on average_rating. average_rating and any feature engineered purely from it will be EXCLUDED from the realistic model's feature set. ***\n",
        no_max, yes_min
      ))
    }
  }
  df
}

# -----------------------------------------------------------------------------
# 2. EDA plots
# -----------------------------------------------------------------------------
run_eda <- function(df, plot_dir, target_col = "is_trending_binary") {
  section("3. EXPLORATORY DATA ANALYSIS")
  dir.create(plot_dir, recursive = TRUE, showWarnings = FALSE)

  df_plot <- df
  df_plot[[target_col]] <- factor(df_plot[[target_col]], levels = c(0, 1),
                                   labels = c("No (0)", "Yes (1)"))

  # Target balance
  p <- ggplot(df_plot, aes(x = .data[[target_col]], fill = .data[[target_col]])) +
    geom_bar() +
    scale_fill_manual(values = c("No (0)" = "#d9534f", "Yes (1)" = "#5cb85c")) +
    labs(title = "Target balance: is_trending", x = NULL, y = "count") +
    theme(legend.position = "none")
  ggsave(file.path(plot_dir, "01_target_balance.png"), p, width = 5, height = 4, dpi = 150)

  # Price distribution (log scale)
  if ("price_usd" %in% colnames(df)) {
    p <- ggplot(df, aes(x = log1p(price_usd))) +
      geom_histogram(bins = 60, aes(y = after_stat(density)), fill = "#4C72B0", alpha = 0.8) +
      geom_density(color = "black") +
      labs(title = "Log(1+price_usd) distribution", x = "log1p(price_usd)")
    ggsave(file.path(plot_dir, "02_log_price_distribution.png"), p, width = 6, height = 4, dpi = 150)
  }

  # Gender vs trending rate
  if ("gender" %in% colnames(df)) {
    g <- df %>%
      group_by(gender) %>%
      summarise(rate = mean(.data[[target_col]]), .groups = "drop") %>%
      arrange(rate)
    p <- ggplot(g, aes(x = rate, y = reorder(gender, rate))) +
      geom_col(fill = "#4C72B0") +
      labs(title = "Trending rate by gender", x = "trending rate", y = NULL)
    ggsave(file.path(plot_dir, "03_trending_rate_by_gender.png"), p, width = 5, height = 4, dpi = 150)
  }

  # Top categories by trending rate (min sample size filter)
  if ("individual_category" %in% colnames(df)) {
    cat_stats <- df %>%
      group_by(individual_category) %>%
      summarise(mean = mean(.data[[target_col]]), count = n(), .groups = "drop") %>%
      filter(count >= 100) %>%
      arrange(desc(mean)) %>%
      head(20)
    p <- ggplot(cat_stats, aes(x = mean, y = reorder(individual_category, mean))) +
      geom_col(fill = "#4C72B0") +
      labs(title = "Top 20 categories by trending rate (count >= 100)",
           x = "trending rate", y = NULL)
    ggsave(file.path(plot_dir, "04_top_categories_trending_rate.png"), p, width = 7, height = 6, dpi = 150)
  }

  # Price by trending status (boxplot, log scale)
  if ("price_usd" %in% colnames(df)) {
    p <- ggplot(df_plot, aes(x = .data[[target_col]], y = log1p(price_usd))) +
      geom_boxplot(fill = "#8172B2") +
      labs(title = "Log price by trending status", x = NULL, y = "log_price")
    ggsave(file.path(plot_dir, "05_price_by_trending.png"), p, width = 5, height = 4, dpi = 150)
  }

  # Correlation heatmap (numeric, excluding rating features handled separately)
  numeric_cols <- intersect(c("price_usd", "rating_number", target_col), colnames(df))
  if (length(numeric_cols) > 1) {
    cor_mat <- cor(df[, numeric_cols], use = "pairwise.complete.obs")
    cor_df <- as.data.frame(as.table(cor_mat))
    colnames(cor_df) <- c("Var1", "Var2", "value")
    p <- ggplot(cor_df, aes(Var1, Var2, fill = value)) +
      geom_tile() +
      geom_text(aes(label = sprintf("%.3f", value))) +
      scale_fill_gradient2(low = "blue", mid = "white", high = "red", midpoint = 0) +
      labs(title = "Correlation (features actually used, no rating leakage)", x = NULL, y = NULL)
    ggsave(file.path(plot_dir, "06_correlation_heatmap.png"), p, width = 5, height = 4, dpi = 150)
  }

  cat(sprintf("EDA plots saved to %s\n", plot_dir))
}

# -----------------------------------------------------------------------------
# 3. Feature engineering
# -----------------------------------------------------------------------------
engineer_features <- function(df, rare_brand_threshold = 10) {
  section("4. FEATURE ENGINEERING")

  # --- Title-derived features (safe: known at listing time) ---
  if ("title" %in% colnames(df)) {
    title_chr   <- as.character(df$title)
    title_lower <- str_to_lower(title_chr)
    df$title_length     <- nchar(title_chr)
    df$title_word_count <- lengths(str_split(title_chr, "\\s+"))
    df$kw_women <- as.integer(str_detect(title_lower, "women|woman|ladies"))
    df$kw_men   <- as.integer(str_detect(title_lower, "\\bmen\\b|\\bman\\b|male"))
    df$kw_kids  <- as.integer(str_detect(title_lower, "kids|children|boy|girl|youth"))
  } else {
    df$title_length     <- 0
    df$title_word_count <- 0
    df$kw_women <- df$kw_men <- df$kw_kids <- 0
  }

  # --- Price transform ---
  df$log_price <- log1p(df$price_usd)

  # --- Review-volume transform (kept -- weak, non-deterministic signal) ---
  if ("rating_number" %in% colnames(df)) {
    df$log_rating_count <- log1p(df$rating_number)
  } else {
    df$log_rating_count <- 0
  }

  # --- Brand grouping: collapse rare brands into "Other" ---
  if ("brand" %in% colnames(df)) {
    counts <- table(df$brand)
    rare <- names(counts[counts < rare_brand_threshold])
    df$brand_grouped <- ifelse(df$brand %in% rare, "Other", df$brand)
    cat(sprintf("Brands: %d raw -> %d after grouping rare (<%d) into 'Other'\n",
                length(unique(df$brand)), length(unique(df$brand_grouped)), rare_brand_threshold))
  } else {
    df$brand_grouped <- "Unknown"
  }

  cat("Engineered columns added: title_length, title_word_count, kw_women, kw_men, ",
      "kw_kids, log_price, log_rating_count, brand_grouped\n")
  df
}

REALISTIC_FEATURES_NUMERIC   <- c("price_usd", "log_price", "log_rating_count",
                                   "title_length", "title_word_count",
                                   "kw_women", "kw_men", "kw_kids")
REALISTIC_FEATURES_ONEHOT    <- c("gender", "source_market")
REALISTIC_FEATURES_TARGETENC <- c("individual_category", "brand_grouped")
LEAKY_EXTRA_NUMERIC          <- c("average_rating")  # only used in --include_rating_features demo mode

# -----------------------------------------------------------------------------
# Preprocessor: passthrough numeric, one-hot low-cardinality cats,
# target-encode high-cardinality cats. Fit only ever happens on the training
# fold, so target encoding cannot leak across CV folds.
# (R equivalent of the Python sklearn ColumnTransformer.)
# -----------------------------------------------------------------------------
build_preprocessor <- function(numeric_cols, onehot_cols, targetenc_cols) {
  list(numeric_cols = numeric_cols, onehot_cols = onehot_cols,
       targetenc_cols = targetenc_cols, fitted = FALSE)
}

fit_preprocessor <- function(prep, X_train, y_train, smoothing = 10) {
  # One-hot: store factor levels seen in training
  onehot_levels <- list()
  for (col in prep$onehot_cols) {
    onehot_levels[[col]] <- sort(unique(as.character(X_train[[col]])))
  }

  # Target encoding: per-level smoothed mean of y_train
  targetenc_maps <- list()
  global_mean <- mean(y_train)
  for (col in prep$targetenc_cols) {
    stats <- data.frame(level = as.character(X_train[[col]]), y = y_train) %>%
      group_by(level) %>%
      summarise(n = n(), mean_y = mean(y), .groups = "drop") %>%
      mutate(encoded = (n * mean_y + smoothing * global_mean) / (n + smoothing))
    targetenc_maps[[col]] <- stats
  }

  prep$onehot_levels  <- onehot_levels
  prep$targetenc_maps <- targetenc_maps
  prep$global_mean    <- global_mean
  prep$fitted <- TRUE
  prep
}

transform_preprocessor <- function(prep, X) {
  stopifnot(prep$fitted)
  out <- as.data.frame(X[, prep$numeric_cols, drop = FALSE])

  # One-hot columns: handle_unknown = "ignore" -> unseen levels become all-zero
  for (col in prep$onehot_cols) {
    levels_seen <- prep$onehot_levels[[col]]
    for (lv in levels_seen) {
      out[[paste0(col, "_", lv)]] <- as.integer(as.character(X[[col]]) == lv)
    }
  }

  # Target-encoded columns: unseen levels fall back to global mean
  for (col in prep$targetenc_cols) {
    map <- prep$targetenc_maps[[col]]
    idx <- match(as.character(X[[col]]), map$level)
    encoded <- map$encoded[idx]
    encoded[is.na(encoded)] <- prep$global_mean
    out[[paste0(col, "_te")]] <- encoded
  }

  as.matrix(out)
}

# -----------------------------------------------------------------------------
# 4. Model zoo + CV comparison
# -----------------------------------------------------------------------------
# Each entry: fit(Xmat, y, weights, params) -> model object
#             predict_proba(model, Xmat) -> numeric vector of P(y = 1)
get_model_zoo <- function() {
  list(
    LogisticRegression = list(
      fit = function(Xmat, y, weights, params = list()) {
        d <- as.data.frame(Xmat)
        d$y <- y
        glm(y ~ ., data = d, family = binomial(), weights = weights)
      },
      predict_proba = function(model, Xmat) {
        d <- as.data.frame(Xmat)
        predict(model, newdata = d, type = "response")
      },
      default_params = list()
    ),
    RandomForest = list(
      fit = function(Xmat, y, weights, params = list(ntree = 400, mtry = NULL, nodesize = 2)) {
        yf <- factor(y, levels = c(0, 1))
        cw <- c(`0` = sum(weights[y == 1]) / sum(weights), `1` = sum(weights[y == 0]) / sum(weights))
        mtry <- if (is.null(params$mtry)) max(floor(sqrt(ncol(Xmat))), 1) else params$mtry
        randomForest(x = Xmat, y = yf, ntree = params$ntree, mtry = mtry,
                     nodesize = params$nodesize, classwt = cw)
      },
      predict_proba = function(model, Xmat) {
        predict(model, newdata = Xmat, type = "prob")[, "1"]
      },
      default_params = list(ntree = 400, mtry = NULL, nodesize = 2)
    ),
    XGBoost = list(
      fit = function(Xmat, y, weights, params = list(nrounds = 400, max_depth = 6,
                                                      eta = 0.05, subsample = 0.8,
                                                      colsample_bytree = 0.8, min_child_weight = 1)) {
        dtrain <- xgb.DMatrix(data = Xmat, label = y, weight = weights)
        xgb.train(
          params = list(objective = "binary:logistic", eval_metric = "logloss",
                        max_depth = params$max_depth, eta = params$eta,
                        subsample = params$subsample, colsample_bytree = params$colsample_bytree,
                        min_child_weight = params$min_child_weight),
          data = dtrain, nrounds = params$nrounds, verbose = 0
        )
      },
      predict_proba = function(model, Xmat) {
        predict(model, newdata = xgb.DMatrix(data = Xmat))
      },
      default_params = list(nrounds = 400, max_depth = 6, eta = 0.05,
                             subsample = 0.8, colsample_bytree = 0.8, min_child_weight = 1)
    ),
    LightGBM = list(
      fit = function(Xmat, y, weights, params = list(nrounds = 400, num_leaves = 31,
                                                      learning_rate = 0.05, subsample = 0.8,
                                                      colsample_bytree = 0.8)) {
        dtrain <- lgb.Dataset(data = Xmat, label = y, weight = weights)
        lgb.train(
          params = list(objective = "binary", metric = "auc",
                        num_leaves = params$num_leaves, learning_rate = params$learning_rate,
                        bagging_fraction = params$subsample, feature_fraction = params$colsample_bytree,
                        verbosity = -1),
          data = dtrain, nrounds = params$nrounds
        )
      },
      predict_proba = function(model, Xmat) {
        predict(model, Xmat)
      },
      default_params = list(nrounds = 400, num_leaves = 31, learning_rate = 0.05,
                             subsample = 0.8, colsample_bytree = 0.8)
    )
  )
}

class_weights_balanced <- function(y) {
  n <- length(y)
  tab <- table(y)
  w <- n / (length(tab) * tab)
  as.numeric(w[as.character(y)])
}

f1_from_preds <- function(y_true, y_pred) {
  tp <- sum(y_pred == 1 & y_true == 1)
  fp <- sum(y_pred == 1 & y_true == 0)
  fn <- sum(y_pred == 0 & y_true == 1)
  prec <- if ((tp + fp) == 0) 0 else tp / (tp + fp)
  rec  <- if ((tp + fn) == 0) 0 else tp / (tp + fn)
  if ((prec + rec) == 0) 0 else 2 * prec * rec / (prec + rec)
}

compare_models <- function(X_train, y_train, prep, plot_dir, tag = "") {
  section(sprintf("5. MODEL COMPARISON (5-fold CV, ROC-AUC) [%s]", tag))

  folds <- caret::createFolds(factor(y_train), k = 5, list = TRUE, returnTrain = FALSE)
  zoo <- get_model_zoo()
  results <- list()

  for (name in names(zoo)) {
    aucs <- c(); f1s <- c(); accs <- c()
    for (fold in folds) {
      X_tr <- X_train[-fold, , drop = FALSE]; y_tr <- y_train[-fold]
      X_ho <- X_train[fold, , drop = FALSE];  y_ho <- y_train[fold]

      prep_fit <- fit_preprocessor(prep, X_tr, y_tr)
      Xtr_mat <- transform_preprocessor(prep_fit, X_tr)
      Xho_mat <- transform_preprocessor(prep_fit, X_ho)

      w <- class_weights_balanced(y_tr)
      model <- zoo[[name]]$fit(Xtr_mat, y_tr, w, zoo[[name]]$default_params)
      proba <- zoo[[name]]$predict_proba(model, Xho_mat)
      pred  <- as.integer(proba >= 0.5)

      aucs <- c(aucs, as.numeric(pROC::auc(pROC::roc(y_ho, proba, quiet = TRUE))))
      f1s  <- c(f1s, f1_from_preds(y_ho, pred))
      accs <- c(accs, mean(pred == y_ho))
    }
    results[[name]] <- list(
      roc_auc_mean = mean(aucs), roc_auc_std = sd(aucs),
      f1_mean = mean(f1s), accuracy_mean = mean(accs)
    )
    cat(sprintf("%-18s  AUC=%.4f (+/-%.4f)  F1=%.4f  Acc=%.4f\n",
                name, results[[name]]$roc_auc_mean, results[[name]]$roc_auc_std,
                results[[name]]$f1_mean, results[[name]]$accuracy_mean))
  }

  # Comparison bar chart
  comp_df <- data.frame(
    model = names(results),
    auc   = sapply(results, function(r) r$roc_auc_mean),
    sd    = sapply(results, function(r) r$roc_auc_std)
  )
  p <- ggplot(comp_df, aes(x = model, y = auc, fill = model)) +
    geom_col() +
    geom_errorbar(aes(ymin = auc - sd, ymax = auc + sd), width = 0.2) +
    coord_cartesian(ylim = c(0.5, 1.0)) +
    labs(title = paste("Model comparison —", tag), y = "CV ROC-AUC", x = NULL) +
    theme(legend.position = "none", axis.text.x = element_text(angle = 20, hjust = 1))
  ggsave(file.path(plot_dir, sprintf("07_model_comparison_%s.png", tag)), p, width = 6, height = 4, dpi = 150)

  best_name <- names(results)[which.max(sapply(results, function(r) r$roc_auc_mean))]
  cat(sprintf("\nBest model by CV ROC-AUC: %s\n", best_name))
  list(results = results, best_name = best_name)
}

# -----------------------------------------------------------------------------
# 5. Hyperparameter tuning (random search over the same grids as the Python
# version, evaluated with the same 5-fold stratified CV)
# -----------------------------------------------------------------------------
param_grids <- list(
  XGBoost = list(
    nrounds = c(200, 400, 600), max_depth = c(4, 6, 8),
    eta = c(0.03, 0.05, 0.1), subsample = c(0.7, 0.8, 1.0),
    colsample_bytree = c(0.6, 0.8, 1.0), min_child_weight = c(1, 3, 5)
  ),
  LightGBM = list(
    nrounds = c(200, 400, 600), num_leaves = c(31, 63, 127),
    learning_rate = c(0.03, 0.05, 0.1), subsample = c(0.7, 0.8, 1.0),
    colsample_bytree = c(0.6, 0.8, 1.0)
  ),
  RandomForest = list(
    ntree = c(300, 500, 800), mtry = c(NA, NA, NA),  # NA -> use default sqrt(p)
    nodesize = c(1, 2, 4)
  ),
  LogisticRegression = list()  # no hyperparameters searched (matches penalty="l2" only)
)

sample_param_combo <- function(grid) {
  if (length(grid) == 0) return(list())
  lapply(grid, function(v) sample(v, 1))
}

tune_best_model <- function(best_name, X_train, y_train, prep, n_iter = 20) {
  section(sprintf("6. HYPERPARAMETER TUNING (%s)", best_name))
  zoo <- get_model_zoo()
  grid <- param_grids[[best_name]]

  if (length(grid) == 0) {
    prep_fit <- fit_preprocessor(prep, X_train, y_train)
    Xmat <- transform_preprocessor(prep_fit, X_train)
    w <- class_weights_balanced(y_train)
    model <- zoo[[best_name]]$fit(Xmat, y_train, w, zoo[[best_name]]$default_params)
    return(list(prep = prep_fit, model = model, model_name = best_name, params = list()))
  }

  folds <- caret::createFolds(factor(y_train), k = 5, list = TRUE, returnTrain = FALSE)
  best_score <- -Inf
  best_params <- NULL

  for (i in seq_len(n_iter)) {
    params <- sample_param_combo(grid)
    aucs <- c()
    for (fold in folds) {
      X_tr <- X_train[-fold, , drop = FALSE]; y_tr <- y_train[-fold]
      X_ho <- X_train[fold, , drop = FALSE];  y_ho <- y_train[fold]
      prep_fit <- fit_preprocessor(prep, X_tr, y_tr)
      Xtr_mat <- transform_preprocessor(prep_fit, X_tr)
      Xho_mat <- transform_preprocessor(prep_fit, X_ho)
      w <- class_weights_balanced(y_tr)
      model <- zoo[[best_name]]$fit(Xtr_mat, y_tr, w, params)
      proba <- zoo[[best_name]]$predict_proba(model, Xho_mat)
      aucs <- c(aucs, as.numeric(pROC::auc(pROC::roc(y_ho, proba, quiet = TRUE))))
    }
    score <- mean(aucs)
    cat(sprintf("  [%2d/%2d] params=%s  CV AUC=%.4f\n", i, n_iter,
                paste(names(params), unlist(params), sep = "=", collapse = ", "), score))
    if (score > best_score) {
      best_score <- score
      best_params <- params
    }
  }

  cat(sprintf("Best params: %s\n", paste(names(best_params), unlist(best_params), sep = "=", collapse = ", ")))
  cat(sprintf("Best CV ROC-AUC: %.4f\n", best_score))

  prep_fit <- fit_preprocessor(prep, X_train, y_train)
  Xmat <- transform_preprocessor(prep_fit, X_train)
  w <- class_weights_balanced(y_train)
  final_model <- zoo[[best_name]]$fit(Xmat, y_train, w, best_params)

  list(prep = prep_fit, model = final_model, model_name = best_name, params = best_params)
}

# -----------------------------------------------------------------------------
# 6. Final evaluation
# -----------------------------------------------------------------------------
evaluate_model <- function(pipe, X_test, y_test, plot_dir, tag = "") {
  section(sprintf("7. FINAL TEST-SET EVALUATION [%s]", tag))
  zoo <- get_model_zoo()
  Xmat <- transform_preprocessor(pipe$prep, X_test)
  y_proba <- zoo[[pipe$model_name]]$predict_proba(pipe$model, Xmat)
  y_pred  <- as.integer(y_proba >= 0.5)

  cm <- caret::confusionMatrix(factor(y_pred, levels = c(0, 1)),
                                factor(y_test, levels = c(0, 1)), positive = "1")
  print(cm)

  auc <- as.numeric(pROC::auc(pROC::roc(y_test, y_proba, quiet = TRUE)))
  pr  <- PRROC::pr.curve(scores.class0 = y_proba[y_test == 1],
                         scores.class1 = y_proba[y_test == 0], curve = TRUE)
  ap  <- pr$auc.integral
  cat(sprintf("ROC-AUC: %.4f   Average Precision: %.4f\n", auc, ap))

  # Confusion matrix plot
  cm_df <- as.data.frame(cm$table)
  p <- ggplot(cm_df, aes(x = Reference, y = Prediction, fill = Freq)) +
    geom_tile() + geom_text(aes(label = Freq)) +
    scale_fill_gradient(low = "white", high = "#4C72B0") +
    scale_x_discrete(labels = c("No", "Yes")) +
    scale_y_discrete(labels = c("No", "Yes")) +
    labs(title = paste("Confusion Matrix —", tag))
  ggsave(file.path(plot_dir, sprintf("08_confusion_matrix_%s.png", tag)), p, width = 5, height = 4, dpi = 150)

  # ROC curve
  roc_obj <- pROC::roc(y_test, y_proba, quiet = TRUE)
  roc_df <- data.frame(fpr = 1 - roc_obj$specificities, tpr = roc_obj$sensitivities)
  p <- ggplot(roc_df, aes(fpr, tpr)) +
    geom_line(color = "#4C72B0") +
    geom_abline(slope = 1, intercept = 0, linetype = "dashed", alpha = 0.5) +
    labs(title = paste("ROC Curve —", tag), x = "False Positive Rate", y = "True Positive Rate",
         subtitle = sprintf("AUC = %.3f", auc))
  ggsave(file.path(plot_dir, sprintf("09_roc_curve_%s.png", tag)), p, width = 5, height = 4, dpi = 150)

  # Precision-Recall curve
  pr_df <- as.data.frame(pr$curve)
  colnames(pr_df) <- c("recall", "precision", "threshold")
  p <- ggplot(pr_df, aes(recall, precision)) +
    geom_line(color = "#DD8452") +
    labs(title = paste("Precision-Recall Curve —", tag), x = "Recall", y = "Precision",
         subtitle = sprintf("AP = %.3f", ap))
  ggsave(file.path(plot_dir, sprintf("10_pr_curve_%s.png", tag)), p, width = 5, height = 4, dpi = 150)

  # Calibration curve (quantile bins, matches sklearn calibration_curve(strategy="quantile"))
  n_bins <- 10
  calib_df <- data.frame(y = y_test, p = y_proba) %>%
    mutate(bin = ntile(p, n_bins)) %>%
    group_by(bin) %>%
    summarise(mean_pred = mean(p), frac_pos = mean(y), .groups = "drop")
  p <- ggplot(calib_df, aes(mean_pred, frac_pos)) +
    geom_point() + geom_line() +
    geom_abline(slope = 1, intercept = 0, linetype = "dashed", alpha = 0.5) +
    labs(title = paste("Calibration Curve —", tag),
         x = "Mean predicted probability", y = "Fraction of positives")
  ggsave(file.path(plot_dir, sprintf("11_calibration_curve_%s.png", tag)), p, width = 5, height = 4, dpi = 150)

  list(roc_auc = auc, average_precision = ap, confusion_matrix = cm$table,
       classification_report = cm$byClass)
}

subgroup_evaluation <- function(pipe, X_test, y_test, group_cols, plot_dir, tag = "") {
  section(sprintf("8. SUBGROUP (FAIRNESS) EVALUATION [%s]", tag))
  zoo <- get_model_zoo()
  Xmat <- transform_preprocessor(pipe$prep, X_test)
  y_proba <- zoo[[pipe$model_name]]$predict_proba(pipe$model, Xmat)
  y_pred  <- as.integer(y_proba >= 0.5)

  out <- list()
  for (col in group_cols) {
    if (!(col %in% colnames(X_test))) next
    groups <- unique(X_test[[col]])
    rows <- list()
    for (val in groups) {
      idx <- which(X_test[[col]] == val)
      yt <- y_test[idx]; yp <- y_pred[idx]; ypr <- y_proba[idx]
      if (length(unique(yt)) < 2 || length(yt) < 20) next
      rows[[length(rows) + 1]] <- data.frame(
        group = val, n = length(yt),
        roc_auc = as.numeric(pROC::auc(pROC::roc(yt, ypr, quiet = TRUE))),
        f1 = f1_from_preds(yt, yp)
      )
    }
    sub_df <- if (length(rows) > 0) dplyr::bind_rows(rows) %>% arrange(desc(roc_auc)) else data.frame()
    cat(sprintf("\nBy %s:\n", col))
    print(sub_df)
    out[[col]] <- sub_df
  }
  out
}

feature_importance_report <- function(pipe, X_train, y_train, plot_dir, tag = "") {
  section(sprintf("9. FEATURE IMPORTANCE [%s]", tag))
  zoo <- get_model_zoo()
  Xmat <- transform_preprocessor(pipe$prep, X_train)
  feature_names <- colnames(Xmat)
  model <- pipe$model

  imp_df <- data.frame(feature = character(), importance = numeric())
  if (pipe$model_name == "RandomForest") {
    imp <- randomForest::importance(model)[, 1]
    imp_df <- data.frame(feature = names(imp), importance = as.numeric(imp))
  } else if (pipe$model_name == "XGBoost") {
    imp <- xgboost::xgb.importance(feature_names = feature_names, model = model)
    imp_df <- data.frame(feature = imp$Feature, importance = imp$Gain)
  } else if (pipe$model_name == "LightGBM") {
    imp <- lightgbm::lgb.importance(model)
    imp_df <- data.frame(feature = imp$Feature, importance = imp$Gain)
  } else if (pipe$model_name == "LogisticRegression") {
    coefs <- coef(model)[-1]  # drop intercept
    imp_df <- data.frame(feature = names(coefs), importance = abs(coefs))
  }

  if (nrow(imp_df) > 0) {
    imp_df <- imp_df %>% arrange(desc(importance))
    top <- head(imp_df, 20) %>% arrange(importance)
    p <- ggplot(top, aes(x = importance, y = reorder(feature, importance))) +
      geom_col(fill = "#4C72B0") +
      labs(title = paste("Feature Importance (model-native) —", tag), x = NULL, y = NULL)
    ggsave(file.path(plot_dir, sprintf("12_feature_importance_%s.png", tag)), p, width = 7, height = 6, dpi = 150)
  } else {
    cat("Could not compute native importances; skipping native plot.\n")
  }

  # Permutation importance (model-agnostic, on raw input columns)
  perm_df <- tryCatch({
    baseline_proba <- zoo[[pipe$model_name]]$predict_proba(model, Xmat)
    baseline_auc <- as.numeric(pROC::auc(pROC::roc(y_train, baseline_proba, quiet = TRUE)))
    raw_cols <- colnames(X_train)
    n_repeats <- 5
    rows <- list()
    for (col in raw_cols) {
      drops <- c()
      for (r in seq_len(n_repeats)) {
        X_perm <- X_train
        X_perm[[col]] <- sample(X_perm[[col]])
        prep_perm <- pipe$prep  # already fitted; only transform changes
        Xmat_perm <- transform_preprocessor(prep_perm, X_perm)
        proba_perm <- zoo[[pipe$model_name]]$predict_proba(model, Xmat_perm)
        auc_perm <- as.numeric(pROC::auc(pROC::roc(y_train, proba_perm, quiet = TRUE)))
        drops <- c(drops, baseline_auc - auc_perm)
      }
      rows[[length(rows) + 1]] <- data.frame(
        feature = col, perm_importance_mean = mean(drops), perm_importance_std = sd(drops)
      )
    }
    df_out <- dplyr::bind_rows(rows) %>% arrange(desc(perm_importance_mean))

    top <- head(df_out, 15) %>% arrange(perm_importance_mean)
    p <- ggplot(top, aes(x = perm_importance_mean, y = reorder(feature, perm_importance_mean))) +
      geom_col(fill = "#55A868") +
      geom_errorbarh(aes(xmin = perm_importance_mean - perm_importance_std,
                          xmax = perm_importance_mean + perm_importance_std), height = 0.2) +
      labs(title = paste("Permutation Importance (raw input columns) —", tag), x = NULL, y = NULL)
    ggsave(file.path(plot_dir, sprintf("13_permutation_importance_%s.png", tag)), p, width = 7, height = 6, dpi = 150)
    print(df_out)
    df_out
  }, error = function(e) {
    cat(sprintf("Permutation importance skipped: %s\n", conditionMessage(e)))
    data.frame()
  })

  list(imp_df = imp_df, perm_df = perm_df)
}

# -----------------------------------------------------------------------------
# Main orchestration
# -----------------------------------------------------------------------------
run_pipeline <- function(data_path, outdir, include_rating_features = FALSE, sample_frac = NULL) {
  dir.create(outdir, recursive = TRUE, showWarnings = FALSE)
  plot_dir <- file.path(outdir, "plots")
  dir.create(plot_dir, recursive = TRUE, showWarnings = FALSE)

  log_path <- file.path(outdir, "run_log.txt")
  con <- start_tee(log_path)
  on.exit(stop_tee(con), add = TRUE)

  df <- load_data(data_path)
  if (!is.null(sample_frac)) {
    set.seed(RANDOM_STATE)
    df <- df[sample(seq_len(nrow(df)), size = floor(nrow(df) * sample_frac)), ]
    cat(sprintf("Sampled down to %d rows (sample_frac=%s)\n", nrow(df), sample_frac))
  }

  df <- inspect_target(df)
  run_eda(df, plot_dir)
  df <- engineer_features(df)

  target_col <- "is_trending_binary"
  all_metrics <- list()

  # ---------------- Realistic model (recommended, no leakage) ----------------
  feat_cols <- c(REALISTIC_FEATURES_NUMERIC, REALISTIC_FEATURES_ONEHOT, REALISTIC_FEATURES_TARGETENC)
  X <- df[, feat_cols]
  y <- df[[target_col]]

  set.seed(RANDOM_STATE)
  train_idx <- caret::createDataPartition(factor(y), p = 0.8, list = FALSE)
  X_train <- X[train_idx, , drop = FALSE]; y_train <- y[train_idx]
  X_test  <- X[-train_idx, , drop = FALSE]; y_test  <- y[-train_idx]

  prep <- build_preprocessor(REALISTIC_FEATURES_NUMERIC, REALISTIC_FEATURES_ONEHOT, REALISTIC_FEATURES_TARGETENC)
  cmp <- compare_models(X_train, y_train, prep, plot_dir, tag = "realistic")
  best_pipe <- tune_best_model(cmp$best_name, X_train, y_train, prep)
  test_metrics <- evaluate_model(best_pipe, X_test, y_test, plot_dir, tag = "realistic")
  subgroup_metrics <- subgroup_evaluation(best_pipe, X_test, y_test, c("gender", "source_market"), plot_dir, tag = "realistic")
  fi <- feature_importance_report(best_pipe, X_train, y_train, plot_dir, tag = "realistic")

  saveRDS(best_pipe, file.path(outdir, "model_realistic.rds"))
  write.csv(fi$imp_df, file.path(outdir, "feature_importance_realistic.csv"), row.names = FALSE)

  all_metrics$realistic <- list(
    best_model = cmp$best_name,
    best_params = best_pipe$params,
    cv_results = cmp$results,
    test_metrics = list(roc_auc = test_metrics$roc_auc, average_precision = test_metrics$average_precision),
    subgroup_metrics = subgroup_metrics,
    features_used = feat_cols
  )

  # ---------------- Optional leaky demonstration model ----------------
  if (include_rating_features) {
    cat("\n\n", paste(rep("!", 78), collapse = ""), "\n")
    cat("RUNNING --include_rating_features DEMO MODE.\n")
    cat("This model includes average_rating, which deterministically defines\n")
    cat("the label. Expect near-perfect AUC. This is NOT a usable model -- it\n")
    cat("is included only to show what happens when leakage is present.\n")
    cat(paste(rep("!", 78), collapse = ""), "\n\n")

    feat_cols_leaky <- c(feat_cols, LEAKY_EXTRA_NUMERIC)
    Xl <- df[, feat_cols_leaky]
    Xl_train <- Xl[train_idx, , drop = FALSE]; yl_train <- y[train_idx]
    Xl_test  <- Xl[-train_idx, , drop = FALSE]; yl_test  <- y[-train_idx]

    prep_leaky <- build_preprocessor(
      c(REALISTIC_FEATURES_NUMERIC, LEAKY_EXTRA_NUMERIC),
      REALISTIC_FEATURES_ONEHOT, REALISTIC_FEATURES_TARGETENC
    )
    cmp_l <- compare_models(Xl_train, yl_train, prep_leaky, plot_dir, tag = "leaky_demo")
    best_pipe_l <- tune_best_model(cmp_l$best_name, Xl_train, yl_train, prep_leaky)
    test_metrics_l <- evaluate_model(best_pipe_l, Xl_test, yl_test, plot_dir, tag = "leaky_demo")

    saveRDS(best_pipe_l, file.path(outdir, "model_leaky_demo.rds"))
    all_metrics$leaky_demo <- list(
      best_model = cmp_l$best_name,
      best_params = best_pipe_l$params,
      cv_results = cmp_l$results,
      test_metrics = list(roc_auc = test_metrics_l$roc_auc, average_precision = test_metrics_l$average_precision),
      features_used = feat_cols_leaky,
      warning = "Includes average_rating; label is a deterministic threshold on this column."
    )
  }

  writeLines(jsonlite::toJSON(all_metrics, auto_unbox = TRUE, pretty = TRUE, force = TRUE),
             file.path(outdir, "metrics.json"))

  section("PIPELINE COMPLETE")
  cat(sprintf("Realistic model AUC (test): %.4f\n", all_metrics$realistic$test_metrics$roc_auc))
  if (include_rating_features) {
    cat(sprintf("Leaky demo model AUC (test): %.4f  (inflated by leakage)\n",
                all_metrics$leaky_demo$test_metrics$roc_auc))
  }
  cat(sprintf("\nAll artifacts written to: %s\n", normalizePath(outdir)))

  all_metrics
}

# -----------------------------------------------------------------------------
# CLI
# -----------------------------------------------------------------------------
parse_args <- function() {
  option_list <- list(
    make_option("--data", type = "character", default = NULL,
                help = "Path to merged_fashion_dataset_us_in.csv", metavar = "character"),
    make_option("--outdir", type = "character", default = "./outputs",
                help = "Directory to write all outputs [default %default]"),
    make_option("--include_rating_features", action = "store_true", default = FALSE,
                help = "Also fit a leakage-inclusive demo model (average_rating as a feature)"),
    make_option("--sample_frac", type = "double", default = NULL,
                help = "Optional: fraction of rows to sample (speeds up iteration on the full 214k rows)")
  )
  parser <- OptionParser(option_list = option_list,
                         description = "Fashion trend prediction training pipeline")
  args <- parse_args(parser)
  if (is.null(args$data)) {
    print_help(parser)
    stop("--data is required", call. = FALSE)
  }
  args
}

if (sys.nframe() == 0) {
  args <- parse_args()
  run_pipeline(args$data, args$outdir, args$include_rating_features, args$sample_frac)
}