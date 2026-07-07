library(reticulate)
library(jsonlite)
library(dplyr)
library(stringr)

sep_line <- strrep("=", 68)
sep2    <- strrep("-", 68)

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 1 — DOWNLOAD AMAZON FASHION METADATA                           ║
# ╚══════════════════════════════════════════════════════════════════════════╝

datasets <- import("datasets")
pd       <- import("pandas")

cat("Downloading Amazon Fashion Metadata (Product Details)...\n")
dataset <- datasets$load_dataset(
  "McAuley-Lab/Amazon-Reviews-2023",
  "raw_meta_Amazon_Fashion",
  split = "full",
  trust_remote_code = TRUE
)
df <- dataset$to_pandas()$reset_index(drop = TRUE)

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 2 — SHOW BASIC INFO & ALL COLUMNS                              ║
# ╚══════════════════════════════════════════════════════════════════════════╝

cat("\n", strrep("=", 50), "\n")
cat("TOTAL PRODUCTS IN DATASET:", format(nrow(df), big.mark = ","), "\n")
cat(strrep("=", 50), "\n")
cat("\nALL AVAILABLE COLUMNS:\n")
for (col in names(df)) cat(" ->", col, "\n")

cat("\n", strrep("=", 50), "\n")
cat("DEEP DIVE: LOOKING AT THE EXACT DATA FOR 1 PRODUCT\n")
cat(strrep("=", 50), "\n")
sample_product <- as.list(df[5, ])
for (key in names(sample_product)) {
  cat toupper(key), ":\n", "  ", sample_product[[key]], "\n\n", sep = ""
}

cat("\nSPREADSHEET VIEW (First 5 Rows):\n")
print(head(df, 5))

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 3 — df.info() equivalent                                        ║
# ╚══════════════════════════════════════════════════════════════════════════╝

cat("\nData frame info:\n")
cat("Rows:", nrow(df), "\n")
cat("Columns:", ncol(df), "\n")
cat("\nColumn dtypes:\n")
for (col in names(df)) {
  nn  <- sum(!is.na(df[[col]]))
  nul <- sum(is.na(df[[col]]))
  cat(sprintf("  %-20s  %s  %d non-null  %d null\n", col, class(df[[col]])[1], nn, nul))
}

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 4 — AMAZON DATA CLEANING PIPELINE                              ║
# ╚══════════════════════════════════════════════════════════════════════════╝

cat(strrep("=", 60), "\n")
cat("STARTING DATA CLEANING PIPELINE\n")
cat(strrep("=", 60), "\n")
cat("\nRaw df shape:", nrow(df), "x", ncol(df), "\n")
cat("Available columns:", paste(names(df), collapse = ", "), "\n")

# ── STEP 0: RE-DERIVE extracted_gender FROM details + title ──────────────
extract_gender_from_details <- function(row) {
  details_str <- row[["details"]]
  if (!is.na(details_str) && !is.null(details_str) && details_str != "") {
    tryCatch({
      details <- fromJSON(details_str, simplifyVector = FALSE)
      if (is.list(details)) {
        for (key in names(details)) {
          if (str_detect(tolower(key), "department|gender")) {
            val <- tolower(as.character(details[[key]]))
            if (any(val %in% c("women", "woman", "girl", "female", "ladies")))
              return("Female")
            if (any(val %in% c("men", "man", "boy", "male")))
              return("Male")
          }
        }
      }
    }, error = function(e) NULL)
  }
  title <- tolower(row[["title"]])
  if (any(str_detect(title, "women's|womens|woman|girls'|ladies")))
    return("Female")
  if (any(str_detect(title, "men's|mens|man|boys'|male")))
    return("Male")
  return("Unisex/Unknown")
}

if (!"extracted_gender" %in% names(df)) {
  cat("\nextracted_gender missing — re-deriving from details + title...\n")
  df$extracted_gender <- apply(df, 1, extract_gender_from_details)
  cat("extracted_gender derived:\n")
  print(table(df$extracted_gender))
} else {
  cat("\nextracted_gender already present\n")
}

# ── STEP 1: DROP USELESS COLUMNS ─────────────────────────────────────────
cols_to_drop <- c("bought_together", "subtitle", "author", "images", "videos", "main_category")
dropped <- intersect(cols_to_drop, names(df))
df_clean <- df[, !names(df) %in% cols_to_drop]
cat("\nStep 1 — Dropped:", paste(dropped, collapse = ", "), "\n")

# ── STEP 2: CLEAN PRICE → FLOAT ──────────────────────────────────────────
parse_price <- function(val) {
  if (is.na(val) || is.null(val) || val == "" || val == "None") return(NA_real_)
  val <- gsub(",", "", as.character(val))
  match <- regmatches(val, regexpr("[0-9]+\\.?[0-9]*", val))
  if (length(match) == 0 || match == "") return(NA_real_)
  as.numeric(match)
}

df_clean$price_usd <- sapply(df_clean$price, parse_price)
before <- nrow(df_clean)
df_clean <- df_clean[!is.na(df_clean$price_usd) & df_clean$price_usd > 0, ]
cat("Step 2 — Price cleaned:", format(before - nrow(df_clean), big.mark = ","), "rows removed\n")

# ── STEP 3: FILTER LOW-CONFIDENCE RATINGS (< 5 reviews) ─────────────────
before <- nrow(df_clean)
df_clean <- df_clean[df_clean$rating_number >= 5, ]
cat("Step 3 — Removed", format(before - nrow(df_clean), big.mark = ","), "rows with < 5 reviews\n")

# ── STEP 4: DROP MISSING RATINGS ─────────────────────────────────────────
before <- nrow(df_clean)
df_clean <- df_clean[!is.na(df_clean$average_rating), ]
cat("Step 4 — Removed", format(before - nrow(df_clean), big.mark = ","), "rows with missing rating\n")

# ── STEP 5: HARMONISE GENDER → Men / Women / Youth ───────────────────────
harmonise_gender <- function(val) {
  if (is.na(val)) return("Youth")
  val <- tolower(trimws(as.character(val)))
  if (val %in% c("male", "men", "man", "boys", "boy")) return("Men")
  if (val %in% c("female", "women", "woman", "girls", "girl")) return("Women")
  return("Youth")
}

df_clean$gender <- sapply(df_clean$extracted_gender, harmonise_gender)
cat("\nStep 5 — Gender harmonised:\n")
print(table(df_clean$gender))

# ── STEP 6: INFER individual_category FROM TITLE ─────────────────────────
CATEGORY_KEYWORDS <- list(
  "T-Shirt"     = c("t-shirt", "tshirt", "tee", "graphic tee"),
  "Shirt"       = c("shirt", "dress shirt", "polo"),
  "Jeans"       = c("jean", "denim"),
  "Dress"       = c("dress", "gown", "maxi", "mini dress"),
  "Jacket"      = c("jacket", "blazer", "windbreaker", "bomber"),
  "Sweater"     = c("sweater", "sweatshirt", "pullover", "hoodie", "cardigan"),
  "Pants"       = c("pant", "trouser", "legging", "jogger", "palazzo", "chino"),
  "Shorts"      = c("short"),
  "Skirt"       = c("skirt"),
  "Shoes"       = c("shoe", "sneaker", "boot", "sandal", "heel", "loafer", "pump", "flat"),
  "Socks"       = c("sock", "stocking", "hosiery"),
  "Underwear"   = c("underwear", "bra", "panty", "brief", "boxer", "lingerie"),
  "Swimwear"    = c("swim", "bikini", "tankini", "boardshort"),
  "Accessories" = c("watch", "belt", "wallet", "scarf", "glove", "hat", "cap", "beanie",
                     "bag", "purse", "handbag", "earring", "necklace", "bracelet",
                     "ring", "locket", "jewelry", "jewellery", "sunglasses"),
  "Activewear"  = c("yoga", "compression", "athletic", "sport", "workout", "running"),
  "Kurta"       = c("kurta", "kurti", "salwar", "ethnic"),
  "Coat"        = c("coat", "trench", "overcoat", "parka"),
  "Jumpsuit"    = c("jumpsuit", "romper", "playsuit")
)

infer_category <- function(title) {
  if (is.na(title)) return("Other")
  title_lower <- tolower(title)
  for (cat_name in names(CATEGORY_KEYWORDS)) {
    keywords <- CATEGORY_KEYWORDS[[cat_name]]
    if (any(str_detect(title_lower, fixed(keywords)))) return(cat_name)
  }
  return("Other")
}

df_clean$individual_category <- sapply(df_clean$title, infer_category)
cat("\nStep 6 — individual_category inferred:\n")
print(sort(table(df_clean$individual_category), decreasing = TRUE))

# ── STEP 7: BRAND + TARGET VARIABLE ──────────────────────────────────────
df_clean$brand <- ifelse(is.na(df_clean$store), "Unknown", df_clean$store)
df_clean$is_trending <- ifelse(df_clean$average_rating >= 4.2, "Yes", "No")
df_clean$source_market <- "US"

cat("\nStep 7 — is_trending:\n")
print(table(df_clean$is_trending))

# ── STEP 8: SELECT FINAL COLUMNS ─────────────────────────────────────────
final_cols <- c("parent_asin", "title", "gender", "individual_category",
                "price_usd", "brand", "average_rating", "rating_number",
                "is_trending", "source_market")
df_clean <- df_clean[, final_cols]
df_clean <- df_clean[order(seq_len(nrow(df_clean))), ]

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 5 — AMAZON FULL DATA QUALITY AUDIT                             ║
# ╚══════════════════════════════════════════════════════════════════════════╝

