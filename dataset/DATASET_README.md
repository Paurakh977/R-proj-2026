# Fashion Product Trending Prediction Dataset

## Overview
This dataset contains fashion product information from Amazon US market, with the goal of predicting whether a product will become "trending" based on its attributes.

**File:** `merged_fashion_dataset_us_in.csv`  
**Total Rows:** 214,318  
**Total Columns:** 11  
**Missing Values:** None (complete dataset)

---

## Complete Data Statistics

### Dataset Shape
- **Rows:** 214,318
- **Columns:** 11
- **Memory:** 96.82 MB
- **Missing Values:** 0 (complete dataset)

### Column Summary Table

| # | Column | Dtype | Non-Null | Null | Unique | Sample Values |
|---|--------|-------|----------|------|--------|---------------|
| 1 | parent_asin | str | 214,318 | 0 | 214,318 | B07SB2892S, B08FMLXY1Z |
| 2 | title | str | 214,318 | 0 | 191,586 | RONNOX Women's 3-Pairs... |
| 3 | gender | str | 214,318 | 0 | 3 | Women, Men, Youth |
| 4 | individual_category | str | 214,318 | 0 | 106 | tshirts, tops, dresses |
| 5 | price_usd | float64 | 214,318 | 0 | 6,267 | 17.99, 9.99, 26.99 |
| 6 | brand | str | 214,318 | 0 | 13,195 | RONNOX, LYCKYY, Nike |
| 7 | average_rating | float64 | 214,318 | 0 | 41 | 4.3, 3.7, 3.6 |
| 8 | rating_number | int64 | 214,318 | 0 | 1,392 | 3032, 52, 7 |
| 9 | is_trending | str | 214,318 | 0 | 2 | Yes, No |
| 10 | source_market | str | 214,318 | 0 | 2 | US, IN |
| 11 | is_trending_binary | int64 | 214,318 | 0 | 2 | 1, 0 |

### Numerical Columns Detailed Statistics

#### `price_usd`
| Statistic | Value |
|-----------|-------|
| dtype | float64 |
| count | 214,318 |
| mean | 25.22 |
| std | 21.39 |
| min | 0.01 |
| 1st percentile | 4.06 |
| 5th percentile | 7.07 |
| 10th percentile | 9.05 |
| 25th percentile | 13.76 |
| 50th percentile (median) | 20.35 |
| 75th percentile | 29.93 |
| 90th percentile | 43.10 |
| 95th percentile | 58.31 |
| 99th percentile | 107.00 |
| max | 499.95 |
| skewness | 5.62 (right-skewed) |
| kurtosis | 63.26 |

#### `average_rating`
| Statistic | Value |
|-----------|-------|
| dtype | float64 |
| count | 214,318 |
| mean | 4.11 |
| std | 0.50 |
| min | 1.0 |
| 25th percentile | 3.9 |
| 50th percentile (median) | 4.2 |
| 75th percentile | 4.4 |
| max | 5.0 |
| skewness | -1.39 (left-skewed) |
| kurtosis | 4.20 |
| Unique values | 41 (1.0, 1.1, 1.2, ... 4.9, 5.0) |

#### `rating_number`
| Statistic | Value |
|-----------|-------|
| dtype | int64 |
| count | 214,318 |
| mean | 68.81 |
| std | 268.45 |
| min | 1 |
| 1st percentile | 2 |
| 5th percentile | 5 |
| 10th percentile | 5 |
| 25th percentile | 8 |
| 50th percentile (median) | 19 |
| 75th percentile | 54 |
| 90th percentile | 154 |
| 95th percentile | 306 |
| 99th percentile | 759 |
| max | 46,299 |
| skewness | 73.55 (highly right-skewed) |
| kurtosis | 9,352.08 |
| Products with 1 rating | 486 |
| Products with 10+ ratings | 151,542 |
| Products with 100+ ratings | 31,598 |
| Products with 1000+ ratings | 434 |

### Categorical Columns Detailed Statistics

#### `gender`
| Value | Count | Percentage | Trending Rate |
|-------|-------|------------|---------------|
| Women | 126,452 | 59.00% | 53.22% |
| Men | 74,705 | 34.86% | 52.39% |
| Youth | 13,161 | 6.14% | 60.25% |

#### `is_trending` / `is_trending_binary`
| Value | Count | Percentage |
|-------|-------|------------|
| Yes (1) | 114,367 | 53.36% |
| No (0) | 99,951 | 46.64% |

