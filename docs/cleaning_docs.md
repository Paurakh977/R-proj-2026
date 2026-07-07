# Data Preparation Report: Amazon Fashion (US) & Myntra Fashion (India) Datasets

## Cross-Market Fashion Trend Prediction — Data Sourcing, Cleaning & Integration Methodology

---

## 1. Project Objective

The goal of this data preparation project was to build a single, clean, model-ready dataset that combines fashion product data from **two different markets** — the **United States (Amazon)** and **India (Myntra)** — so that a machine learning model (Random Forest) can later be trained to predict whether a fashion product is **"trending"** based on attributes such as gender segment, product category, price, and brand.

Because the two source datasets came from completely different platforms, countries, currencies, and taxonomies, the project required:

1. Independent exploration and cleaning of each dataset
2. Harmonizing both datasets into a **common schema**
3. Merging them into one **unified combined dataset**
4. Validating the final dataset for modeling readiness

---

## 2. Dataset 1: Amazon Fashion (US Market)

### 2.1 Source

- **Source:** McAuley-Lab "Amazon-Reviews-2023" dataset (Hugging Face), subset `raw_meta_Amazon_Fashion`
- **Nature of data:** Product metadata (not review text) for Amazon Fashion listings in the US marketplace
- **Raw size:** 826,108 products
- **Raw columns:** 16 fields, including `main_category`, `title`, `average_rating`, `rating_number`, `features`, `description`, `price`, `images`, `videos`, `store`, `categories`, `details`, `parent_asin`, `bought_together`, `subtitle`, `author`

### 2.2 Nature and Quality of the Raw Data

The raw Amazon dataset was very "wide" and rich in unstructured/semi-structured content but **not directly usable** for tabular modeling:

| Issue | Description |
|---|---|
| Price stored as text | Prices were stored as free-text strings (e.g., `"$17.99"`), not numeric values |
| Media-heavy columns | `images` and `videos` were nested arrays of URLs — irrelevant to a tabular prediction model |
| No explicit gender field | Gender was **not** a standalone column; it had to be inferred from the `details` JSON blob and/or the product `title` |
| No explicit category field | Product category (T-shirt, Dress, Shoes, etc.) had to be inferred from free-text titles since `categories` was largely empty |
| Sparse metadata columns | `bought_together`, `subtitle`, and `author` were **100% empty** and unusable |
| Rating volume varied wildly | Some products had only 1–2 ratings, making their `average_rating` statistically unreliable |
| No pre-existing "trending" label | A target variable had to be engineered from the rating data |

### 2.3 What We Observed First, and Why That Shaped the Cleaning Plan

Before writing any cleaning logic, the raw Amazon dataframe was inspected end-to-end (`df.info()`, a full-record deep dive on a sample product, and a spreadsheet preview). This initial inspection directly shaped every decision made afterward:

| What We Observed | Why We Chose This Response |
|---|---|
| `df.info()` showed **826,108 rows** but only **16 columns**, with `bought_together`, `subtitle`, and `author` all showing **0 non-null values** | Since these three columns were 100% empty, there was nothing to clean or impute — they were simply dropped rather than wasting effort trying to recover unusable fields |
| The deep-dive on a sample record showed `price` stored as a string field, and `images`/`videos` stored as nested arrays of dictionaries (URLs, variants) | This confirmed the raw file could not be fed directly into any model — numeric parsing of price was mandatory, and the image/video fields were purely descriptive/visual, so they were dropped rather than engineered into features |
| There was **no standalone gender column** anywhere in the schema, and no standalone "category" column either — `categories` existed but was largely an empty array | This meant gender and category could not simply be extracted — they had to be **inferred**. We chose a two-source strategy (structured `details` JSON first, then free-text `title` as a fallback) for gender, and a keyword-matching approach against `title` for category, since these were the only fields dense enough to mine reliably |
| Running the gender-extraction logic across all 826,108 rows produced: **Unknown/Unisex ≈ 422,350 (51%)**, **Female ≈ 301,535 (36%)**, **Male ≈ 102,223 (12%)** | The very large "Unknown" share confirmed that a large portion of Amazon Fashion listings are genuinely gender-neutral or under-described (e.g., generic accessories) — this was accepted as a real characteristic of the marketplace rather than a defect, and these rows were later folded into a "Youth/Unisex" bucket instead of being discarded |
| After parsing price as text-to-numeric, **775,859 of 826,108 rows (94%)** were dropped for having missing or non-positive prices | This was the single largest data-loss step in the entire pipeline. It confirmed that the *raw metadata table* includes a huge number of "shell" listings (discontinued products, incomplete listings, or entries with no active price) that are not real, purchasable products — dropping them was necessary because a model cannot use price as a feature if the value doesn't exist, and these rows carry no reliable signal for "is this product trending" either |
| Of the remaining priced rows, filtering to `rating_number ≥ 5` removed a further **21,814 rows** | This confirmed that even among priced products, a meaningful number had extremely few reviews (1–4), which would make their `average_rating` an unreliable, noisy signal — removing them protected the integrity of the engineered target variable |
| After all filters, `individual_category` inference resulted in "Other" at **23.7%** of the remaining rows | This was checked explicitly against a "more than 50% unclassified" warning threshold; since 23.7% is comfortably below that threshold, the keyword-based category taxonomy was judged **acceptable** and not re-engineered further |
| A price-outlier scan (`price_usd > 500`) surfaced clearly legitimate luxury products — e.g., a Seiko watch at \$920, a Raymond Weil watch at \$1,237, and a Prada handbag at \$2,695 | This confirmed the outliers were **real high-end products**, not data errors, so they were **not deleted** at this stage — instead, a price cap was scheduled for later (during merge preparation) purely to keep the price feature on a comparable scale with the lower-priced Indian market, not because the values were invalid |