cat("\n", strrep("=", 70), "\n")
cat("FULL DATA QUALITY AUDIT REPORT — df_clean (Amazon Fashion)\n")
cat(strrep("=", 70), "\n")

# 0. SHAPE & BASIC INFO
cat("\n", strrep("-", 70), "\n")
cat("0. SHAPE & BASIC INFO\n")
cat(strrep("-", 70), "\n")
cat("Rows:   ", format(nrow(df_clean), big.mark = ","), "\n")
cat("Columns:", ncol(df_clean), "\n")
cat("\nDtypes:\n")
for (col in names(df_clean)) cat(sprintf("  %-24s %s\n", col, class(df_clean[[col]])[1]))
cat("\nMemory usage:", format(round(object.size(df_clean) / 1e6, 2)), "MB\n")

# 1. NULL / MISSING CHECK
cat("\n", strrep("-", 70), "\n")
cat("1. NULL / MISSING VALUES\n")
cat(strrep("-", 70), "\n")
null_counts <- sapply(df_clean, function(x) sum(is.na(x)))
null_pct    <- round(null_counts / nrow(df_clean) * 100, 2)
null_df     <- data.frame(null_count = null_counts, null_pct = null_pct)
print(null_df)
if (sum(null_counts) == 0) {
  cat("\nPASS — Zero nulls across all columns\n")
} else {
  cat("\nFAIL —", sum(null_counts), "nulls found!\n")
}

# 2. DUPLICATE CHECK
cat("\n", strrep("-", 70), "\n")
cat("2. DUPLICATE ROWS\n")
cat(strrep("-", 70), "\n")
dup_rows <- sum(duplicated(df_clean))
dup_asin <- sum(duplicated(df_clean$parent_asin))
cat("Fully duplicate rows:     ", format(dup_rows, big.mark = ","), "\n")
cat("Duplicate parent_asin IDs:", format(dup_asin, big.mark = ","), "\n")
if (dup_rows == 0) cat("PASS — No duplicate rows\n") else cat("WARNING — Duplicate rows exist\n")

# 3. COLUMN-BY-COLUMN AUDIT
cat("\n", strrep("-", 70), "\n")
cat("3a. COLUMN: parent_asin\n")
cat(strrep("-", 70), "\n")
cat("Unique values:", format(length(unique(df_clean$parent_asin)), big.mark = ","), "\n")
cat("Nulls:        ", sum(is.na(df_clean$parent_asin)), "\n")
cat("Empty strings:", sum(df_clean$parent_asin == "", na.rm = TRUE), "\n")
cat("Sample values:", paste(head(df_clean$parent_asin, 5), collapse = ", "), "\n")

cat("\n", strrep("-", 70), "\n")
cat("3b. COLUMN: title\n")
cat(strrep("-", 70), "\n")
cat("Unique titles:    ", format(length(unique(df_clean$title)), big.mark = ","), "\n")
cat("Nulls:            ", sum(is.na(df_clean$title)), "\n")
cat("Empty strings:    ", sum(str_trim(df_clean$title) == "", na.rm = TRUE), "\n")
cat("Avg title length: ", round(mean(nchar(df_clean$title), na.rm = TRUE), 1), "chars\n")
cat("Min title length: ", min(nchar(df_clean$title), na.rm = TRUE), "\n")
cat("Max title length: ", max(nchar(df_clean$title), na.rm = TRUE), "\n")
title_lengths <- nchar(df_clean$title)
shortest <- df_clean[order(title_lengths), ][1:3, "title", drop = FALSE]
cat("\nShortest titles:\n")
for (i in seq_len(nrow(shortest))) {
  cat("  [", title_lengths[order(title_lengths)][i], "chars]", shortest$title[i], "\n")
}

cat("\n", strrep("-", 70), "\n")
cat("3c. COLUMN: gender\n")
cat(strrep("-", 70), "\n")
allowed_gender <- c("Men", "Women", "Youth")
cat("Allowed values:", paste(allowed_gender, collapse = ", "), "\n")
cat("Unique values: ", paste(unique(df_clean$gender), collapse = ", "), "\n")
invalid_gender <- !df_clean$gender %in% allowed_gender
cat("Invalid values:", sum(invalid_gender), "\n")
cat("\nValue counts:\n")
print(table(df_clean$gender))
cat("\nProportions (%):\n")
print(round(prop.table(table(df_clean$gender)) * 100, 1))
if (sum(invalid_gender) == 0) cat("\nPASS — All gender values valid\n") else {
  cat("\nFAIL —", sum(invalid_gender), "invalid gender values!\n")
  print(table(df_clean$gender[invalid_gender]))
}

cat("\n", strrep("-", 70), "\n")
cat("3d. COLUMN: individual_category\n")
cat(strrep("-", 70), "\n")
cat("Unique categories:", length(unique(df_clean$individual_category)), "\n")
cat("Nulls:            ", sum(is.na(df_clean$individual_category)), "\n")
cat("\nValue counts:\n")
print(sort(table(df_clean$individual_category), decreasing = TRUE))
cat("\nProportions (%):\n")
print(round(sort(prop.table(table(df_clean$individual_category)) * 100, decreasing = TRUE), 2))
other_pct <- mean(df_clean$individual_category == "Other") * 100
cat("\n'Other' =", round(other_pct, 1), "% of records\n")
if (other_pct > 50) cat("WARNING — More than 50% of records are 'Other' category\n") else
  cat("PASS — 'Other' is within acceptable range\n")

cat("\n", strrep("-", 70), "\n")
cat("3e. COLUMN: price_usd\n")
cat(strrep("-", 70), "\n")
cat("Nulls:       ", sum(is.na(df_clean$price_usd)), "\n")
cat("Zero prices:", sum(df_clean$price_usd == 0, na.rm = TRUE), "\n")
cat("Negative:   ", sum(df_clean$price_usd < 0, na.rm = TRUE), "\n")
cat("\nDescriptive stats:\n")
print(summary(df_clean$price_usd))
cat("\nPrice distribution buckets:\n")
bins   <- c(0, 10, 25, 50, 100, 250, 500, Inf)
labels <- c("$0-10", "$10-25", "$25-50", "$50-100", "$100-250", "$250-500", "$500+")
price_dist <- cut(df_clean$price_usd, breaks = bins, labels = labels, right = FALSE)
print(table(price_dist))
cat("\nSuspiciously high prices (> $500):\n")
high_prices <- df_clean[df_clean$price_usd > 500, c("title", "price_usd")]
print(head(high_prices, 5))

cat("\n", strrep("-", 70), "\n")
cat("3f. COLUMN: brand\n")
cat(strrep("-", 70), "\n")
cat("Unique brands:    ", format(length(unique(df_clean$brand)), big.mark = ","), "\n")
cat("Nulls:            ", sum(is.na(df_clean$brand)), "\n")
cat("'Unknown' brands: ", sum(df_clean$brand == "Unknown", na.rm = TRUE), "\n")
cat("\nTop 20 brands by product count:\n")
print(head(sort(table(df_clean$brand), decreasing = TRUE), 20))

cat("\n", strrep("-", 70), "\n")
cat("3g. COLUMN: average_rating\n")
cat(strrep("-", 70), "\n")
cat("Nulls:             ", sum(is.na(df_clean$average_rating)), "\n")
out_of_range <- sum(df_clean$average_rating < 0 | df_clean$average_rating > 5, na.rm = TRUE)
cat("Out of range (0-5):", out_of_range, "\n")
cat("\nDescriptive stats:\n")
print(summary(df_clean$average_rating))
cat("\nRating distribution buckets:\n")
rbins   <- c(0, 1, 2, 3, 3.5, 4, 4.2, 4.5, 5.0)
rlabels <- c("0-1", "1-2", "2-3", "3-3.5", "3.5-4", "4-4.2", "4.2-4.5", "4.5-5")
rating_dist <- cut(df_clean$average_rating, breaks = rbins, labels = rlabels, right = FALSE)
print(table(rating_dist))
if (out_of_range == 0) cat("\nPASS — All ratings in valid 0-5 range\n") else
  cat("\nFAIL —", out_of_range, "ratings outside 0-5!\n")

cat("\n", strrep("-", 70), "\n")
cat("3h. COLUMN: rating_number\n")
cat(strrep("-", 70), "\n")
cat("Nulls:  ", sum(is.na(df_clean$rating_number)), "\n")
cat("Below 5:", sum(df_clean$rating_number < 5, na.rm = TRUE), " <- should be 0\n")
cat("Min:    ", min(df_clean$rating_number, na.rm = TRUE), "\n")
cat("Max:    ", format(max(df_clean$rating_number, na.rm = TRUE), big.mark = ","), "\n")
cat("Median: ", round(median(df_clean$rating_number, na.rm = TRUE)), "\n")
cat("Mean:   ", round(mean(df_clean$rating_number, na.rm = TRUE), 1), "\n")
cat("\nReview count buckets:\n")
vbins   <- c(5, 10, 25, 50, 100, 500, 1000, Inf)
vlabels <- c("5-10", "10-25", "25-50", "50-100", "100-500", "500-1k", "1k+")
rev_dist <- cut(df_clean$rating_number, breaks = vbins, labels = vlabels, right = FALSE)
print(table(rev_dist))
if (sum(df_clean$rating_number < 5, na.rm = TRUE) == 0) cat("\nPASS — All records have >= 5 reviews\n") else
  cat("\nFAIL — Some records have < 5 reviews!\n")