#### `source_market`
| Value | Count | Percentage | Trending Rate | Avg Price | Avg Rating |
|-------|-------|------------|---------------|-----------|------------|
| IN | 185,957 | 86.77% | 52.44% | $24.63 | 4.09 |
| US | 28,361 | 13.23% | 59.42% | $29.12 | 4.19 |

#### `individual_category` (All 106 Categories)
| Category | Count | Percentage | Trending Rate |
|----------|-------|------------|---------------|
| tshirts | 22,625 | 10.56% | - |
| tops | 15,402 | 7.19% | - |
| dresses | 13,449 | 6.28% | - |
| jeans | 13,102 | 6.11% | - |
| kurtas | 11,685 | 5.45% | - |
| shirts | 10,687 | 4.99% | - |
| trousers | 10,009 | 4.67% | - |
| Accessories | 9,681 | 4.52% | - |
| kurta-sets | 8,789 | 4.10% | - |
| bra | 8,004 | 3.73% | - |
| track-pants | 7,024 | 3.28% | - |
| Other | 6,716 | 3.13% | - |
| sweatshirts | 6,020 | 2.81% | - |
| jackets | 5,397 | 2.52% | - |
| shorts | 5,264 | 2.46% | 68.14% |
| sarees | 5,113 | 2.39% | - |
| briefs | 4,472 | 2.09% | 67.51% |
| night-suits | 4,189 | 1.95% | - |
| sweaters | 3,514 | 1.64% | - |
| T-Shirt | 2,957 | 1.38% | - |
| lounge-pants | 2,580 | 1.20% | - |
| nightdress | 2,532 | 1.18% | - |
| Underwear | 2,378 | 1.11% | - |
| leggings | 1,804 | 0.84% | 67.24% |
| skirts | 1,681 | 0.78% | - |
| trunk | 1,680 | 0.78% | - |
| tights | 1,658 | 0.77% | - |
| boxers | 1,513 | 0.71% | - |
| jumpsuit | 1,332 | 0.62% | - |
| socks | 1,322 | 0.62% | 70.42% |
| dupatta | 1,246 | 0.58% | - |
| Dress | 1,087 | 0.51% | - |
| lounge-shorts | 1,021 | 0.48% | 69.93% |
| Shoes | 933 | 0.44% | - |
| innerwear-vests | 897 | 0.42% | - |
| Shirt | 880 | 0.41% | - |
| palazzos | 864 | 0.40% | - |
| Pants | 861 | 0.40% | - |
| lingerie-set | 751 | 0.35% | - |
| nehru-jackets | 707 | 0.33% | - |
| lehenga-choli | 698 | 0.33% | - |
| Socks | 697 | 0.33% | 74.32% |
| shrug | 695 | 0.32% | - |
| blazers | 639 | 0.30% | - |
| tracksuits | 577 | 0.27% | - |
| jeggings | 554 | 0.26% | - |
| Jacket | 494 | 0.23% | - |
| camisoles | 484 | 0.23% | - |
| saree-blouse | 474 | 0.22% | - |
| Sweater | 448 | 0.21% | - |
| shapewear | 412 | 0.19% | - |
| capris | 402 | 0.19% | - |
| baby-dolls | 377 | 0.18% | - |
| Shorts | 372 | 0.17% | - |
| lounge-tshirts | 334 | 0.16% | 78.44% |
| dress-material | 330 | 0.15% | - |
| kurtis | 320 | 0.15% | - |
| swimwear | 296 | 0.14% | - |
| sherwani | 276 | 0.13% | - |
| coats | 256 | 0.12% | - |
| Activewear | 254 | 0.12% | - |
| Jeans | 252 | 0.12% | - |
| dhotis | 228 | 0.11% | - |
| tunics | 221 | 0.10% | - |
| thermal-tops | 202 | 0.09% | 78.22% |
| bath-robe | 200 | 0.09% | - |
| pyjamas | 198 | 0.09% | - |
| stockings | 131 | 0.06% | - |
| shawl | 118 | 0.06% | - |
| dungarees | 107 | 0.05% | - |
| churidar | 106 | 0.05% | - |
| Jumpsuit | 105 | 0.05% | - |
| co-ords | 104 | 0.05% | - |
| Swimwear | 91 | 0.04% | - |
| thermal-bottoms | 90 | 0.04% | 70.00% |
| flats | 81 | 0.04% | - |
| Skirt | 80 | 0.04% | - |
| sports-sandals | 73 | 0.03% | - |
| stoles | 73 | 0.03% | - |
| patiala | 69 | 0.03% | - |
| salwar | 67 | 0.03% | - |
| earrings | 60 | 0.03% | 68.33% |
| robe | 56 | 0.03% | - |
| Coat | 47 | 0.02% | - |
| waistcoat | 46 | 0.02% | - |
| saree-accessories | 44 | 0.02% | - |
| casual-shoes | 40 | 0.02% | - |
| thermal-set | 30 | 0.01% | - |
| Kurta | 28 | 0.01% | - |
| patiala-and-dupatta | 27 | 0.01% | - |
| burqas | 21 | 0.01% | - |
| rain-jacket | 16 | 0.01% | 75.00% |
| lingerie-accessories | 13 | 0.01% | 69.23% |
| suits | 13 | 0.01% | - |
| slips | 12 | 0.01% | - |
| swim-bottoms | 11 | 0.01% | - |
| clothing-set | 10 | 0.00% | - |
| outdoor-masks | 8 | 0.00% | 87.50% |
| salwar-and-dupatta | 8 | 0.00% | - |
| scarves | 5 | 0.00% | - |
| necklace-and-chains | 5 | 0.00% | - |
| boots | 2 | 0.00% | - |
| harem-pants | 2 | 0.00% | - |
| hair-accessory | 1 | 0.00% | - |
| sleepsuit | 1 | 0.00% | 100.00% |
| heels | 1 | 0.00% | 100.00% |