### 2.4 Cleaning & Feature Engineering Methodology — Amazon Dataset

Based on the observations above, the cleaning was carried out as a structured, multi-step pipeline. Each step and its rationale are outlined below.

| Step | Action | Rationale |
|---|---|---|
| **Step 0 — Gender extraction** | Derived a `extracted_gender` field by scanning the `details` JSON for department/gender keywords (e.g., "women", "men", "girl", "boy") and, as a fallback, scanning the product `title` for gendered keywords (e.g., "women's", "men's") | Gender was not a native column; a rule-based two-pass extraction (structured field first, free text second) maximized coverage while minimizing false positives |
| **Step 1 — Drop irrelevant columns** | Removed `bought_together`, `subtitle`, `author`, `images`, `videos`, `main_category` | These were either fully empty, purely visual/media assets, or not relevant to a tabular trend-prediction model |
| **Step 2 — Price cleaning** | Extracted numeric values from the raw price text using pattern matching, converted to `price_usd` (float), and removed rows with missing or non-positive prices | Machine learning models require numeric price input; unpriced/free listings are not meaningful "products" for this analysis |
| **Step 3 — Minimum review threshold** | Removed products with fewer than 5 ratings | A product with only 1–2 ratings can show an artificially high or low average rating; this "confidence filter" ensures the rating signal used for the target variable is statistically meaningful |
| **Step 4 — Drop missing ratings** | Removed rows where `average_rating` itself was missing | A product with no rating cannot be labeled trending or not trending |
| **Step 5 — Gender harmonization** | Mapped raw gender values into 3 standard buckets: **Men**, **Women**, **Youth** (anything ambiguous/unisex was placed into Youth at this stage, later renamed) | Standardizing gender values is essential before this field can later be merged with the Myntra dataset, which uses its own labeling convention |
| **Step 6 — Category inference from title** | Built a keyword dictionary (19 categories: T-Shirt, Shirt, Jeans, Dress, Jacket, Sweater, Pants, Shorts, Skirt, Shoes, Socks, Underwear, Swimwear, Accessories, Activewear, Kurta, Coat, Jumpsuit) and scanned each title for the first matching keyword; anything unmatched was labeled **"Other"** | Since Amazon's own `categories` field was largely empty, this rule-based approach recovers a usable product-type feature directly from titles |
| **Step 7 — Brand & target variable** | Set `brand` from `store` (filling blanks with "Unknown"); engineered the target `is_trending` as **Yes** if `average_rating ≥ 4.2`, else **No**; tagged all rows `source_market = 'US'` | A 4.2 rating threshold was chosen as a reasonable dividing line between "well-received" and "average/below-average" products, based on the overall rating distribution |
| **Step 8 — Final column selection** | Reduced the dataset to 10 standardized columns: `parent_asin`, `title`, `gender`, `individual_category`, `price_usd`, `brand`, `average_rating`, `rating_number`, `is_trending`, `source_market` | This defines the **common schema** that the Myntra dataset would later be transformed to match |

### 2.4 Result of Amazon Cleaning

| Metric | Raw | After Cleaning |
|---|---|---|
| Rows | 826,108 | 28,435 |
| Columns | 16 | 10 |
| Nulls | Present (various) | 0 |
| Duplicate rows | — | 0 |

**Key distributions after cleaning:**