cat("\n", strrep("-", 70), "\n")
cat("3i. COLUMN: is_trending\n")
cat(strrep("-", 70), "\n")
allowed_trending <- c("Yes", "No")
invalid_trending <- !df_clean$is_trending %in% allowed_trending
cat("Allowed values:", paste(allowed_trending, collapse = ", "), "\n")
cat("Unique values: ", paste(unique(df_clean$is_trending), collapse = ", "), "\n")
cat("Invalid values:", sum(invalid_trending), "\n")
cat("\nValue counts:\n")
print(table(df_clean$is_trending))
cat("\nProportions (%):\n")
print(round(prop.table(table(df_clean$is_trending)) * 100, 1))
mismatch <- sum((df_clean$average_rating >= 4.2 & df_clean$is_trending == "No") |
                  (df_clean$average_rating < 4.2 & df_clean$is_trending == "Yes"), na.rm = TRUE)
cat("\nMismatches between rating >= 4.2 and is_trending:", mismatch, "\n")
if (mismatch == 0) cat("PASS — is_trending perfectly aligned with average_rating threshold\n") else
  cat("FAIL — is_trending and average_rating are misaligned!\n")

cat("\n", strrep("-", 70), "\n")
cat("3j. COLUMN: source_market\n")
cat(strrep("-", 70), "\n")
cat("Unique values:", paste(unique(df_clean$source_market), collapse = ", "), "\n")
cat("Value counts:\n")
print(table(df_clean$source_market))
if (all(unique(df_clean$source_market) == "US")) cat("PASS — All records tagged 'US'\n") else
  cat("WARNING — Unexpected source_market values!\n")

# 4. CROSS-COLUMN CHECKS
cat("\n", strrep("-", 70), "\n")
cat("4. CROSS-COLUMN ANALYSIS\n")
cat(strrep("-", 70), "\n")
cat("\nAvg rating by gender:\n")
print(round(aggregate(average_rating ~ gender, data = df_clean, FUN = function(x) c(mean = mean(x), median = median(x), count = length(x))), 3))
cat("\nAvg price by gender:\n")
print(round(aggregate(price_usd ~ gender, data = df_clean, FUN = function(x) c(mean = mean(x), median = median(x), min = min(x), max = max(x))), 2))
cat("\nis_trending rate by gender (%):\n")
trend_by_gender <- aggregate(is_trending ~ gender, data = df_clean, FUN = function(x) round(mean(x == "Yes") * 100, 1))
print(trend_by_gender)
cat("\nAvg rating by individual_category:\n")
rating_by_cat <- aggregate(average_rating ~ individual_category, data = df_clean, FUN = function(x) c(mean = mean(x), median = median(x), count = length(x)))
print(round(rating_by_cat[order(-rating_by_cat$average_rating[, "count"]), ], 3))
cat("\nis_trending rate by individual_category (%):\n")
trend_by_cat <- aggregate(is_trending ~ individual_category, data = df_clean, FUN = function(x) round(mean(x == "Yes") * 100, 1))
print(trend_by_cat[order(-trend_by_cat$is_trending), ])
cat("\nAvg price by individual_category:\n")
price_by_cat <- aggregate(price_usd ~ individual_category, data = df_clean, FUN = function(x) c(mean = mean(x), median = median(x)))
print(round(price_by_cat[order(-price_by_cat$price_usd[, "mean"]), ], 2))

# 5. FINAL PASS/FAIL SUMMARY
cat("\n", strrep("=", 70), "\n")
cat("5. FINAL AUDIT SUMMARY\n")
cat(strrep("=", 70), "\n")
checks <- list(
  "Zero nulls"                      = sum(null_counts) == 0,
  "No duplicate rows"               = dup_rows == 0,
  "Valid gender values only"        = sum(invalid_gender) == 0,
  "Valid trending values only"      = sum(invalid_trending) == 0,
  "is_trending aligned with rating" = mismatch == 0,
  "All prices > 0"                  = sum(df_clean$price_usd <= 0, na.rm = TRUE) == 0,
  "All ratings in 0-5"             = out_of_range == 0,
  "All records have >= 5 reviews"   = sum(df_clean$rating_number < 5, na.rm = TRUE) == 0,
  "source_market all 'US'"          = all(unique(df_clean$source_market) == "US")
)
for (check_name in names(checks)) {
  status <- if (checks[[check_name]]) "PASS" else "FAIL"
  cat(sprintf("  %s  —  %s\n", status, check_name))
}
all_passed <- all(unlist(checks))
if (all_passed) cat("\nALL CHECKS PASSED — df_clean is ready for Myntra merge!\n") else
  cat("\nSOME CHECKS FAILED — review above before proceeding\n")
cat("\nFinal clean dataset shape:", nrow(df_clean), "x", ncol(df_clean), "\n")
print(head(df_clean, 5))

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 6-7 — GENDER REMAP: Youth → Unisex                             ║
# ╚══════════════════════════════════════════════════════════════════════════╝

df_clean$gender <- ifelse(df_clean$gender == "Youth", "Unisex", df_clean$gender)

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 8 — VALUE COUNTS FOR KEY COLUMNS                                ║
# ╚══════════════════════════════════════════════════════════════════════════╝

cols_to_check <- c("gender", "individual_category", "brand", "is_trending", "source_market")
for (col in cols_to_check) {
  cat("\n", strrep("-", 40), "\n")
  cat("VALUE COUNTS:", col, "\n")
  cat(strrep("-", 40), "\n")
  print(sort(table(df_clean[[col]]), decreasing = TRUE))
}

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 9 — SAVE AMAZON CLEANED CSV                                     ║
# ╚══════════════════════════════════════════════════════════════════════════╝

write.csv(df_clean, "cleaned_amazon_fashion_dataset.csv", row.names = FALSE)
cat("Dataset saved successfully as 'cleaned_amazon_fashion_dataset.csv'\n")

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 10-12 — DOWNLOAD MYNTRA FASHION DATASET                         ║
# ╚══════════════════════════════════════════════════════════════════════════╝

kagglehub <- import("kagglehub")
os        <- import("os")

path <- kagglehub$dataset_download("manishmathias/myntra-fashion-dataset")
cat("Dataset downloaded to:", path, "\n")

files <- list.files(path, pattern = "\\.csv$", full.names = TRUE)
cat("Available CSV files:", basename(files), "\n")

if (length(files) > 0) {
  df_myntra <- read.csv(files[1], stringsAsFactors = FALSE, na.strings = c("", "NA"))
  cat("\nSuccessfully loaded:", basename(files[1]), "\n")
  print(head(df_myntra))
} else {
  stop("No CSV files found in the dataset directory.")
}

df <- df_myntra

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 13 — MYNTRA QUALITY AUDIT                                       ║
# ╚══════════════════════════════════════════════════════════════════════════╝

cat(strrep("=", 70), "\n")
cat("MYNTRA DATASET: COMPLETE QUALITY & STRUCTURAL AUDIT\n")
cat(strrep("=", 70), "\n")

cat("\nDIMENSIONS:\n")
cat("  Total Products (Rows):", format(nrow(df), big.mark = ","), "\n")
cat("  Attributes (Columns):", ncol(df), "\n")

cat("\nMISSING DATA ANALYSIS:\n")
null_counts_myntra <- sapply(df, function(x) sum(is.na(x)))
null_pct_myntra    <- round(null_counts_myntra / nrow(df) * 100, 2)
missing_df <- data.frame(Missing_Count = null_counts_myntra, Percentage = null_pct_myntra)
print(missing_df[missing_df$Missing_Count > 0, ])

cat("\nPOTENTIAL ISSUES:\n")
cat("  Price Format Sample:", head(df[["OriginalPrice..in.Rs."]], 5), "\n")
cat("  Exact Duplicate Rows:", format(sum(duplicated(df)), big.mark = ","), "\n")
if ("Ratings" %in% names(df)) {
  cat("  Ratings Range:", min(df$Ratings, na.rm = TRUE), "to", max(df$Ratings, na.rm = TRUE), "\n")
}

cat("\nUNIQUE VALUES & CATEGORIES:\n")
for (col in c("Category", "Individual_category", "category_by_Gender", "BrandName")) {
  if (col %in% names(df)) cat("  ", col, ":", length(unique(df[[col]])), "unique values\n")
}

cat("\nGENDER SPLIT:\n")
print(table(df$category_by_Gender))

cat("\n", strrep("=", 70), "\n")
cat("CLEANING TODO LIST:\n")
cat("1. Convert Prices to Float (remove currency markers if any).\n")
cat("2. Handle the ~64% missing Ratings (impute or filter).\n")
cat("3. Deduplicate rows based on Product_id.\n")
cat("4. Harmonize Gender tags to match your Amazon dataset (Men/Women/Unisex).\n")
cat(strrep("=", 70), "\n")

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 14 — MYNTRA DEEP DIVE AUDIT                                     ║
# ╚══════════════════════════════════════════════════════════════════════════╝

cat(strrep("=", 80), "\n")
cat("MYNTRA DATASET: DEEP DIVE ARCHITECTURAL & QUALITY AUDIT\n")
cat(strrep("=", 80), "\n")

cat("\nIDENTIFIER INTEGRITY:\n")
unique_ids <- length(unique(df$Product_id))
duplicate_ids <- nrow(df) - unique_ids
cat("  Unique Product IDs:", format(unique_ids, big.mark = ","), "\n")
cat("  Duplicate IDs found:", format(duplicate_ids, big.mark = ","), "\n")