#### `brand` (Top 30 by Count)
| Brand | Count | Percentage |
|-------|-------|------------|
| Roadster | 7,589 | 3.54% |
| HERE&NOW | 5,054 | 2.36% |
| Mast & Harbour | 4,137 | 1.93% |
| HRX by Hrithik Roshan | 3,953 | 1.84% |
| DressBerry | 3,871 | 1.81% |
| Puma | 2,944 | 1.37% |
| Sangria | 2,891 | 1.35% |
| URBANIC | 2,460 | 1.15% |
| Tokyo Talkies | 2,222 | 1.04% |
| MANGO | 1,980 | 0.92% |
| Anouk | 1,924 | 0.90% |
| HIGHLANDER | 1,906 | 0.89% |
| Flying Machine | 1,906 | 0.89% |
| WROGN | 1,608 | 0.75% |
| Clovia | 1,607 | 0.75% |
| max | 1,590 | 0.74% |
| Sztori | 1,580 | 0.74% |
| Jockey | 1,568 | 0.73% |
| plusS | 1,507 | 0.70% |
| Moda Rapido | 1,487 | 0.69% |
| Pepe Jeans | 1,399 | 0.65% |
| H&M | 1,396 | 0.65% |
| Levis | 1,378 | 0.64% |
| SASSAFRAS | 1,344 | 0.63% |
| U.S. Polo Assn. | 1,246 | 0.58% |
| Zivame | 1,178 | 0.55% |
| Vero Moda | 1,163 | 0.54% |
| Marks & Spencer | 1,107 | 0.52% |
| Vishudh | 1,059 | 0.49% |
| SOJANYA | 1,055 | 0.49% |

#### Brand Frequency Distribution
| Products per Brand | Number of Brands |
|-------------------|------------------|
| 1 | 7,822 |
| 2-4 | 3,186 |
| 5-9 | 817 |
| 10-49 | 815 |
| 50-99 | 202 |
| 100-499 | 275 |
| 500-999 | 47 |
| 1,000-9,999 | 31 |

### Title Statistics
| Statistic | Value |
|-----------|-------|
| dtype | str |
| Unique titles | 191,586 |
| Mean length (chars) | 60.20 |
| Std length | 22.37 |
| Min length | 2 |
| Median length | 56 |
| Max length | 1,536 |
| Mean word count | 9.76 |
| Median word count | 9 |
| Max word count | 283 |

### Correlation Matrix

| | price_usd | average_rating | rating_number | is_trending_binary |
|---|-----------|----------------|---------------|-------------------|
| price_usd | 1.0000 | -0.0301 | -0.0372 | -0.0231 |
| average_rating | -0.0301 | 1.0000 | 0.0036 | 0.7340 |
| rating_number | -0.0372 | 0.0036 | 1.0000 | 0.0315 |
| is_trending_binary | -0.0231 | 0.7340 | 0.0315 | 1.0000 |