- **Gender split:** Youth 46.4% · Women 33.6% · Men 20.1%
- **Category split:** Accessories was the largest group (34.2%), followed by "Other" (23.7%), T-Shirt (10.5%), Underwear (8.4%), and smaller shares across Dress, Shoes, Shirt, Pants, etc.
- **Price:** Mean $31.81, median $17.91, ranging from $0.01 up to extreme outliers over $6,000 (luxury watches/handbags), later addressed during merging
- **Rating:** Mean 4.19, median 4.30 — indicating the Amazon Fashion catalog skews toward well-rated products
- **Target balance (`is_trending`):** Yes 59.4% / No 40.6% — a reasonably balanced target

A full audit (null checks, duplicate checks, valid-value checks, cross-tabulations of rating vs. trending label, price distribution buckets, and brand frequency) confirmed the cleaned Amazon dataset was internally consistent and ready for merging.

---

## 3. Dataset 2: Myntra Fashion (India Market)

### 3.1 Source

- **Source:** Kaggle dataset — "Myntra Fashion Dataset" (`manishmathias/myntra-fashion-dataset`)
- **Nature of data:** Product listings scraped from Myntra, India's major fashion e-commerce platform
- **Raw size:** 526,564 products
- **Raw columns:** 13 fields — `URL`, `Product_id`, `BrandName`, `Category`, `Individual_category`, `category_by_Gender`, `Description`, `DiscountPrice (in Rs)`, `OriginalPrice (in Rs)`, `DiscountOffer`, `SizeOption`, `Ratings`, `Reviews`

### 3.2 Nature and Quality of the Raw Data

| Issue | Description |
|---|---|
| High missingness in ratings | ~63.8% of products had **no rating or review count at all** |
| High missingness in discount price | ~36.7% missing `DiscountPrice` (not critical, since `OriginalPrice` was fully populated) |
| Prices in Indian Rupees (INR) | Needed currency conversion to align with the Amazon dataset (USD) |
| Gender only 2 categories | `category_by_Gender` only contained **Men** and **Women** — no unisex/kids designation directly, though the wider dataset separately implied Boys/Girls in some category labels |
| Very granular category taxonomy | `Individual_category` had **92 unique values** — far more granular than Amazon's simple keyword-based taxonomy (e.g., "tshirts", "kurta-sets", "track-pants", "night-suits") |
| No identifier compatible with Amazon | `Product_id` was a numeric Myntra-internal ID, incompatible with Amazon's `parent_asin` format |
| No pre-existing "trending" label | Same as Amazon — a target variable needed to be engineered |

### 3.3 Cleaning & Feature Engineering Methodology — Myntra Dataset

| Step | Action | Rationale |
|---|---|---|
| **Step 1** | Copied the raw dataframe | Preserve raw data for reference |
| **Step 2** | Dropped `URL` and `Product_id` | Not useful features for prediction; identifiers with no analytical value once a new surrogate key is created |
| **Step 3** | Kept only rows where `Ratings` was **not null** | 63.8% of rows had no rating information at all; without a rating, no trending label can be assigned, so these rows carried no signal for the modeling task |
| **Step 4** | Kept only rows where `Reviews > 0` | Ensures the surviving rating values are backed by at least one real review, consistent with the "confidence filter" applied to the Amazon side |
| **Step 5** | Dropped any remaining nulls in `category_by_Gender`, `OriginalPrice`, `Individual_category` | Guarantees completeness on the three core categorical/numeric features used downstream |
| **Step 6** | Generated a new surrogate key `parent_asin` in the format `MYNTRA_<index>` | Creates an ID scheme structurally analogous to Amazon's `parent_asin`, enabling clean concatenation later without ID collisions |
| **Step 7** | Renamed `Description` → `title` | Myntra's "Description" field functions as the product's display title (e.g., "Roadster Men Navy Blue Solid Round Neck T-shirt"), equivalent in role to Amazon's `title` |
| **Step 8** | Mapped gender labels: Men→Men, Women→Women, Boys→Youth, Girls→Youth; dropped anything unmapped | Aligns Myntra's gender taxonomy with the same 3-bucket scheme used for Amazon (Men / Women / Youth) |
| **Step 9** | Renamed `Individual_category` → `individual_category`, trimmed whitespace | Direct carry-over of Myntra's native (and more granular) category taxonomy; no keyword inference needed here since Myntra already provided explicit categories |
| **Step 10** | Converted `OriginalPrice (in Rs)` to `price_usd` using a fixed exchange rate (1 USD ≈ 83.5 INR), removed nulls/zero prices, and capped at $500 | Currency harmonization was essential for a fair, comparable price feature across markets; the $500 cap removed extreme luxury-item outliers that would otherwise distort a shared price scale with Amazon |
| **Step 11** | Renamed `BrandName` → `brand`, filled missing with "Unknown" | Matches Amazon's brand-field convention |
| **Step 12** | Renamed `Ratings` → `average_rating`, `Reviews` → `rating_number`, cast to numeric types | Matches Amazon's column names and data types exactly |
| **Step 13** | Engineered `is_trending` using the **same ≥ 4.2 threshold** as Amazon | Keeping the exact same rule across both markets ensures the target variable means the same thing regardless of source, which is essential for a fair, unbiased combined model |
| **Step 14** | Tagged all rows `source_market = 'IN'` | Preserves market origin as a feature/flag for later analysis |
| **Step 15** | Reordered/selected the same 10 final columns used for Amazon | Guarantees schema compatibility for concatenation |
| **Step 16** | Final null and duplicate check | Confirms pipeline integrity before merge |