cat("\nTEXTUAL QUALITY ANALYSIS:\n")
desc_len <- nchar(df$Description)
cat("  Avg Description Length:", round(mean(desc_len, na.rm = TRUE), 1), "chars\n")
cat("  Empty/Whitespace Descriptions:", sum(str_trim(df$Description) == "", na.rm = TRUE), "\n")
cat("  Potential 'Placeholders':", sum(df$Description %in% c("None", "nan", "NaN", "null"), na.rm = TRUE), "\n")

cat("\nPRICE & DISCOUNT LOGIC:\n")
illogical_prices <- sum(df[["DiscountPrice..in.Rs."]] > df[["OriginalPrice..in.Rs."]], na.rm = TRUE)
cat("  Rows where Discount > Original:", format(illogical_prices, big.mark = ","), "\n")

cat("\nCATEGORY OVERLAP & HIERARCHY:\n")
cat("Top Parent Categories:\n")
print(sort(table(df$Category), decreasing = TRUE))

if (any(!is.na(df$Ratings))) {
  cat("\nRATING SKEW (For products with ratings):\n")
  print(sort(table(df$Ratings), decreasing = TRUE))
}

cat("\nSYSTEM RESOURCE USAGE:\n")
cat("  Total memory footprint:", format(round(object.size(df) / 1e6, 2)), "MB\n")

cat("\n", strrep("=", 80), "\n")
cat("TECHNICAL OBSERVATIONS:\n")
cat("- Product_id redundancy: We need to decide if we keep the first or last instance.\n")
cat(strrep("=", 80), "\n")

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 15 — MYNTRA CLEANING PIPELINE                                   ║
# ╚══════════════════════════════════════════════════════════════════════════╝

cat(strrep("=", 65), "\n")
cat("  MYNTRA CLEANING PIPELINE\n")
cat(strrep("=", 65), "\n")
cat("\nRaw shape:", nrow(df), "x", ncol(df), "\n")

# STEP 1: Work on a copy
df_clean_myntra <- df

# STEP 2: Drop identifier-only columns
df_clean_myntra <- df_clean_myntra[, !names(df_clean_myntra) %in% c("URL", "Product_id")]
cat("\nStep 2 | Dropped URL & Product_id -> shape:", nrow(df_clean_myntra), "x", ncol(df_clean_myntra), "\n")

# STEP 3: Keep only rows with Ratings (non-null)
before <- nrow(df_clean_myntra)
df_clean_myntra <- df_clean_myntra[!is.na(df_clean_myntra$Ratings), ]
cat("Step 3 | Dropped null Ratings: removed", format(before - nrow(df_clean_myntra), big.mark = ","), "rows ->", format(nrow(df_clean_myntra), big.mark = ","), "remain\n")

# STEP 4: Keep only rows where Reviews > 0
before <- nrow(df_clean_myntra)
df_clean_myntra <- df_clean_myntra[!is.na(df_clean_myntra$Reviews) & df_clean_myntra$Reviews > 0, ]
cat("Step 4 | Dropped Reviews <= 0 or null: removed", format(before - nrow(df_clean_myntra), big.mark = ","), "rows ->", format(nrow(df_clean_myntra), big.mark = ","), "remain\n")

# STEP 5: Drop rows with null gender / price / category
before <- nrow(df_clean_myntra)
df_clean_myntra <- df_clean_myntra[!is.na(df_clean_myntra$category_by_Gender) &
                                     !is.na(df_clean_myntra[["OriginalPrice..in.Rs."]]) &
                                     !is.na(df_clean_myntra$Individual_category), ]
cat("Step 5 | Dropped nulls in key cols: removed", format(before - nrow(df_clean_myntra), big.mark = ","), "rows ->", format(nrow(df_clean_myntra), big.mark = ","), "remain\n")

# STEP 6: Create parent_asin (reset index as surrogate ID)
df_clean_myntra$parent_asin <- paste0("MYNTRA_", seq_len(nrow(df_clean_myntra)) - 1)
cat("Step 6 | Created parent_asin (MYNTRA_0, MYNTRA_1, ...)\n")

# STEP 7: Rename title column
names(df_clean_myntra)[names(df_clean_myntra) == "Description"] <- "title"
cat("Step 7 | Renamed 'Description' -> 'title'\n")

# STEP 8: Gender harmonisation
gender_map <- c("Men" = "Men", "Women" = "Women", "Boys" = "Youth", "Girls" = "Youth")
df_clean_myntra$gender <- gender_map[df_clean_myntra$category_by_Gender]

before <- nrow(df_clean_myntra)
df_clean_myntra <- df_clean_myntra[!is.na(df_clean_myntra$gender), ]
cat("Step 8 | Gender harmonised (Men/Women/Youth): removed", format(before - nrow(df_clean_myntra), big.mark = ","), "unknown ->", format(nrow(df_clean_myntra), big.mark = ","), "remain\n")
cat("        Distribution:\n")
print(table(df_clean_myntra$gender))

# STEP 9: individual_category (direct from Myntra)
names(df_clean_myntra)[names(df_clean_myntra) == "Individual_category"] <- "individual_category"
df_clean_myntra$individual_category <- str_trim(df_clean_myntra$individual_category)
cat("Step 9 | individual_category —", length(unique(df_clean_myntra$individual_category)), "unique types\n")

# STEP 10: price_usd (INR -> USD, cap at $500)
INR_TO_USD <- 83.5
df_clean_myntra$price_usd <- as.numeric(df_clean_myntra[["OriginalPrice..in.Rs."]]) / INR_TO_USD

before <- nrow(df_clean_myntra)
df_clean_myntra <- df_clean_myntra[!is.na(df_clean_myntra$price_usd) & df_clean_myntra$price_usd > 0, ]
cat("Step 10 | Converted INR -> USD (/83.5): removed", format(before - nrow(df_clean_myntra), big.mark = ","), "null/zero prices\n")

before <- nrow(df_clean_myntra)
df_clean_myntra <- df_clean_myntra[df_clean_myntra$price_usd <= 500, ]
cat("        Capped at $500: removed", format(before - nrow(df_clean_myntra), big.mark = ","), "luxury outliers ->", format(nrow(df_clean_myntra), big.mark = ","), "remain\n")

# STEP 11: brand
names(df_clean_myntra)[names(df_clean_myntra) == "BrandName"] <- "brand"
df_clean_myntra$brand <- ifelse(is.na(df_clean_myntra$brand), "Unknown", str_trim(df_clean_myntra$brand))
cat("Step 11 | brand —", format(length(unique(df_clean_myntra$brand)), big.mark = ","), "unique brands\n")

# STEP 12: average_rating & rating_number
names(df_clean_myntra)[names(df_clean_myntra) == "Ratings"]   <- "average_rating"
names(df_clean_myntra)[names(df_clean_myntra) == "Reviews"]   <- "rating_number"
df_clean_myntra$average_rating <- as.numeric(df_clean_myntra$average_rating)
df_clean_myntra$rating_number  <- as.integer(df_clean_myntra$rating_number)
cat("Step 12 | average_rating & rating_number cast to numeric\n")

# STEP 13: is_trending (same threshold as Amazon: >= 4.2)
df_clean_myntra$is_trending <- ifelse(df_clean_myntra$average_rating >= 4.2, "Yes", "No")
trend_counts <- table(df_clean_myntra$is_trending)
cat("Step 13 | is_trending (>=4.2 = Yes):\n")
cat("        Yes:", format(trend_counts["Yes"], big.mark = ","), " | No:", format(trend_counts["No"], big.mark = ","), "\n")

# STEP 14: source_market
df_clean_myntra$source_market <- "IN"
cat("Step 14 | source_market = 'IN' (hardcoded)\n")

# STEP 15: Select & reorder to match Amazon schema
FINAL_COLS <- c("parent_asin", "title", "gender", "individual_category",
                "price_usd", "brand", "average_rating", "rating_number",
                "is_trending", "source_market")
df_clean_myntra <- df_clean_myntra[, FINAL_COLS]
cat("Step 15 | Columns reordered to match Amazon schema\n")

# STEP 16: Final null check & dedup
cat("Step 16 | Null check:\n")
print(sapply(df_clean_myntra, function(x) sum(is.na(x))))
cat("        Duplicate rows:", sum(duplicated(df_clean_myntra)), "\n")

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 15 — MYNTRA VERIFICATION REPORT                                 ║
# ╚══════════════════════════════════════════════════════════════════════════╝

cat("\n", strrep("=", 65), "\n")
cat("  MYNTRA CLEANING COMPLETE — VERIFICATION REPORT\n")
cat(strrep("=", 65), "\n")

cat("\nFinal Shape:", format(nrow(df_clean_myntra), big.mark = ","), "rows x", ncol(df_clean_myntra), "columns\n")
cat("\nColumns (matches Amazon schema):\n")
for (col in names(df_clean_myntra)) {
  cat(sprintf("   %-22s dtype: %s\n", col, class(df_clean_myntra[[col]])[1]))
}
cat("\nGender Distribution:\n")
print(table(df_clean_myntra$gender))
cat("\nis_trending Distribution:\n")
print(table(df_clean_myntra$is_trending))
cat("\nPrice (USD) Stats:\n")
print(summary(df_clean_myntra$price_usd))
cat("\nRating Stats:\n")
print(summary(df_clean_myntra$average_rating))
cat("\nTop 10 Brands:\n")
print(head(sort(table(df_clean_myntra$brand), decreasing = TRUE), 10))
cat("\nTop 15 Individual Categories:\n")
print(head(sort(table(df_clean_myntra$individual_category), decreasing = TRUE), 15))
cat("\nSource Market:\n")
print(table(df_clean_myntra$source_market))
cat("\nSample Rows:\n")
print(head(df_clean_myntra, 5))