### Group Statistics

#### Price by Gender
| Gender | Count | Mean | Std | Min | 25% | 50% | 75% | Max |
|--------|-------|------|-----|-----|-----|-----|-----|-----|
| Men | 74,705 | $26.42 | $21.95 | - | - | $22.74 | $30.00 | $499.95 |
| Women | 126,452 | $24.48 | $19.04 | - | - | $20.35 | $29.10 | $489.99 |
| Youth | 13,161 | $25.59 | $34.92 | - | - | $14.99 | $26.98 | $499.00 |

#### Price by Trending Status
| Trending | Count | Mean | Std | Median |
|----------|-------|------|-----|--------|
| No | 99,951 | $25.75 | $20.98 | $21.54 |
| Yes | 114,367 | $24.76 | $21.73 | $20.35 |

#### Rating by Gender
| Gender | Count | Mean | Std | Min | 25% | 50% | 75% | Max |
|--------|-------|------|-----|-----|-----|-----|-----|-----|
| Men | 74,705 | 4.11 | 0.49 | 1.0 | 3.9 | 4.2 | 4.4 | 5.0 |
| Women | 126,452 | 4.10 | 0.51 | 1.0 | 3.9 | 4.2 | 4.4 | 5.0 |
| Youth | 13,161 | 4.21 | 0.53 | 1.5 | 3.9 | 4.3 | 4.6 | 5.0 |

#### Rating by Trending Status
| Trending | Count | Mean | Std | Min | 25% | 50% | 75% | Max |
|----------|-------|------|-----|-----|-----|-----|-----|-----|
| No | 99,951 | 3.71 | 0.44 | 1.0 | 3.6 | 3.8 | 4.0 | 4.1 |
| Yes | 114,367 | 4.45 | 0.22 | 4.2 | 4.3 | 4.4 | 4.6 | 5.0 |

#### Rating Count by Gender
| Gender | Count | Mean | Std | Min | 25% | 50% | 75% | Max |
|--------|-------|------|-----|-----|-----|-----|-----|-----|
| Men | 74,705 | 67.61 | 241.12 | 1 | 8 | 19 | 53 | 36,058 |
| Women | 126,452 | 68.05 | 225.02 | 1 | 8 | 20 | 55 | 31,452 |
| Youth | 13,161 | 82.90 | 597.36 | 5 | 8 | 18 | 48 | 46,299 |

---

## Quick Reference: Encoding Guide

| Column | Type | Action | Encoding Method |
|--------|------|--------|-----------------|
| `parent_asin` | ID | **DROP** | N/A |
| `source_market` | Categorical (2) | **One-Hot or Target** | Has signal (US trends more) |
| `is_trending` | String | **DROP** | Use binary version |
| `is_trending_binary` | Target | **KEEP** | N/A (this is your y) |
| `gender` | Categorical (3) | **One-Hot** | pd.get_dummies() |
| `individual_category` | Categorical (106) | **Target Encoding** | Mean with smoothing |
| `brand` | Categorical (13K) | **Group + Target** | Group rare (<10) then target encode |
| `price_usd` | Numerical | **Log Transform** | np.log1p() |
| `average_rating` | Numerical (1-5) | **No Transform** | Keep as-is |
| `rating_number` | Numerical | **Log Transform** | np.log1p() |
| `title` | Text | **Optional** | Extract length, word count, keywords |

---

## Target Variable

### `is_trending` / `is_trending_binary`
- **Type:** Binary classification
- **Distribution:**
  - Yes (1): 114,367 (53.4%)
  - No (0): 99,951 (46.6%)
- **Balance:** Relatively balanced (~53% positive class)

---

## Features

### 1. `parent_asin` (String)
- **Description:** Amazon Standard Identification Number (unique product identifier)
- **Unique Values:** 214,318 (all unique)
- **Usage:** Drop this column (not a feature, just an ID)

### 2. `title` (String)
- **Description:** Product title/name
- **Unique Values:** 191,586
- **Usage:** Can be used for NLP feature engineering (text length, keywords, etc.)

### 3. `gender` (Categorical)
- **Description:** Target gender category
- **Values:**
  - Women: 126,452 (59.0%)
  - Men: 74,705 (34.9%)
  - Youth: 13,161 (6.1%)