### 3.4 Result of Myntra Cleaning

| Metric | Raw | After Cleaning |
|---|---|---|
| Rows | 526,564 | 185,957 |
| Columns | 13 | 10 |
| Nulls | Present (Ratings 63.8%, DiscountPrice 36.7%, etc.) | 0 |
| Duplicate rows | 0 | 0 |

**Key distributions after cleaning:**

- **Gender split:** Women 62.9% · Men 37.1%
- **Category split:** Dominated by T-shirts (12.2%), Tops (8.3%), Dresses (7.2%), Jeans (7.0%), Kurtas (6.3%), and Shirts (5.7%), spread across 87 distinct category labels
- **Price:** Mean $24.63, median $21.54, max capped naturally near $437 (only 1 row exceeded $500 and was removed)
- **Rating:** Mean 4.09, median 4.20 — slightly lower average than Amazon but a very similar median
- **Target balance (`is_trending`):** Yes 52.4% / No 47.6% — a well-balanced target, close to a 50/50 split

A structural audit (schema/dtype comparison against the Amazon column set, null/duplicate verification, gender validity, category breakdown, price and rating distribution buckets, brand frequency, and rating-vs-trending consistency checks) confirmed the Myntra dataset was fully compatible with the Amazon schema and ready for concatenation.

---

## 4. Schema Harmonization Summary

Before the two datasets could be combined, both were engineered independently to converge on a single **common schema** of 10 columns:

| Column | Type | Description | Origin (Amazon) | Origin (Myntra) |
|---|---|---|---|---|
| `parent_asin` | Text (ID) | Unique product identifier | Native Amazon ASIN | Surrogate `MYNTRA_<index>` |
| `title` | Text | Product name/description | Native `title` | Renamed from `Description` |
| `gender` | Categorical | Men / Women / Youth | Extracted from `details` + `title`, then harmonized | Mapped from `category_by_Gender` (+ Boys/Girls → Youth) |
| `individual_category` | Categorical | Product type | Inferred via keyword matching on `title` (19 categories) | Native Myntra taxonomy (87–92 categories) |
| `price_usd` | Numeric | Price in US Dollars | Parsed from raw price text | Converted from INR at ~83.5 INR/USD |
| `brand` | Text | Brand/store name | From `store` | From `BrandName` |
| `average_rating` | Numeric (1–5) | Average customer rating | Native `average_rating` | Native `Ratings` |
| `rating_number` | Numeric | Number of ratings/reviews | Native `rating_number`, filtered ≥ 5 | Native `Reviews`, filtered > 0 |
| `is_trending` | Categorical (Yes/No) | Target label | `average_rating ≥ 4.2` → Yes | `average_rating ≥ 4.2` → Yes (same rule) |
| `source_market` | Categorical | Origin market | `'US'` | `'IN'` |

Using **identical column names, identical data types, and an identical target-labeling rule (≥4.2 rating threshold)** across both datasets was the central design decision that made a fair merge possible — it ensures the combined dataset does not have two different definitions of "trending" hiding inside one column.

---

## 5. Merging Methodology

### 5.1 Pre-Merge Validation

Before concatenation, both cleaned dataframes were checked column-by-column to confirm:

- Identical column **names** and **order**
- Identical column **data types** (`object`, `float64`, `int64` matched exactly)
- Any small residual nulls found in the Amazon dataset (2 blank titles, 3 blank brands) were patched with placeholder values ("Unknown Product" / "Unknown") prior to merging

### 5.2 Concatenation

The two cleaned datasets were combined using a row-wise concatenation (`pd.concat`), stacking Myntra's 185,957 rows beneath Amazon's 28,435 rows, producing an initial combined dataset of **214,392 rows × 10 columns**. A binary version of the target variable (`is_trending_binary`: 1 = Yes, 0 = No) was also added at this stage to make the label directly usable by a Random Forest classifier.