cat("\nSchema compatibility with Amazon df_clean:\n")
amazon_cols <- FINAL_COLS
match <- all(names(df_clean_myntra) == amazon_cols)
cat("  Column order matches Amazon:", if (match) "YES" else "NO", "\n")
cat("  Zero nulls:                 ", if (sum(sapply(df_clean_myntra, function(x) sum(is.na(x)))) == 0) "YES" else "NO", "\n")
cat("  Zero duplicates:            ", if (sum(duplicated(df_clean_myntra)) == 0) "YES" else "NO", "\n")
cat("\ndf_clean is ready. Run rbind to integrate.\n")

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 16 — MYNTRA FULL PRE-INTEGRATION AUDIT                         ║
# ╚══════════════════════════════════════════════════════════════════════════╝

cat("\n", strrep("=", 68), "\n")
cat("  MYNTRA df_clean — COMPLETE MODEL-READINESS AUDIT\n")
cat(strrep("=", 68), "\n")

# 1. SHAPE & SCHEMA
cat("\n[1] SHAPE & SCHEMA\n")
cat("  Rows   :", format(nrow(df_clean_myntra), big.mark = ","), "\n")
cat("  Columns:", ncol(df_clean_myntra), "\n")
cat(sprintf("\n  %-22s %-12s %10s  %8s  %8s\n", "Column", "Dtype", "Non-Null", "Null", "Null %"))
cat("  ", strrep("-", 62), "\n")
for (col in names(df_clean_myntra)) {
  nn  <- sum(!is.na(df_clean_myntra[[col]]))
  nul <- sum(is.na(df_clean_myntra[[col]]))
  pct <- nul / nrow(df_clean_myntra) * 100
  cat(sprintf("  %-22s %-12s %10s  %8s  %7.2f%%\n", col, class(df_clean_myntra[[col]])[1], format(nn, big.mark = ","), format(nul, big.mark = ","), pct))
}

# 2. AMAZON SCHEMA COMPATIBILITY
cat("\n[2] AMAZON SCHEMA COMPATIBILITY\n")
EXPECTED_COLS <- FINAL_COLS
EXPECTED_DTYPES <- c("parent_asin" = "character", "title" = "character", "gender" = "character",
                     "individual_category" = "character", "price_usd" = "numeric",
                     "brand" = "character", "average_rating" = "numeric",
                     "rating_number" = "integer", "is_trending" = "character",
                     "source_market" = "character")
all_ok <- TRUE
for (col in EXPECTED_COLS) {
  present  <- col %in% names(df_clean_myntra)
  dtype_ok <- if (present) class(df_clean_myntra[[col]])[1] == EXPECTED_DTYPES[col] else FALSE
  status   <- if (present && dtype_ok) "OK" else "FAIL"
  if (!(present && dtype_ok)) all_ok <- FALSE
  got <- if (present) class(df_clean_myntra[[col]])[1] else "MISSING"
  cat(sprintf("  %s  %-22s  expected: %-10s  got: %s\n", status, col, EXPECTED_DTYPES[col], got))
}
col_order_ok <- all(names(df_clean_myntra) == EXPECTED_COLS)
cat("\n  Column ORDER matches Amazon:", if (col_order_ok) "YES" else "NO", "\n")
cat("  All dtypes correct          :", if (all_ok) "YES" else "NO — fix before concat", "\n")

# 3. NULLS & DUPLICATES
cat("\n[3] NULLS & DUPLICATES\n")
total_nulls <- sum(sapply(df_clean_myntra, function(x) sum(is.na(x))))
total_dups  <- sum(duplicated(df_clean_myntra))
asin_dups   <- sum(duplicated(df_clean_myntra$parent_asin))
cat("  Total null cells     :", format(total_nulls, big.mark = ","), if (total_nulls == 0) "OK" else "FAIL", "\n")
cat("  Duplicate rows       :", format(total_dups, big.mark = ","), if (total_dups == 0) "OK" else "FAIL", "\n")
cat("  Duplicate parent_asin:", format(asin_dups, big.mark = ","), if (asin_dups == 0) "OK" else "FAIL", "\n")

# 4. TARGET VARIABLE — is_trending
cat("\n[4] TARGET VARIABLE — is_trending\n")
vc <- table(df_clean_myntra$is_trending)
total <- nrow(df_clean_myntra)
for (label in names(vc)) {
  bar <- strrep("=", as.integer(vc[label] / total * 40))
  cat(sprintf("   %-5s  %7s  (%.1f%%)  %s\n", label, format(vc[label], big.mark = ","), vc[label] / total * 100, bar))
}
valid_vals <- all(df_clean_myntra$is_trending %in% c("Yes", "No"))
cat("\n  Only 'Yes'/'No' values:", if (valid_vals) "OK" else "FAIL\n")
imbalance <- max(vc) / min(vc)
cat("  Class imbalance ratio:", round(imbalance, 2), "x", if (imbalance < 3) "acceptable" else "consider resampling", "\n")

# 5. GENDER
cat("\n[5] GENDER\n")
vc <- table(df_clean_myntra$gender)
for (label in names(vc)) {
  bar <- strrep("=", as.integer(vc[label] / total * 40))
  cat(sprintf("   %-8s  %7s  (%.1f%%)  %s\n", label, format(vc[label], big.mark = ","), vc[label] / total * 100, bar))
}
valid_gender <- all(df_clean_myntra$gender %in% c("Men", "Women", "Youth"))
cat("\n  Only Men/Women/Youth:", if (valid_gender) "OK" else "FAIL\n")

# 6. INDIVIDUAL CATEGORY
cat("\n[6] INDIVIDUAL_CATEGORY\n")
vc <- table(df_clean_myntra$individual_category)
cat("  Unique categories:", length(vc), "\n")
cat(sprintf("\n  %-28s %8s  %6s  Bar\n", "Category", "Count", "%"))
cat("  ", strrep("-", 58), "\n")
for (cat_name in head(names(sort(vc, decreasing = TRUE)), 20)) {
  bar <- strrep("=", as.integer(vc[cat_name] / max(vc) * 25))
  cat(sprintf("  %-28s %8s  %5.1f%%  %s\n", cat_name, format(vc[cat_name], big.mark = ","), vc[cat_name] / total * 100, bar))
}
if (length(vc) > 20) cat("  ... and", length(vc) - 20, "more categories\n")

# 7. PRICE (USD)
cat("\n[7] PRICE_USD\n")
p <- df_clean_myntra$price_usd
cat("  Min    :", sprintf("$%.2f", min(p, na.rm = TRUE)), "\n")
cat("  Max    :", sprintf("$%.2f", max(p, na.rm = TRUE)), if (max(p, na.rm = TRUE) <= 500) "capped at $500 OK" else "FAIL cap not applied", "\n")
cat("  Mean   :", sprintf("$%.2f", mean(p, na.rm = TRUE)), "\n")
cat("  Median :", sprintf("$%.2f", median(p, na.rm = TRUE)), "\n")
cat("  Std Dev:", sprintf("$%.2f", sd(p, na.rm = TRUE)), "\n")
cat("  Zeros  :", sum(p == 0, na.rm = TRUE), if (sum(p == 0, na.rm = TRUE) == 0) "OK" else "FAIL\n")
cat("  Negatives:", sum(p < 0, na.rm = TRUE), if (sum(p < 0, na.rm = TRUE) == 0) "OK" else "FAIL\n")
cat("\n  Price Distribution Buckets:\n")
bins   <- c(0, 5, 15, 30, 60, 100, 200, 500)
labels <- c("$0-5", "$5-15", "$15-30", "$30-60", "$60-100", "$100-200", "$200-500")
bucketed <- cut(p, breaks = bins, labels = labels, right = FALSE)
for (lbl in labels) {
  cnt <- sum(bucketed == lbl, na.rm = TRUE)
  bar <- strrep("=", as.integer(cnt / length(p) * 35))
  cat(sprintf("   %-12s  %7s  (%.1f%%)  %s\n", lbl, format(cnt, big.mark = ","), cnt / length(p) * 100, bar))
}

# 8. AVERAGE RATING
cat("\n[8] AVERAGE_RATING\n")
r <- df_clean_myntra$average_rating
cat("  Min:", min(r, na.rm = TRUE), "| Max:", max(r, na.rm = TRUE), "| Mean:", round(mean(r, na.rm = TRUE), 3), "| Median:", median(r, na.rm = TRUE), "\n")
out_of_range <- sum(r < 1 | r > 5, na.rm = TRUE)
cat("  Out-of-range (< 1 or > 5):", out_of_range, if (out_of_range == 0) "OK" else "FAIL\n")
cat("\n  Rating Band Breakdown:\n")
bands <- list(
  list(5.0, 5.0, "5.0"),
  list(4.5, 4.9, "4.5-4.9"),
  list(4.2, 4.4, "4.2-4.4 [TRENDING ZONE]"),
  list(4.0, 4.1, "4.0-4.1"),
  list(3.0, 3.9, "3.0-3.9"),
  list(1.0, 2.9, "1.0-2.9")
)
for (b in bands) {
  lo <- b[[1]]; hi <- b[[2]]; name <- b[[3]]
  cnt <- sum(r >= lo & r <= hi, na.rm = TRUE)
  bar <- strrep("=", as.integer(cnt / length(r) * 30))
  cat(sprintf("   %-38s  %7s  (%.1f%%)  %s\n", name, format(cnt, big.mark = ","), cnt / length(r) * 100, bar))
}