- **Trending Rate by Gender:**
  - Youth: 60.3% (highest)
  - Women: 53.2%
  - Men: 52.4%

### 4. `individual_category` (Categorical)
- **Description:** Product category
- **Unique Values:** 106 categories
- **Top 10 Categories:**
  1. tshirts: 22,625 (10.6%)
  2. tops: 15,402 (7.2%)
  3. dresses: 13,449 (6.3%)
  4. jeans: 13,102 (6.1%)
  5. kurtas: 11,685 (5.4%)
  6. shirts: 10,687 (5.0%)
  7. trousers: 10,009 (4.7%)
  8. Accessories: 9,681 (4.5%)
  9. kurta-sets: 8,789 (4.1%)
  10. bra: 8,004 (3.7%)

- **High Trending Rate Categories (>65%):**
  - sleepsuit: 100% (small sample)
  - heels: 100% (small sample)
  - outdoor-masks: 87.5%
  - lounge-tshirts: 78.4%
  - thermal-tops: 78.2%
  - Socks: 74.3%
  - socks: 70.4%
  - thermal-bottoms: 70.0%
  - lounge-shorts: 69.9%
  - shorts: 68.1%
  - briefs: 67.5%
  - leggings: 67.2%

### 5. `price_usd` (Numerical)
- **Description:** Product price in USD
- **Statistics:**
  - Mean: $25.22
  - Std: $21.39
  - Min: $0.01
  - 25%: $13.76
  - 50%: $20.35
  - 75%: $29.93
  - Max: $499.95

- **Price Range Distribution:**
  - $0-10: 28,464 (13.3%) - 60.5% trending
  - $10-20: 71,444 (33.3%) - 53.6% trending
  - $20-50: 99,519 (46.4%) - 51.5% trending
  - $50-100: 12,581 (5.9%) - 50.6% trending
  - $100+: 2,310 (1.1%) - 51.9% trending

- **Correlation with Trending:** -0.023 (very weak negative)

### 6. `brand` (Categorical)
- **Description:** Product brand name
- **Unique Values:** 13,195 brands
- **Top 10 Brands:**
  1. Roadster: 7,589 (3.5%)
  2. HERE&NOW: 5,054 (2.4%)
  3. Mast & Harbour: 4,137 (1.9%)
  4. HRX by Hrithik Roshan: 3,953 (1.8%)
  5. DressBerry: 3,871 (1.8%)
  6. Puma: 2,944 (1.4%)
  7. Sangria: 2,891 (1.3%)
  8. URBANIC: 2,460 (1.1%)
  9. Tokyo Talkies: 2,222 (1.0%)
  10. MANGO: 1,980 (0.9%)

- **Brand Concentration:**
  - Top 10 brands: 17.3% of data
  - Brands with only 1 product: 7,822 (59.3%)
  - Brands with 10+ products: 1,370 (10.4%)

### 7. `average_rating` (Numerical)
- **Description:** Average customer rating (1-5 scale)
- **Statistics:**
  - Mean: 4.11
  - Std: 0.50
  - Min: 1.0
  - 25%: 3.9
  - 50%: 4.2
  - 75%: 4.4
  - Max: 5.0

- **Correlation with Trending:** 0.734 (strong positive)
- **Rating by Trending Status:**
  - Trending (Yes): Mean 4.45
  - Not Trending (No): Mean 3.71

### 8. `rating_number` (Numerical)
- **Description:** Number of ratings/reviews
- **Statistics:**
  - Mean: 68.81
  - Std: 268.45
  - Min: 1
  - 25%: 8
  - 50%: 19
  - 75%: 54
  - Max: 46,299

- **Correlation with Trending:** 0.032 (very weak positive)
- **Rating Count by Trending Status:**
  - Trending (Yes): Mean 76.72
  - Not Trending (No): Mean 59.75

### 9. `source_market` (Categorical)
- **Description:** Market source (US or India)
- **Data type:** str
- **Unique values:** 2
- **Values:**
  - IN (India): 185,957 (86.8%)
  - US: 28,361 (13.2%)
- **Trending rate by market:**
  - US: 59.42% trending
  - IN: 52.44% trending
- **Price by market:**
  - US: Mean $29.12, Median $17.85
  - IN: Mean $24.63, Median $21.54
- **Rating by market:**
  - US: Mean 4.19
  - IN: Mean 4.09