### 5.3 Post-Merge Corrections

Merging two independently cleaned datasets surfaced two residual inconsistencies that were not visible until the datasets were viewed side-by-side:

| Issue Found | Explanation | Fix Applied |
|---|---|---|
| **"Unisex" label leftover** | The Amazon-side gender harmonization step had used the label "Unisex" for ambiguous cases, while the Myntra-side pipeline used "Youth" for its equivalent bucket (Boys/Girls) — these were logically the same concept but named differently, so the combined dataset ended up with 4 gender values (Men, Women, Unisex, Youth) instead of 3 | Remapped all "Unisex" values to "Youth" so the final gender feature has exactly 3 clean categories: **Men, Women, Youth** |
| **Price cap violated post-merge** | Although each dataset was individually capped at $500 before merging, 74 Amazon rows with luxury items (e.g., watches, designer handbags) had actually been carried through with prices up to $6,199.95, since the $500 cap had only been applied to the Myntra dataset at that stage, not consistently enforced on the Amazon side prior to concatenation | Reapplied a strict `price_usd ≤ 500` filter across the full combined dataset, removing 74 outlier luxury-item rows |

### 5.4 Final Combined Dataset

| Metric | Value |
|---|---|
| Final rows | 214,318 |
| Final columns | 11 (10 shared + `is_trending_binary`) |
| Nulls | 0 |
| Duplicate rows | 0 |
| Source market split | India (IN): 185,957 (86.7%) · US: 28,361 (13.3%) |
| Gender split | Women 126,452 (59.0%) · Men 74,705 (34.8%) · Youth 13,161 (6.1%) |
| Target split (`is_trending`) | Yes 114,367 (53.4%) · No 99,951 (46.6%) — imbalance ratio 1.14×, considered acceptable for classification without resampling |
| Price range | $0.01 – $499.95 |
| Rating range | 1.0 – 5.0 (mean 4.11, median 4.2) |
| Unique product categories | 106 (19 from Amazon's keyword taxonomy + 87 native Myntra categories, with **zero direct overlap** in category naming between the two markets) |
| Unique brands | 13,214 |

---

## 6. Final Data Quality Assurance Checklist

The combined dataset was validated against a full checklist prior to being marked model-ready:

| Check | Result |
|---|---|
| Row count = Amazon rows + Myntra rows | ✅ Pass |
| Zero null values across all columns | ✅ Pass |
| Zero duplicate rows | ✅ Pass |
| Both source markets present (US and IN only) | ✅ Pass |
| Gender restricted to Men / Women / Youth only | ✅ Pass (after fix) |
| `is_trending` restricted to Yes / No only | ✅ Pass |
| `is_trending` label logically consistent with the 4.2 rating threshold | ✅ Pass |
| No zero or negative prices | ✅ Pass |
| Price capped at $500 across the entire combined dataset | ✅ Pass (after fix) |
| Ratings within valid 1–5 range | ✅ Pass |
| Binary target column present for modeling | ✅ Pass |

---

## 7. Key Observations from the Combined Dataset

- **Market imbalance:** The combined dataset is dominated by Indian (Myntra) listings (86.7%), so any model trained on it will naturally learn more from Indian pricing/category patterns unless market-aware balancing is applied later.
- **Category taxonomy mismatch:** Amazon's categories were inferred through keyword rules (broad, 19 buckets), while Myntra's categories came natively from the platform (granular, 87+ buckets). This means `individual_category` behaves differently across markets — a modeling consideration, not just a cleaning one.
- **Rating behavior is fairly similar across markets:** Mean rating for US (4.19) vs. India (4.09) — close enough that the shared 4.2 "trending" threshold is defensible for both.
- **Price behavior differs by market:** US listings show a wider price spread (higher-end products, e.g., watches/bags before capping) while Indian listings cluster more tightly in the $15–$30 range.
- **Category-level trending patterns:** Certain categories such as T-shirts and Accessories showed the highest trending rates (>60%), while categories like Jeans and Kurtas trended less often — a pattern that held up consistently across both source markets.

---

## 8. Output Files Produced

| File | Contents |
|---|---|
| `cleaned_amazon_fashion_dataset.csv` | Final cleaned Amazon (US) dataset, 10 standardized columns |
| `cleaned_myntra_fashion_dataset.csv` | Final cleaned Myntra (India) dataset, 10 standardized columns |
| `merged_fashion_dataset_us_in.csv` | Final combined, validated, model-ready dataset (214,318 rows × 11 columns) |

---