# 9. RATING_NUMBER
cat("\n[9] RATING_NUMBER\n")
rn <- df_clean_myntra$rating_number
cat("  Min :", format(min(rn, na.rm = TRUE), big.mark = ","), "\n")
cat("  Max :", format(max(rn, na.rm = TRUE), big.mark = ","), "\n")
cat("  Mean:", format(round(mean(rn, na.rm = TRUE), 1), big.mark = ","), "\n")
cat("  Zeros:", sum(rn == 0, na.rm = TRUE), if (sum(rn == 0, na.rm = TRUE) == 0) "OK" else "FAIL\n")

# 10. BRAND
cat("\n[10] BRAND\n")
vc_b <- table(df_clean_myntra$brand)
cat("  Unique brands  :", format(length(vc_b), big.mark = ","), "\n")
cat("  'Unknown' count:", sum(df_clean_myntra$brand == "Unknown"), "\n")
cat("\n  Top 10 Brands:\n")
for (brand in head(names(sort(vc_b, decreasing = TRUE)), 10)) {
  bar <- strrep("=", as.integer(vc_b[brand] / max(vc_b) * 25))
  cat(sprintf("   %-30s  %6s  %s\n", brand, format(vc_b[brand], big.mark = ","), bar))
}

# 11. SOURCE MARKET
cat("\n[11] SOURCE_MARKET\n")
vc_sm <- table(df_clean_myntra$source_market)
for (mkt in names(vc_sm)) cat("  ", mkt, "->", format(vc_sm[mkt], big.mark = ","), "\n")
cat("  Only 'IN' values:", if (all(names(vc_sm) == "IN")) "OK" else "FAIL", "\n")

# 12. CROSS-FEATURE SANITY CHECKS
cat("\n[12] CROSS-FEATURE SANITY CHECKS\n")
mismatched <- sum((df_clean_myntra$average_rating >= 4.2 & df_clean_myntra$is_trending == "No") |
                    (df_clean_myntra$average_rating < 4.2 & df_clean_myntra$is_trending == "Yes"), na.rm = TRUE)
cat("  is_trending <-> rating mismatch rows:", format(mismatched, big.mark = ","), if (mismatched == 0) "OK" else "MISMATCH FOUND\n")

cat("\n  is_trending by Gender (cross-tab):\n")
ct <- table(Gender = df_clean_myntra$gender, is_trending = df_clean_myntra$is_trending)
print(ct)

cat("\n  Trending Rate by Top 10 Category:\n")
top10_cats <- head(names(sort(table(df_clean_myntra$individual_category), decreasing = TRUE)), 10)
for (cat_name in top10_cats) {
  sub <- df_clean_myntra[df_clean_myntra$individual_category == cat_name, ]
  pct <- mean(sub$is_trending == "Yes") * 100
  bar <- strrep("=", as.integer(pct / 100 * 30))
  cat(sprintf("   %-25s  %5.1f%% trending  %s\n", cat_name, pct, bar))
}

# 13. CONCAT READINESS
cat("\n[13] CONCAT READINESS — COLUMN ALIGNMENT PREVIEW\n")
cat(sprintf("\n   %-22s  Myntra dtype    Amazon dtype   Match?\n", "Column"))
cat("   ", strrep("-", 60), "\n")
amazon_dtypes <- c("parent_asin" = "character", "title" = "character", "gender" = "character",
                   "individual_category" = "character", "price_usd" = "numeric",
                   "brand" = "character", "average_rating" = "numeric",
                   "rating_number" = "integer", "is_trending" = "character",
                   "source_market" = "character")
for (col in EXPECTED_COLS) {
  m_dtype <- class(df_clean_myntra[[col]])[1]
  a_dtype <- amazon_dtypes[col]
  match   <- if (m_dtype == a_dtype) "OK" else "FAIL"
  cat(sprintf("   %-22s  %-16s %-14s %s\n", col, m_dtype, a_dtype, match))
}

# FINAL VERDICT
cat("\n", strrep("=", 68), "\n")
cat("  FINAL VERDICT\n")
cat(strrep("=", 68), "\n")
final_checks <- list(
  "Zero nulls"               = total_nulls == 0,
  "Zero duplicates"          = total_dups == 0,
  "Correct column order"     = col_order_ok,
  "All dtypes correct"       = all_ok,
  "Gender labels valid"      = valid_gender,
  "is_trending labels valid" = valid_vals,
  "No zero prices"           = sum(df_clean_myntra$price_usd == 0, na.rm = TRUE) == 0,
  "Price capped at $500"     = max(df_clean_myntra$price_usd, na.rm = TRUE) <= 500,
  "Rating in 1-5 range"     = out_of_range == 0,
  "No zero review counts"    = sum(df_clean_myntra$rating_number == 0, na.rm = TRUE) == 0,
  "is_trending <-> rating OK" = mismatched == 0,
  "source_market = IN only"  = all(df_clean_myntra$source_market == "IN")
)
all_passed <- all(unlist(final_checks))
for (check_name in names(final_checks)) {
  cat(sprintf("   %s  %s\n", if (final_checks[[check_name]]) "PASS" else "FAIL", check_name))
}
if (all_passed) cat("\n   ALL CHECKS PASSED — df_clean is CONCAT-READY\n") else
  cat("\n   FIX THE FAIL ITEMS ABOVE BEFORE CONCAT\n")
cat("\n   When ready, run: combined_df <- rbind(amazon_df_clean, df_clean)\n")
cat(strrep("=", 68), "\n")

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 17-18 — READ AMAZON CSV BACK                                    ║
# ╚══════════════════════════════════════════════════════════════════════════╝

df_clean_amazon <- read.csv("cleaned_amazon_fashion_dataset.csv", stringsAsFactors = FALSE)
cat("\nAmazon df reloaded:", nrow(df_clean_amazon), "rows x", ncol(df_clean_amazon), "cols\n")

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 19 — DATASET INTEGRATION: Amazon + Myntra                       ║
# ╚══════════════════════════════════════════════════════════════════════════╝

cat(strrep("=", 68), "\n")
cat("  PHASE 1: PRE-CONCAT FIXES & VALIDATION\n")
cat(strrep("=", 68), "\n")

# Fix Amazon: null titles + null brands
df_clean_amazon$title[df_clean_amazon$title == "" | is.na(df_clean_amazon$title)] <- "Unknown Product"
df_clean_amazon$brand[is.na(df_clean_amazon$brand)] <- "Unknown"

cat("Amazon  df shape:", format(nrow(df_clean_amazon), big.mark = ","), "rows x", ncol(df_clean_amazon), "cols\n")
cat("Myntra  df shape:", format(nrow(df_clean_myntra), big.mark = ","), "rows x", ncol(df_clean_myntra), "cols\n")

cat("\n", sprintf("%-22s %-16s %-16s %s\n", "Column", "Amazon dtype", "Myntra dtype", "Match?"))
cat(sep2, "\n")
all_match <- TRUE
for (col in names(df_clean_amazon)) {
  a_dt <- class(df_clean_amazon[[col]])[1]
  m_dt <- class(df_clean_myntra[[col]])[1]
  match <- if (a_dt == m_dt) "OK" else "FAIL"
  if (a_dt != m_dt) all_match <- FALSE
  cat(sprintf("%-22s %-16s %-16s %s\n", col, a_dt, m_dt, match))
}
cat("\nAll dtypes match:", if (all_match) "YES — safe to concat" else "FAIL — Fix dtypes first", "\n")

# PHASE 2: CONCATENATION
cat("\n", strrep("=", 68), "\n")
cat("  PHASE 2: CONCATENATION\n")
cat(strrep("=", 68), "\n")

combined_df <- rbind(df_clean_amazon, df_clean_myntra)

cat("\npd.concat complete!\n")
cat("  Amazon rows  :", format(nrow(df_clean_amazon), big.mark = ","), "\n")
cat("  Myntra rows  :", format(nrow(df_clean_myntra), big.mark = ","), "\n")
cat("  Combined rows:", format(nrow(combined_df), big.mark = ","), "\n")
cat("  Columns      :", ncol(combined_df), "\n")
row_check <- nrow(combined_df) == nrow(df_clean_amazon) + nrow(df_clean_myntra)
cat("  Row count OK :", if (row_check) "OK" else "ROW COUNT MISMATCH", "\n")

# Final dtype fixes
combined_df$rating_number  <- as.integer(combined_df$rating_number)
combined_df$price_usd      <- as.numeric(combined_df$price_usd)
combined_df$average_rating <- as.numeric(combined_df$average_rating)

# Encode target
combined_df$is_trending_binary <- ifelse(combined_df$is_trending == "Yes", 1L, 0L)
cat("\nAdded 'is_trending_binary' (1=Yes, 0=No) for model input\n")

# PHASE 3: FULL INTEGRATION CROSS-CHECK
cat("\n", strrep("=", 68), "\n")
cat("  PHASE 3: FULL INTEGRATION CROSS-CHECK\n")
cat(strrep("=", 68), "\n")

# 3.1 Shape & Nulls
cat("\n[3.1] SHAPE & NULL CHECK\n")
cat("  Final shape:", format(nrow(combined_df), big.mark = ","), "rows x", ncol(combined_df), "columns\n")
cat(sprintf("\n  %-22s %10s  %8s  %7s\n", "Column", "Non-Null", "Null", "Null%"))
cat("  ", sep2, "\n")
for (col in names(combined_df)) {
  nn  <- sum(!is.na(combined_df[[col]]))
  nul <- sum(is.na(combined_df[[col]]))
  pct <- nul / nrow(combined_df) * 100
  flag <- if (nul == 0) "OK" else "FAIL"
  cat(sprintf("  %-22s %10s  %8s  %6.2f%%  %s\n", col, format(nn, big.mark = ","), format(nul, big.mark = ","), pct, flag))
}