### 10. `is_trending` (String)
- **Description:** Original target variable (Yes/No)
- **Usage:** Convert to binary or use `is_trending_binary`

### 11. `is_trending_binary` (Integer)
- **Description:** Binary target variable (1=Yes, 0=No)
- **Usage:** This is your target variable for modeling

---

## Feature Engineering Recommendations

### Must-Do Preprocessing
1. **Drop columns:** `parent_asin`, `is_trending` (use binary version)
2. **Encode categorical variables:** `gender`, `individual_category`, `brand`, `source_market`
3. **Handle high-cardinality brands:** Consider grouping rare brands into "Other"
4. **Scale numerical features:** `price_usd`, `average_rating`, `rating_number`
5. **Log transform skewed features:** `price_usd`, `rating_number`

---

## Encoding Strategy (Column-by-Column)

### Columns to DROP
| Column | Reason |
|--------|--------|
| `parent_asin` | Unique ID, no predictive power |
| `is_trending` | Use `is_trending_binary` instead |

### Categorical Columns - Encoding Methods

| Column | Cardinality | Recommended Encoding | Why |
|--------|-------------|---------------------|-----|
| `gender` | 3 values | **One-Hot Encoding** | Low cardinality, no ordinal relationship |
| `individual_category` | 106 values | **Target Encoding** | High cardinality, one-hot creates 106 columns |
| `brand` | 13,195 values | **Target Encoding + Grouping** | Very high cardinality, 59% are singletons |
| `source_market` | 2 values | **One-Hot Encoding** | Low cardinality, US has higher trending rate |

#### `gender` - One-Hot Encoding
```python
# One-hot encode gender (only 3 values)
df = pd.get_dummies(df, columns=['gender'], prefix='gender', drop_first=False)
# Creates: gender_Men, gender_Women, gender_Youth
```
- **Why One-Hot:** Only 3 categories, no natural order
- **Alternative:** Label encoding works too (Youth=0, Women=1, Men=2)

#### `individual_category` - Target Encoding
```python
# Target encoding for category (106 values)
# Calculate mean of target for each category
category_stats = df.groupby('individual_category')['is_trending_binary'].agg(['mean', 'count'])
# Add smoothing for categories with few samples
global_mean = df['is_trending_binary'].mean()
min_samples = 50
smooth_factor = 10

category_stats['smoothed'] = (
    (category_stats['count'] * category_stats['mean'] + smooth_factor * global_mean) 
    / (category_stats['count'] + smooth_factor)
)
df['category_encoded'] = df['individual_category'].map(category_stats['smoothed'])
```
- **Why Target Encoding:** 106 categories would create too many columns with one-hot
- **Alternative:** Frequency encoding (count or percentage)

#### `brand` - Grouping + Target Encoding
```python
# Step 1: Group rare brands into "Other"
brand_counts = df['brand'].value_counts()
rare_brands = brand_counts[brand_counts < 10].index  # Brands with <10 products
df['brand_grouped'] = df['brand'].replace(rare_brands, 'Other')

# Step 2: Target encoding for grouped brands
brand_stats = df.groupby('brand_grouped')['is_trending_binary'].agg(['mean', 'count'])
brand_stats['smoothed'] = (
    (brand_stats['count'] * brand_stats['mean'] + smooth_factor * global_mean) 
    / (brand_stats['count'] + smooth_factor)
)
df['brand_encoded'] = df['brand_grouped'].map(brand_stats['smoothed'])
```
- **Why Group + Target:** 13K brands is too many; grouping reduces to ~5K
- **Alternative Options:**
  - Frequency encoding: `df['brand_freq'] = df['brand'].map(df['brand'].value_counts() / len(df))`
  - Hash encoding: Use `hashlib` to create fixed-size brand representation
  - Leave as-is for tree-based models (they handle high cardinality better)

### Numerical Columns - Transformation Methods

| Column | Distribution | Recommended Transform | Why |
|--------|--------------|----------------------|-----|
| `price_usd` | Right-skewed | **Log Transform** | Reduce skewness, handle outliers |
| `average_rating` | Left-skewed | **None or Clip** | Already 1-5 scale, strong predictor |
| `rating_number` | Highly right-skewed | **Log Transform** | Range 1 to 46,299, huge variance |

#### `price_usd` - Log Transform
```python
# Log transform price (handles skewness)
df['log_price'] = np.log1p(df['price_usd'])  # log(1+x) handles $0 prices

# Optional: Create price bins
df['price_bin'] = pd.cut(df['price_usd'], 
                         bins=[0, 10, 20, 50, 100, 500],
                         labels=['0-10', '10-20', '20-50', '50-100', '100+'])
```
- **Why Log:** Price ranges from $0.01 to $499.95 (skewed)
- **After Log:** More normal distribution, better for linear models

#### `average_rating` - No Transform Needed
```python
# Already on 1-5 scale, strong predictor (correlation: 0.734)
# Optional: Clip outliers
df['rating_clipped'] = df['average_rating'].clip(1.0, 5.0)
```
- **Why No Transform:** Already bounded 1-5, strong predictor as-is
- **Optional:** Create rating bins for non-linear models

#### `rating_number` - Log Transform
```python
# Log transform rating count (highly skewed)
df['log_rating_count'] = np.log1p(df['rating_number'])

# Optional: Create popularity bins
df['popularity'] = pd.cut(df['rating_number'],
                          bins=[0, 10, 50, 200, 50000],
                          labels=['new', 'low', 'medium', 'high'])
```
- **Why Log:** Range 1 to 46,299 (huge variance)
- **After Log:** More manageable range

### Title Column - Feature Extraction (Optional)
```python
# Extract features from title
df['title_length'] = df['title'].str.len()
df['title_word_count'] = df['title'].str.split().str.len()

# Keyword flags
df['has_women'] = df['title'].str.lower().str.contains('women|woman|ladies', na=False).astype(int)
df['has_men'] = df['title'].str.lower().str.contains('men|man|male', na=False).astype(int)
df['has_kids'] = df['title'].str.lower().str.contains('kids|children|boy|girl', na=False).astype(int)
```
- **Why:** Can capture additional signal from product names

---

## Complete Preprocessing Pipeline

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Load data
df = pd.read_csv('dataset/merged_fashion_dataset_us_in.csv')

# 1. Drop unnecessary columns
df = df.drop(['parent_asin', 'is_trending'], axis=1)

# 2. Handle brand grouping
brand_counts = df['brand'].value_counts()
rare_brands = brand_counts[brand_counts < 10].index
df['brand'] = df['brand'].replace(rare_brands, 'Other')

# 3. Target encoding for category
global_mean = df['is_trending_binary'].mean()
smooth_factor = 10

cat_stats = df.groupby('individual_category')['is_trending_binary'].agg(['mean', 'count'])
cat_stats['encoded'] = (cat_stats['count'] * cat_stats['mean'] + smooth_factor * global_mean) / (cat_stats['count'] + smooth_factor)
df['category_encoded'] = df['individual_category'].map(cat_stats['encoded'])

# 4. Target encoding for brand
brand_stats = df.groupby('brand')['is_trending_binary'].agg(['mean', 'count'])
brand_stats['encoded'] = (brand_stats['count'] * brand_stats['mean'] + smooth_factor * global_mean) / (brand_stats['count'] + smooth_factor)
df['brand_encoded'] = df['brand'].map(brand_stats['encoded'])

# 5. One-hot encode gender and source_market
df = pd.get_dummies(df, columns=['gender', 'source_market'], prefix=['gender', 'market'], drop_first=False)

# 6. Log transforms
df['log_price'] = np.log1p(df['price_usd'])
df['log_rating_count'] = np.log1p(df['rating_number'])

# 7. Feature interactions
df['rating_x_count'] = df['average_rating'] * df['log_rating_count']

# 8. Drop original categorical columns
df = df.drop(['individual_category', 'brand'], axis=1)

# 9. Define features and target
X = df.drop(['is_trending_binary'], axis=1)
y = df['is_trending_binary']

# 10. Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 11. Scale numerical features (for linear models)
scaler = StandardScaler()
numerical_cols = ['price_usd', 'average_rating', 'rating_number', 
                  'log_price', 'log_rating_count', 'rating_x_count',
                  'category_encoded', 'brand_encoded']