# 3.2 Source Market Split
cat("\n[3.2] SOURCE MARKET SPLIT\n")
vc_sm <- table(combined_df$source_market)
for (mkt in names(vc_sm)) {
  bar <- strrep("=", as.integer(vc_sm[mkt] / nrow(combined_df) * 35))
  cat(sprintf("   %s   %7s  (%.1f%%)  %s\n", mkt, format(vc_sm[mkt], big.mark = ","), vc_sm[mkt] / nrow(combined_df) * 100, bar))
}
cat("  Only US/IN values:", if (all(combined_df$source_market %in% c("US", "IN"))) "OK" else "FAIL", "\n")

# 3.3 Target Variable
cat("\n[3.3] TARGET VARIABLE — is_trending (combined)\n")
vc_t <- table(combined_df$is_trending)
for (label in names(vc_t)) {
  bar <- strrep("=", as.integer(vc_t[label] / nrow(combined_df) * 35))
  cat(sprintf("   %-5s %7s  (%.1f%%)  %s\n", label, format(vc_t[label], big.mark = ","), vc_t[label] / nrow(combined_df) * 100, bar))
}
imb <- max(vc_t) / min(vc_t)
cat("  Imbalance ratio:", round(imb, 2), "x", if (imb < 3) "acceptable for RF" else "consider resampling", "\n")
valid_vals <- all(combined_df$is_trending %in% c("Yes", "No"))
cat("  Only Yes/No    :", if (valid_vals) "OK" else "FAIL", "\n")

# 3.4 Gender Distribution
cat("\n[3.4] GENDER DISTRIBUTION (combined + by market)\n")
vc_g <- table(combined_df$gender)
for (g in names(vc_g)) {
  bar <- strrep("=", as.integer(vc_g[g] / nrow(combined_df) * 30))
  cat(sprintf("   %-8s %7s  (%.1f%%)  %s\n", g, format(vc_g[g], big.mark = ","), vc_g[g] / nrow(combined_df) * 100, bar))
}
valid_gender <- all(combined_df$gender %in% c("Men", "Women", "Youth"))
cat("  Valid labels (Men/Women/Youth):", if (valid_gender) "OK" else "FAIL", "\n")
cat("\n  Gender x Source Market:\n")
print(table(Gender = combined_df$gender, Market = combined_df$source_market))

# 3.5 Category Coverage
cat("\n[3.5] INDIVIDUAL CATEGORY COVERAGE\n")
vc_cat <- table(combined_df$individual_category)
cat("  Total unique categories:", length(vc_cat), "\n")
cat(sprintf("\n  %-28s %8s  %6s  Bar\n", "Category", "Count", "%"))
cat("  ", sep2, "\n")
for (cat_name in head(names(sort(vc_cat, decreasing = TRUE)), 20)) {
  bar <- strrep("=", as.integer(vc_cat[cat_name] / max(vc_cat) * 25))
  cat(sprintf("  %-28s %8s  %5.1f%%  %s\n", cat_name, format(vc_cat[cat_name], big.mark = ","), vc_cat[cat_name] / nrow(combined_df) * 100, bar))
}

cats_amazon <- unique(df_clean_amazon$individual_category)
cats_myntra <- unique(df_clean_myntra$individual_category)
only_amazon <- setdiff(cats_amazon, cats_myntra)
only_myntra <- setdiff(cats_myntra, cats_amazon)
shared      <- intersect(cats_amazon, cats_myntra)
cat("\n  Categories exclusive to Amazon (US):\n")
cat("  Amazon-only:", paste(sort(only_amazon), collapse = ", "), "\n")
cat("  Myntra-only:", paste(head(sort(only_myntra), 15), collapse = ", "), if (length(only_myntra) > 15) "..." else "", "\n")
cat("  Shared     :", length(shared), "categories overlap between markets\n")

# 3.6 Price Analysis
cat("\n[3.6] PRICE_USD — COMBINED & BY MARKET\n")
p <- combined_df$price_usd
cat("  Combined -> Min:", sprintf("$%.2f", min(p, na.rm = TRUE)), "Max:", sprintf("$%.2f", max(p, na.rm = TRUE)), "Mean:", sprintf("$%.2f", mean(p, na.rm = TRUE)), "Median:", sprintf("$%.2f", median(p, na.rm = TRUE)), "\n")
cat(sprintf("\n  %-8s  %7s  %8s  %8s  %8s\n", "Market", "Min", "Median", "Mean", "Max"))
cat("  ", strrep("-", 45), "\n")
for (mkt in c("US", "IN")) {
  sub <- combined_df$price_usd[combined_df$source_market == mkt]
  cat(sprintf("  %-8s  $%6.2f  $%7.2f  $%7.2f  $%7.2f\n", mkt, min(sub, na.rm = TRUE), median(sub, na.rm = TRUE), mean(sub, na.rm = TRUE), max(sub, na.rm = TRUE)))
}
cat("\n  Price Buckets (combined):\n")
bins   <- c(0, 5, 15, 30, 60, 100, 200, 500)
labels <- c("$0-5", "$5-15", "$15-30", "$30-60", "$60-100", "$100-200", "$200-500")
bucketed <- cut(p, breaks = bins, labels = labels, right = FALSE)
for (lbl in labels) {
  cnt <- sum(bucketed == lbl, na.rm = TRUE)
  bar <- strrep("=", as.integer(cnt / length(p) * 30))
  cat(sprintf("   %-12s  %7s  (%.1f%%)  %s\n", lbl, format(cnt, big.mark = ","), cnt / length(p) * 100, bar))
}

# 3.7 Rating Distribution
cat("\n[3.7] AVERAGE_RATING — COMBINED & BY MARKET\n")
r <- combined_df$average_rating
cat("  Combined -> Min:", min(r, na.rm = TRUE), "Max:", max(r, na.rm = TRUE), "Mean:", round(mean(r, na.rm = TRUE), 3), "Median:", median(r, na.rm = TRUE), "\n")
oor <- sum(r < 1 | r > 5, na.rm = TRUE)
cat("  Out-of-range (< 1 or > 5):", oor, if (oor == 0) "OK" else "FAIL", "\n")
for (mkt in c("US", "IN")) {
  sub <- combined_df$average_rating[combined_df$source_market == mkt]
  cat("  ", mkt, "-> Mean:", round(mean(sub, na.rm = TRUE), 3), "Median:", median(sub, na.rm = TRUE), "\n")
}

# 3.8 Cross-feature sanity
cat("\n[3.8] CROSS-FEATURE SANITY CHECKS\n")
mismatch <- sum((combined_df$average_rating >= 4.2 & combined_df$is_trending == "No") |
                  (combined_df$average_rating < 4.2 & combined_df$is_trending == "Yes"), na.rm = TRUE)
cat("  is_trending <-> rating mismatch rows:", format(mismatch, big.mark = ","), if (mismatch == 0) "OK" else "FAIL\n")
dups <- sum(duplicated(combined_df))
cat("  Duplicate rows                    :", format(dups, big.mark = ","), if (dups == 0) "OK" else "FAIL\n")

cat("\n  is_trending by Gender x Market:\n")
ct <- table(Gender = combined_df$gender, Market = combined_df$source_market, is_trending = combined_df$is_trending)
print(ct)

cat("\n  Trending Rate — Top 10 Combined Categories:\n")
top10 <- head(names(sort(table(combined_df$individual_category), decreasing = TRUE)), 10)
for (cat_name in top10) {
  sub <- combined_df[combined_df$individual_category == cat_name, ]
  pct <- mean(sub$is_trending == "Yes") * 100
  bar <- strrep("=", as.integer(pct / 100 * 30))
  cat(sprintf("   %-25s  %5.1f%% trending  %s\n", cat_name, pct, bar))
}

# 3.9 Model Feature Summary
cat("\n[3.9] RANDOM FOREST MODEL FEATURE SUMMARY\n")
cat(sprintf("\n   %-22s %-12s %-15s  %s\n", "Feature", "Type", "Cardinality/Range", "Notes"))
cat("   ", strrep("-", 65), "\n")
cat(sprintf("   %-22s %-12s %-15s  %s\n", "gender", "Categorical", as.character(length(unique(combined_df$gender))), "Men / Women / Youth"))
cat(sprintf("   %-22s %-12s %-15s  %s\n", "individual_category", "Categorical", as.character(length(unique(combined_df$individual_category))), paste(length(unique(combined_df$individual_category)), "unique types")))
cat(sprintf("   %-22s %-12s %-15s  %s\n", "price_usd", "Numeric", "-", paste(sprintf("$%.2f", min(p, na.rm = TRUE)), "-", sprintf("$%.2f", max(p, na.rm = TRUE)))))
cat(sprintf("   %-22s %-12s %-15s  %s\n", "brand", "Categorical", format(length(unique(combined_df$brand)), big.mark = ","), paste(format(length(unique(combined_df$brand)), big.mark = ","), "unique brands")))
cat("\n  Target  : is_trending  (Yes=1 / No=0)\n")
cat("  Formula : is_trending ~ gender + individual_category + price_usd + brand\n")