X_train[numerical_cols] = scaler.fit_transform(X_train[numerical_cols])
X_test[numerical_cols] = scaler.transform(X_test[numerical_cols])
```

---

## Feature Engineering Ideas

### Additional Features to Create

1. **Title features:**
   - Title length
   - Number of words
   - Contains specific keywords (e.g., "women", "men", "kids")

2. **Price features:**
   - Price bins (0-10, 10-20, 20-50, 50-100, 100+)
   - Log price
   - Price relative to category average

3. **Rating features:**
   - Rating bins (1-3, 3-4, 4-4.5, 4.5-5)
   - Log rating_number
   - Rating * rating_number (interaction)

4. **Category features:**
   - Category frequency
   - Category trending rate (target encoding)

---

## Model Training Recommendations

### Baseline Models to Try
1. **Logistic Regression** (with scaling)
2. **Random Forest** (handle categorical natively)
3. **XGBoost/LightGBM** (best for tabular data)
4. **CatBoost** (handles categorical variables well)

### Evaluation Metrics
- **Primary:** AUC-ROC (balanced dataset)
- **Secondary:** F1-score, Precision, Recall
- **Classification Report:** Check precision/recall for both classes

### Cross-Validation
- Use **Stratified K-Fold** (5 or 10 folds)
- Target variable is ~53/47 split, so stratification helps

### Class Imbalance
- Dataset is relatively balanced (53/47)
- No heavy resampling needed
- If needed, use class_weight='balanced' in models

---

## Key Insights for Modeling

1. **Strongest Predictor:** `average_rating` (correlation: 0.734)
   - Products with higher ratings are much more likely to trend
   - Trending products have avg rating 4.45 vs 3.71 for non-trending

2. **Price Effect:** Weak negative correlation (-0.023)
   - Cheaper products ($0-10) have slightly higher trending rate (60.5%)
   - Expensive products ($100+) have 51.9% trending rate

3. **Gender Effect:** Youth products trend more (60.3%)
   - Women: 53.2%
   - Men: 52.4%

4. **Category Effect:** Some categories have very high trending rates
   - Comfort/loungewear categories trend more
   - Formal/specialty categories trend less

5. **Brand Effect:** High cardinality challenge
   - Many one-time brands
   - Top brands don't dominate (top 10 = 17.3%)

---

## Python Code Template

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
import xgboost as xgb

# Load data
df = pd.read_csv('dataset/merged_fashion_dataset_us_in.csv')

# Drop unnecessary columns
df = df.drop(['parent_asin', 'is_trending'], axis=1)

# Handle brand encoding (group rare brands)
brand_counts = df['brand'].value_counts()
rare_brands = brand_counts[brand_counts < 10].index
df['brand'] = df['brand'].replace(rare_brands, 'Other')

# Encode categoricals
le_gender = LabelEncoder()
df['gender_encoded'] = le_gender.fit_transform(df['gender'])

le_cat = LabelEncoder()
df['category_encoded'] = le_cat.fit_transform(df['individual_category'])

le_brand = LabelEncoder()
df['brand_encoded'] = le_brand.fit_transform(df['brand'])

# Feature engineering
df['log_price'] = np.log1p(df['price_usd'])
df['log_rating_count'] = np.log1p(df['rating_number'])
df['rating_x_count'] = df['average_rating'] * df['log_rating_count']

# Select features
feature_cols = ['price_usd', 'average_rating', 'rating_number', 
                'gender_encoded', 'category_encoded', 'brand_encoded',
                'log_price', 'log_rating_count', 'rating_x_count']

X = df[feature_cols]
y = df['is_trending_binary']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train XGBoost
model = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    eval_metric='logloss'
)
model.fit(X_train_scaled, y_train)

# Predictions
y_pred = model.predict(X_test_scaled)
y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]

# Evaluation
print("Classification Report:")
print(classification_report(y_test, y_pred))
print(f"\nAUC-ROC: {roc_auc_score(y_test, y_pred_proba):.4f}")
```

---

## Expected Model Performance

Based on the strong correlation of `average_rating` (0.734), you should expect:
- **Random Forest/XGBoost:** AUC-ROC 0.85-0.92
- **Logistic Regression:** AUC-ROC 0.80-0.85

The `average_rating` feature alone should provide strong predictive power. Adding other features may improve performance by 2-5%.

---

## Notes for Data Science Agent

1. **Target is balanced** - No need for SMOTE or heavy resampling
2. **Brand encoding is critical** - High cardinality (13K brands)
3. **Rating is the key feature** - 73% correlation with target
4. **Price has weak signal** - Consider log transformation
5. **Category has 106 values** - Target encoding may work best
6. **Title can be exploited** - NLP features could help
7. **Youth products trend more** - Consider interaction features