# 3.10 Sample rows
cat("\n[3.10] SAMPLE ROWS FROM EACH MARKET\n")
cat("\n  Amazon (US) — 3 random rows:\n")
amazon_sub <- combined_df[combined_df$source_market == "US", ]
set.seed(42)
print(amazon_sub[sample(nrow(amazon_sub), 3), c("gender", "individual_category", "price_usd", "brand", "average_rating", "is_trending", "source_market")])
cat("\n  Myntra (IN) — 3 random rows:\n")
myntra_sub <- combined_df[combined_df$source_market == "IN", ]
set.seed(42)
print(myntra_sub[sample(nrow(myntra_sub), 3), c("gender", "individual_category", "price_usd", "brand", "average_rating", "is_trending", "source_market")])

# FINAL VERDICT
cat("\n", strrep("=", 68), "\n")
cat("  FINAL INTEGRATION VERDICT\n")
cat(strrep("=", 68), "\n")
integration_checks <- list(
  "Row count = Amazon + Myntra"         = nrow(combined_df) == nrow(df_clean_amazon) + nrow(df_clean_myntra),
  "Zero nulls in combined df"           = sum(sapply(combined_df, function(x) sum(is.na(x)))) == 0,
  "Zero duplicate rows"                 = sum(duplicated(combined_df)) == 0,
  "Both markets present (US + IN)"      = all(combined_df$source_market %in% c("US", "IN")),
  "Gender labels valid"                 = all(combined_df$gender %in% c("Men", "Women", "Youth")),
  "is_trending only Yes/No"             = all(combined_df$is_trending %in% c("Yes", "No")),
  "is_trending <-> rating consistent"   = mismatch == 0,
  "Price: no zeros or negatives"        = sum(combined_df$price_usd <= 0, na.rm = TRUE) == 0,
  "Price capped at $500"                = max(combined_df$price_usd, na.rm = TRUE) <= 500,
  "Rating in valid range (1-5)"         = oor == 0,
  "is_trending_binary col exists (0/1)" = "is_trending_binary" %in% names(combined_df),
  "11 columns present"                  = ncol(combined_df) == 11
)
all_passed <- all(unlist(integration_checks))
for (check_name in names(integration_checks)) {
  cat(sprintf("   %s  %s\n", if (integration_checks[[check_name]]) "PASS" else "FAIL", check_name))
}
if (all_passed) cat("\n   ALL CHECKS PASSED — combined_df is MODEL-READY\n") else
  cat("\n   FIX FAIL ITEMS BEFORE MODELLING\n")
cat("\n   combined_df shape:", nrow(combined_df), "x", ncol(combined_df), "\n")
cat("\n   Next step -> Random Forest:\n")
cat("   features = ['gender','individual_category','price_usd','brand']\n")
cat("   target   = 'is_trending_binary'\n")
cat(strrep("=", 68), "\n")

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 20 — TARGETED FIXES: Gender Remap + Price Recap                 ║
# ╚══════════════════════════════════════════════════════════════════════════╝

cat(strrep("=", 68), "\n")
cat("  TARGETED FIXES — Gender Remap + Price Recap\n")
cat(strrep("=", 68), "\n")

# FIX 1: Gender — remap Unisex -> Youth
cat("\n[FIX 1] Gender Remap: Unisex -> Youth\n")
cat("  Before:", paste(names(table(combined_df$gender)), collapse = ", "), "\n")
combined_df$gender[combined_df$gender == "Unisex"] <- "Youth"
cat("  After :", paste(names(table(combined_df$gender)), collapse = ", "), "\n")
valid_gender <- all(combined_df$gender %in% c("Men", "Women", "Youth"))
cat("  Valid labels only (Men/Women/Youth):", if (valid_gender) "OK" else "FAIL", "\n")

# FIX 2: Price cap — reapply $500 ceiling
cat("\n[FIX 2] Price Cap — Reapply $500 ceiling\n")
over_500 <- sum(combined_df$price_usd > 500, na.rm = TRUE)
cat("  Rows above $500 BEFORE fix:", over_500, "\n")
cat("  Max price BEFORE:", sprintf("$%.2f", max(combined_df$price_usd, na.rm = TRUE)), "\n")

combined_df <- combined_df[combined_df$price_usd <= 500, ]

cat("  Rows removed:", over_500, "\n")
cat("  Max price AFTER:", sprintf("$%.2f", max(combined_df$price_usd, na.rm = TRUE)), "OK\n")
cat("  Rows remaining:", format(nrow(combined_df), big.mark = ","), "\n")

# Also fix amazon df
df_clean_amazon <- df_clean_amazon[df_clean_amazon$price_usd <= 500, ]
df_clean_amazon$gender[df_clean_amazon$gender == "Unisex"] <- "Youth"
cat("\namazon df also patched ->", format(nrow(df_clean_amazon), big.mark = ","), "rows\n")

# Recompute is_trending_binary
combined_df$is_trending_binary <- ifelse(combined_df$is_trending == "Yes", 1L, 0L)
cat("\nis_trending_binary recomputed\n")

# POST-FIX VERIFICATION
cat("\n", strrep("=", 68), "\n")
cat("  POST-FIX FINAL VERIFICATION\n")
cat(strrep("=", 68), "\n")

post_fix_checks <- list(
  "Row count sane (>210k)"              = nrow(combined_df) > 210000,
  "Zero nulls"                          = sum(sapply(combined_df, function(x) sum(is.na(x)))) == 0,
  "Zero duplicate rows"                 = sum(duplicated(combined_df)) == 0,
  "Both markets present (US + IN)"      = all(combined_df$source_market %in% c("US", "IN")),
  "Gender only Men/Women/Youth"         = all(combined_df$gender %in% c("Men", "Women", "Youth")),
  "No 'Unisex' remaining"               = !"Unisex" %in% combined_df$gender,
  "is_trending only Yes/No"             = all(combined_df$is_trending %in% c("Yes", "No")),
  "is_trending <-> rating consistent"   = sum((combined_df$average_rating >= 4.2 & combined_df$is_trending == "No") |
                                                (combined_df$average_rating < 4.2 & combined_df$is_trending == "Yes"), na.rm = TRUE) == 0,
  "Price: no zeros or negatives"        = sum(combined_df$price_usd <= 0, na.rm = TRUE) == 0,
  "Price capped at $500"                = max(combined_df$price_usd, na.rm = TRUE) <= 500,
  "Rating in valid range (1-5)"         = sum(combined_df$average_rating < 1 | combined_df$average_rating > 5, na.rm = TRUE) == 0,
  "is_trending_binary col exists (0/1)" = "is_trending_binary" %in% names(combined_df)
)
all_passed <- all(unlist(post_fix_checks))
for (check_name in names(post_fix_checks)) {
  cat(sprintf("   %s  %s\n", if (post_fix_checks[[check_name]]) "PASS" else "FAIL", check_name))
}

cat("\nFINAL STATS\n")
cat("  Shape         :", nrow(combined_df), "x", ncol(combined_df), "\n")
cat("  Price max     :", sprintf("$%.2f", max(combined_df$price_usd, na.rm = TRUE)), "\n")
cat("  Gender counts :", paste(names(table(combined_df$gender)), "=", table(combined_df$gender), collapse = ", "), "\n")
vc_t <- table(combined_df$is_trending)
cat("  is_trending   : Yes=", format(vc_t["Yes"], big.mark = ","), " No=", format(vc_t["No"], big.mark = ","), " Ratio=", round(max(vc_t) / min(vc_t), 2), "x\n", sep = "")
cat("  source_market :", paste(names(table(combined_df$source_market)), "=", table(combined_df$source_market), collapse = ", "), "\n")

if (all_passed) cat("\nALL CHECKS PASSED — combined_df is FULLY MODEL-READY\n") else
  cat("\nSTILL HAS ISSUES\n")
cat("\n   Next step -> Random Forest:\n")
cat("   features = ['gender', 'individual_category', 'price_usd', 'brand']\n")
cat("   target   = 'is_trending_binary'\n")
cat(strrep("=", 68), "\n")

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 21 — VALUE COUNTS FOR KEY COLUMNS (COMBINED)                    ║
# ╚══════════════════════════════════════════════════════════════════════════╝

important_cols <- c("gender", "individual_category", "source_market", "is_trending")
cat(strrep("=", 60), "\n")
cat("VALUE COUNTS FOR KEY COLUMNS (COMBINED DATASET)\n")
cat(strrep("=", 60), "\n")

for (col in important_cols) {
  cat("\nColumn:", col, "\n")
  cat(strrep("-", 25), "\n")
  counts      <- sort(table(combined_df[[col]]), decreasing = TRUE)
  proportions <- round(prop.table(counts) * 100, 2)
  summary_df  <- data.frame(Count = as.integer(counts), Percentage = as.numeric(proportions))
  if (nrow(summary_df) > 15) {
    cat("(Showing top 15 of", nrow(summary_df), "unique values)\n")
    print(head(summary_df, 15))
  } else {
    print(summary_df)
  }
}

cat("\n", strrep("=", 60), "\n")
cat("Total records in combined_df:", format(nrow(combined_df), big.mark = ","), "\n")

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  CELL 22-23 — SAVE CSVs                                               ║
# ╚══════════════════════════════════════════════════════════════════════════╝

write.csv(df_clean_myntra, "cleaned_myntra_fashion_dataset.csv", row.names = FALSE)
cat("Cleaned Myntra dataset saved as 'cleaned_myntra_fashion_dataset.csv'\n")

write.csv(combined_df, "merged_fashion_dataset_us_in.csv", row.names = FALSE)
cat("Merged dataset saved as 'merged_fashion_dataset_us_in.csv'\n")
