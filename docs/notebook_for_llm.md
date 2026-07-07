# Cell 1 (code)

# 1. Install the specific version of datasets needed to bypass the HuggingFace error
!pip install datasets==2.19.0 pandas

from datasets import load_dataset
import pandas as pd

# ==============================================================================
# STEP 1: DOWNLOAD THE DATASET
# ==============================================================================
print("Downloading Amazon Fashion Metadata (Product Details)...")
dataset = load_dataset(
    "McAuley-Lab/Amazon-Reviews-2023",
    "raw_meta_Amazon_Fashion",
    split="full",
    trust_remote_code=True
)

# Convert to Pandas DataFrame for easy viewing
df = dataset.to_pandas()

# ==============================================================================
# STEP 2: SHOW BASIC INFO & ALL COLUMNS
# ==============================================================================
print("\n" + "="*50)
print(f"✅ TOTAL PRODUCTS IN DATASET: {len(df):,}")
print("="*50)

print("\n📋 ALL AVAILABLE COLUMNS:")
for col in df.columns:
    print(f" ➔ {col}")

# ==============================================================================
# STEP 3: DEEP DIVE INTO ONE SPECIFIC PRODUCT
# This shows you EXACTLY what kind of data is hidden in the columns
# ==============================================================================
print("\n" + "="*50)
print("🔍 DEEP DIVE: LOOKING AT THE EXACT DATA FOR 1 PRODUCT")
print("="*50)

# Grab the 5th product in the dataset as an example
sample_product = df.iloc[4].to_dict()

for key, value in sample_product.items():
    print(f"{key.upper()}:")
    print(f"  {value}\n")

# ==============================================================================
# STEP 4: DISPLAY THE SPREADSHEET VIEW
# ==============================================================================
print("\n📊 SPREADSHEET VIEW (First 5 Rows):")
# In Colab, 'display' makes a beautiful, interactive table you can scroll through
display(df.head(5))

## Output
```
Collecting datasets==2.19.0
  Downloading datasets-2.19.0-py3-none-any.whl.metadata (19 kB)
Requirement already satisfied: pandas in /usr/local/lib/python3.12/dist-packages (2.2.2)
Requirement already satisfied: filelock in /usr/local/lib/python3.12/dist-packages (from datasets==2.19.0) (3.29.2)
Requirement already satisfied: numpy>=1.17 in /usr/local/lib/python3.12/dist-packages (from datasets==2.19.0) (2.0.2)
Requirement already satisfied: pyarrow>=12.0.0 in /usr/local/lib/python3.12/dist-packages (from datasets==2.19.0) (18.1.0)
Collecting pyarrow-hotfix (from datasets==2.19.0)
  Downloading pyarrow_hotfix-0.7-py3-none-any.whl.metadata (3.6 kB)
Requirement already satisfied: dill<0.3.9,>=0.3.0 in /usr/local/lib/python3.12/dist-packages (from datasets==2.19.0) (0.3.8)
Requirement already satisfied: requests>=2.19.0 in /usr/local/lib/python3.12/dist-packages (from datasets==2.19.0) (2.32.4)
Requirement already satisfied: tqdm>=4.62.1 in /usr/local/lib/python3.12/dist-packages (from datasets==2.19.0) (4.67.3)
Requirement already satisfied: xxhash in /usr/local/lib/python3.12/dist-packages (from datasets==2.19.0) (3.7.0)
Requirement already satisfied: multiprocess in /usr/local/lib/python3.12/dist-packages (from datasets==2.19.0) (0.70.16)
Collecting fsspec<=2024.3.1,>=2023.1.0 (from fsspec[http]<=2024.3.1,>=2023.1.0->datasets==2.19.0)
  Downloading fsspec-2024.3.1-py3-none-any.whl.metadata (6.8 kB)
Requirement already satisfied: aiohttp in /usr/local/lib/python3.12/dist-packages (from datasets==2.19.0) (3.14.1)
Requirement already satisfied: huggingface-hub>=0.21.2 in /usr/local/lib/python3.12/dist-packages (from datasets==2.19.0) (1.18.0)
Requirement already satisfied: packaging in /usr/local/lib/python3.12/dist-packages (from datasets==2.19.0) (26.2)
Requirement already satisfied: pyyaml>=5.1 in /usr/local/lib/python3.12/dist-packages (from datasets==2.19.0) (6.0.3)
Requirement already satisfied: python-dateutil>=2.8.2 in /usr/local/lib/python3.12/dist-packages (from pandas) (2.9.0.post0)
Requirement already satisfied: pytz>=2020.1 in /usr/local/lib/python3.12/dist-packages (from pandas) (2025.2)
Requirement already satisfied: tzdata>=2022.7 in /usr/local/lib/python3.12/dist-packages (from pandas) (2026.2)
Requirement already satisfied: aiohappyeyeballs>=2.5.0 in /usr/local/lib/python3.12/dist-packages (from aiohttp->datasets==2.19.0) (2.6.2)
Requirement already satisfied: aiosignal>=1.4.0 in /usr/local/lib/python3.12/dist-packages (from aiohttp->datasets==2.19.0) (1.4.0)
Requirement already satisfied: attrs>=17.3.0 in /usr/local/lib/python3.12/dist-packages (from aiohttp->datasets==2.19.0) (26.1.0)
Requirement already satisfied: frozenlist>=1.1.1 in /usr/local/lib/python3.12/dist-packages (from aiohttp->datasets==2.19.0) (1.8.0)
Requirement already satisfied: multidict<7.0,>=4.5 in /usr/local/lib/python3.12/dist-packages (from aiohttp->datasets==2.19.0) (6.7.1)
Requirement already satisfied: propcache>=0.2.0 in /usr/local/lib/python3.12/dist-packages (from aiohttp->datasets==2.19.0) (0.5.2)
Requirement already satisfied: typing_extensions>=4.4 in /usr/local/lib/python3.12/dist-packages (from aiohttp->datasets==2.19.0) (4.15.0)
Requirement already satisfied: yarl<2.0,>=1.17.0 in /usr/local/lib/python3.12/dist-packages (from aiohttp->datasets==2.19.0) (1.24.2)
Requirement already satisfied: click>=8.4.0 in /usr/local/lib/python3.12/dist-packages (from huggingface-hub>=0.21.2->datasets==2.19.0) (8.4.1)
Requirement already satisfied: hf-xet<2.0.0,>=1.4.3 in /usr/local/lib/python3.12/dist-packages (from huggingface-hub>=0.21.2->datasets==2.19.0) (1.5.1)
Requirement already satisfied: httpx<1,>=0.23.0 in /usr/local/lib/python3.12/dist-packages (from huggingface-hub>=0.21.2->datasets==2.19.0) (0.28.1)
Requirement already satisfied: typer<0.26.0,>=0.20.0 in /usr/local/lib/python3.12/dist-packages (from huggingface-hub>=0.21.2->datasets==2.19.0) (0.25.1)
Requirement already satisfied: six>=1.5 in /usr/local/lib/python3.12/dist-packages (from python-dateutil>=2.8.2->pandas) (1.17.0)
Requirement already satisfied: charset_normalizer<4,>=2 in /usr/local/lib/python3.12/dist-packages (from requests>=2.19.0->datasets==2.19.0) (3.4.7)
Requirement already satisfied: idna<4,>=2.5 in /usr/local/lib/python3.12/dist-packages (from requests>=2.19.0->datasets==2.19.0) (3.18)
Requirement already satisfied: urllib3<3,>=1.21.1 in /usr/local/lib/python3.12/dist-packages (from requests>=2.19.0->datasets==2.19.0) (2.5.0)
Requirement already satisfied: certifi>=2017.4.17 in /usr/local/lib/python3.12/dist-packages (from requests>=2.19.0->datasets==2.19.0) (2026.5.20)
Requirement already satisfied: anyio in /usr/local/lib/python3.12/dist-packages (from httpx<1,>=0.23.0->huggingface-hub>=0.21.2->datasets==2.19.0) (4.13.0)
Requirement already satisfied: httpcore==1.* in /usr/local/lib/python3.12/dist-packages (from httpx<1,>=0.23.0->huggingface-hub>=0.21.2->datasets==2.19.0) (1.0.9)
Requirement already satisfied: h11>=0.16 in /usr/local/lib/python3.12/dist-packages (from httpcore==1.*->httpx<1,>=0.23.0->huggingface-hub>=0.21.2->datasets==2.19.0) (0.16.0)
Requirement already satisfied: shellingham>=1.3.0 in /usr/local/lib/python3.12/dist-packages (from typer<0.26.0,>=0.20.0->huggingface-hub>=0.21.2->datasets==2.19.0) (1.5.4)
Requirement already satisfied: rich>=13.8.0 in /usr/local/lib/python3.12/dist-packages (from typer<0.26.0,>=0.20.0->huggingface-hub>=0.21.2->datasets==2.19.0) (13.9.4)
Requirement already satisfied: annotated-doc>=0.0.2 in /usr/local/lib/python3.12/dist-packages (from typer<0.26.0,>=0.20.0->huggingface-hub>=0.21.2->datasets==2.19.0) (0.0.4)
Requirement already satisfied: markdown-it-py>=2.2.0 in /usr/local/lib/python3.12/dist-packages (from rich>=13.8.0->typer<0.26.0,>=0.20.0->huggingface-hub>=0.21.2->datasets==2.19.0) (4.2.0)
Requirement already satisfied: pygments<3.0.0,>=2.13.0 in /usr/local/lib/python3.12/dist-packages (from rich>=13.8.0->typer<0.26.0,>=0.20.0->huggingface-hub>=0.21.2->datasets==2.19.0) (2.20.0)
Requirement already satisfied: mdurl~=0.1 in /usr/local/lib/python3.12/dist-packages (from markdown-it-py>=2.2.0->rich>=13.8.0->typer<0.26.0,>=0.20.0->huggingface-hub>=0.21.2->datasets==2.19.0) (0.1.2)
Downloading datasets-2.19.0-py3-none-any.whl (542 kB)
[2K   [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m542.0/542.0 kB[0m [31m9.6 MB/s[0m eta [36m0:00:00[0m
[?25hDownloading fsspec-2024.3.1-py3-none-any.whl (171 kB)
[2K   [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m172.0/172.0 kB[0m [31m6.2 MB/s[0m eta [36m0:00:00[0m
[?25hDownloading pyarrow_hotfix-0.7-py3-none-any.whl (7.9 kB)
Installing collected packages: pyarrow-hotfix, fsspec, datasets
  Attempting uninstall: fsspec
    Found existing installation: fsspec 2025.3.0
    Uninstalling fsspec-2025.3.0:
      Successfully uninstalled fsspec-2025.3.0
  Attempting uninstall: datasets
    Found existing installation: datasets 4.0.0
    Uninstalling datasets-4.0.0:
      Successfully uninstalled datasets-4.0.0
[31mERROR: pip's dependency resolver does not currently take into account all the packages that are installed. This behaviour is the source of the following dependency conflicts.
gcsfs 2025.3.0 requires fsspec==2025.3.0, but you have fsspec 2024.3.1 which is incompatible.[0m[31m
[0mSuccessfully installed datasets-2.19.0 fsspec-2024.3.1 pyarrow-hotfix-0.7
Downloading Amazon Fashion Metadata (Product Details)...

```

## Output
```
/usr/local/lib/python3.12/dist-packages/huggingface_hub/utils/_auth.py:112: UserWarning: 
The secret `HF_TOKEN` does not exist in your Colab secrets.
To authenticate with the Hugging Face Hub, create a token in your settings tab (https://huggingface.co/settings/tokens), set it as secret in your Google Colab and restart your session.
You will be able to reuse this secret in all of your notebooks.
Please note that authentication is recommended but still optional to access public models or datasets.
  warnings.warn(

```

## Output
```

==================================================
✅ TOTAL PRODUCTS IN DATASET: 826,108
==================================================

📋 ALL AVAILABLE COLUMNS:
 ➔ main_category
 ➔ title
 ➔ average_rating
 ➔ rating_number
 ➔ features
 ➔ description
 ➔ price
 ➔ images
 ➔ videos
 ➔ store
 ➔ categories
 ➔ details
 ➔ parent_asin
 ➔ bought_together
 ➔ subtitle
 ➔ author

==================================================
🔍 DEEP DIVE: LOOKING AT THE EXACT DATA FOR 1 PRODUCT
==================================================
MAIN_CATEGORY:
  AMAZON FASHION

TITLE:
  RONNOX Women's 3-Pairs Bright Colored Calf Compression Tube Sleeves

AVERAGE_RATING:
  4.3

RATING_NUMBER:
  3032

FEATURES:
  ['Pull On closure'
 'Size Guide: "S" fits calf 10-12 inches. "M" fits calf 12-14 inches. "L" fits calf 14-16 inches. "XL" fits calf 16-18 inches. The above size guide is for calf circumference the length of the sleeve unstretched is approx: S, 11 inch. M, 12 inch. L, 13 inch. XL, 14 inch'
 '3 Pairs: Styles and colors as seen in the picture. Choose between colorful sporty patterns & colored solids'
 'Medium Compression: The solid styles have 16-20 mmHg Graduated Compression. The pattern styles have 12-14 mmHg Graduated Compression'
 'Compression improves blood flow, aids with circulation, and keeps your feet energized. Great for running, athletic activities, & for nursing or standing all day'
 'Helps in reducing swelling and aching in the legs. Great for pregnancy & flight travel or sitting long periods']

DESCRIPTION:
  ['Ronnox Calf Sleeves - Allowing Your Body to Perform at Its Best!Some of the Ronnox Compression Socks Highlights:✔ Increase Endurance – Compression calf sleeves can reduce lactic acid and muscle fatigueallowing you to increase your endurance! Train harder, train better – and perform at your best.✔ Faster Recovery Time – Compression socks will aid in faster recovery time when worn for a few hours post workout.This is due to the increased blood flow to the calf muscles.✔ Reduce Swelling – Varicose veins, swollen ankles or swollen legs?The graduated premium compression can help to reduce swelling and assists your veins in getting blood to flow out of your legs and back to your heart!Ideal for long-haul flights or long journeys.✔ Minimize Cramps – Whether you get leg cramps during pregnancy or because your job requires being on your feet the entire day,these compression sleeves will help to reduce your leg cramps and muscle pain, helping you work and live better.General Features & Specifications:➤ Anatomically Designed to Fit Your Legs - No bunching or sliding down when walking, squatting or performing any exercise.Our calf sleeves will mold to the shape of your body.➤ Breathable Sweat-Wicking Design – The sweat-wicking breathable knee sleeve will regulate temperatureand ensure maximum comfort even during intense physical activity.➤ Soft Non-Irritating Neoprene Fabric – Instead of rough, scratchy calf sleeves, our fabric is softer, lighterand more comfortable than many others on the market.➤ Stretchable Elastic – This leg sleeve provides medium 15-20 hg graduated compression that won’t cause any blood clots or tighten around any veins.➤ Washable – Easy to clean, simply wash on a gentle cycle and hang to dry.➤ Sizes: Small / Medium / Large / Extra Large.➤ Colors: Hot Pink / Neon Green.']

PRICE:
  17.99

IMAGES:
  {'hi_res': array(['https://m.media-amazon.com/images/I/91ub366PdKL._AC_UL1500_.jpg',
       'https://m.media-amazon.com/images/I/61RpcNwx1SL._AC_UL1200_.jpg'],
      dtype=object), 'large': array(['https://m.media-amazon.com/images/I/51CqMDJOODL._AC_.jpg',
       'https://m.media-amazon.com/images/I/417HN5YFVhL._AC_.jpg'],
      dtype=object), 'thumb': array(['https://m.media-amazon.com/images/I/51CqMDJOODL._AC_SR38,50_.jpg',
       'https://m.media-amazon.com/images/I/417HN5YFVhL._AC_SR38,50_.jpg'],
      dtype=object), 'variant': array(['MAIN', 'PT01'], dtype=object)}

VIDEOS:
  {'title': array(["HONEST Review: RONNOX Women's 3-Pairs Calf Tube Sleeves",
       'Calf Compression Sleeves for Men & Women'], dtype=object), 'url': array(['https://www.amazon.com/vdp/0dfab80ad5654f499f89ab2f68f61c9b?ref=dp_vse_rvc_0',
       'https://www.amazon.com/vdp/08ca5cc3c04d4391b9308ba719ecdb6b?ref=dp_vse_rvc_1'],
      dtype=object), 'user_id': array(['/shop/grillbuff', ''], dtype=object)}

STORE:
  RONNOX

CATEGORIES:
  []

DETAILS:
  {"Is Discontinued By Manufacturer": "No", "Package Dimensions": "7.7 x 4.3 x 1.8 inches; 6.38 Ounces", "Department": "womens", "Date First Available": "July 18, 2017", "Manufacturer": "RONNOX"}

PARENT_ASIN:
  B07SB2892S

BOUGHT_TOGETHER:
  None

SUBTITLE:
  None

AUTHOR:
  None


📊 SPREADSHEET VIEW (First 5 Rows):

```

# Cell 2 (code)

df.info()

## Output
```
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 826108 entries, 0 to 826107
Data columns (total 16 columns):
 #   Column           Non-Null Count   Dtype  
---  ------           --------------   -----  
 0   main_category    826108 non-null  object 
 1   title            826108 non-null  object 
 2   average_rating   826108 non-null  float64
 3   rating_number    826108 non-null  int64  
 4   features         826108 non-null  object 
 5   description      826108 non-null  object 
 6   price            826108 non-null  object 
 7   images           826108 non-null  object 
 8   videos           826108 non-null  object 
 9   store            799270 non-null  object 
 10  categories       826108 non-null  object 
 11  details          826108 non-null  object 
 12  parent_asin      826108 non-null  object 
 13  bought_together  0 non-null       object 
 14  subtitle         0 non-null       object 
 15  author           0 non-null       object 
dtypes: float64(1), int64(1), object(14)
memory usage: 100.8+ MB

```

# Cell 3 (code)

import pandas as pd
import numpy as np
import re
import ast

print("=" * 60)
print("STARTING DATA CLEANING PIPELINE")
print("=" * 60)
print(f"\n📦 Raw df shape: {df.shape}")
print(f"📋 Available columns: {df.columns.tolist()}")

# ─────────────────────────────────────────────
# STEP 0: RE-DERIVE extracted_gender FROM details + title
# (in case it's missing from df)
# ─────────────────────────────────────────────
def extract_gender_from_details(row):
    # Try details JSON first
    try:
        details = row.get('details', '{}')
        if isinstance(details, str):
            details = ast.literal_eval(details)
        if isinstance(details, dict):
            for key in details:
                if 'department' in key.lower() or 'gender' in key.lower():
                    val = str(details[key]).lower()
                    if any(w in val for w in ['women', 'woman', 'girl', 'female', 'ladies']):
                        return 'Female'
                    elif any(w in val for w in ['men', 'man', 'boy', 'male']):
                        return 'Male'
    except:
        pass

    # Fallback: scan title
    title = str(row.get('title', '')).lower()
    if any(w in title for w in ["women's", "womens", "woman", "girls'", "ladies"]):
        return 'Female'
    elif any(w in title for w in ["men's", "mens", "man", "boys'", "male"]):
        return 'Male'
    return 'Unisex/Unknown'

if 'extracted_gender' not in df.columns:
    print("\n⚠️  extracted_gender missing — re-deriving from details + title...")
    df['extracted_gender'] = df.apply(extract_gender_from_details, axis=1)
    print("✅ extracted_gender derived:")
    print(df['extracted_gender'].value_counts().to_string())
else:
    print("\n✅ extracted_gender already present")

# ─────────────────────────────────────────────
# STEP 1: DROP USELESS COLUMNS
# ─────────────────────────────────────────────
cols_to_drop = ['bought_together', 'subtitle', 'author', 'images', 'videos', 'main_category']
df_clean = df.drop(columns=[c for c in cols_to_drop if c in df.columns])
print(f"\n✅ Step 1 — Dropped: {[c for c in cols_to_drop if c in df.columns]}")

# ─────────────────────────────────────────────
# STEP 2: CLEAN PRICE → FLOAT
# ─────────────────────────────────────────────
def parse_price(val):
    if pd.isna(val) or val in [None, '', 'None']:
        return np.nan
    val = str(val)
    match = re.search(r'[\d,]+\.?\d*', val.replace(',', ''))
    return float(match.group()) if match else np.nan

df_clean['price_usd'] = df_clean['price'].apply(parse_price)
before = len(df_clean)
df_clean = df_clean[df_clean['price_usd'].notna() & (df_clean['price_usd'] > 0)]
print(f"✅ Step 2 — Price cleaned: {before - len(df_clean):,} rows removed")

# ─────────────────────────────────────────────
# STEP 3: FILTER LOW-CONFIDENCE RATINGS (< 5 reviews)
# ─────────────────────────────────────────────
before = len(df_clean)
df_clean = df_clean[df_clean['rating_number'] >= 5]
print(f"✅ Step 3 — Removed {before - len(df_clean):,} rows with < 5 reviews")

# ─────────────────────────────────────────────
# STEP 4: DROP MISSING RATINGS
# ─────────────────────────────────────────────
before = len(df_clean)
df_clean = df_clean[df_clean['average_rating'].notna()]
print(f"✅ Step 4 — Removed {before - len(df_clean):,} rows with missing rating")

# ─────────────────────────────────────────────
# STEP 5: HARMONISE GENDER → Men / Women / Youth
# ─────────────────────────────────────────────
def harmonise_gender(val):
    if pd.isna(val):
        return 'Youth'
    val = str(val).strip().lower()
    if val in ['male', 'men', 'man', 'boys', 'boy']:
        return 'Men'
    elif val in ['female', 'women', 'woman', 'girls', 'girl']:
        return 'Women'
    else:
        return 'Youth'

df_clean['gender'] = df_clean['extracted_gender'].apply(harmonise_gender)
print(f"\n✅ Step 5 — Gender harmonised:")
print(df_clean['gender'].value_counts().to_string())

# ─────────────────────────────────────────────
# STEP 6: INFER individual_category FROM TITLE
# ─────────────────────────────────────────────
CATEGORY_KEYWORDS = {
    'T-Shirt':     ['t-shirt', 'tshirt', 'tee', 'graphic tee'],
    'Shirt':       ['shirt', 'dress shirt', 'polo'],
    'Jeans':       ['jean', 'denim'],
    'Dress':       ['dress', 'gown', 'maxi', 'mini dress'],
    'Jacket':      ['jacket', 'blazer', 'windbreaker', 'bomber'],
    'Sweater':     ['sweater', 'sweatshirt', 'pullover', 'hoodie', 'cardigan'],
    'Pants':       ['pant', 'trouser', 'legging', 'jogger', 'palazzo', 'chino'],
    'Shorts':      ['short'],
    'Skirt':       ['skirt'],
    'Shoes':       ['shoe', 'sneaker', 'boot', 'sandal', 'heel', 'loafer', 'pump', 'flat'],
    'Socks':       ['sock', 'stocking', 'hosiery'],
    'Underwear':   ['underwear', 'bra', 'panty', 'brief', 'boxer', 'lingerie'],
    'Swimwear':    ['swim', 'bikini', 'tankini', 'boardshort'],
    'Accessories': ['watch', 'belt', 'wallet', 'scarf', 'glove', 'hat', 'cap', 'beanie',
                    'bag', 'purse', 'handbag', 'earring', 'necklace', 'bracelet',
                    'ring', 'locket', 'jewelry', 'jewellery', 'sunglasses'],
    'Activewear':  ['yoga', 'compression', 'athletic', 'sport', 'workout', 'running'],
    'Kurta':       ['kurta', 'kurti', 'salwar', 'ethnic'],
    'Coat':        ['coat', 'trench', 'overcoat', 'parka'],
    'Jumpsuit':    ['jumpsuit', 'romper', 'playsuit'],
}

def infer_category(title):
    if pd.isna(title):
        return 'Other'
    title_lower = str(title).lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in title_lower for kw in keywords):
            return category
    return 'Other'

df_clean['individual_category'] = df_clean['title'].apply(infer_category)
print(f"\n✅ Step 6 — individual_category inferred:")
print(df_clean['individual_category'].value_counts().to_string())

# ─────────────────────────────────────────────
# STEP 7: BRAND + TARGET VARIABLE
# ─────────────────────────────────────────────
df_clean['brand'] = df_clean['store'].fillna('Unknown')
df_clean['is_trending'] = (df_clean['average_rating'] >= 4.2).map({True: 'Yes', False: 'No'})
df_clean['source_market'] = 'US'

print(f"\n✅ Step 7 — is_trending:")
print(df_clean['is_trending'].value_counts().to_string())

# ─────────────────────────────────────────────
# STEP 8: SELECT FINAL COLUMNS
# ─────────────────────────────────────────────
final_cols = [
    'parent_asin', 'title', 'gender', 'individual_category',
    'price_usd', 'brand', 'average_rating', 'rating_number',
    'is_trending', 'source_market'
]
df_clean = df_clean[final_cols].reset_index(drop=True)

# ─────────────────────────────────────────────
# VERIFICATION REPORT
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("✅ CLEANING COMPLETE — VERIFICATION REPORT")
print("=" * 60)
print(f"\n📐 Shape:              {df_clean.shape}")
print(f"📌 Columns:            {df_clean.columns.tolist()}")
print(f"\n🔍 Null counts:\n{df_clean.isnull().sum().to_string()}")
print(f"\n💰 Price stats (USD):\n{df_clean['price_usd'].describe().round(2).to_string()}")
print(f"\n⭐ Rating stats:\n{df_clean['average_rating'].describe().round(3).to_string()}")
print(f"\n🎯 is_trending split:\n{df_clean['is_trending'].value_counts(normalize=True).mul(100).round(1).to_string()} %")
print(f"\n👤 Gender split:\n{df_clean['gender'].value_counts().to_string()}")
print(f"\n👗 Category split:\n{df_clean['individual_category'].value_counts().to_string()}")

print("\n--- Sample Rows ---")
display(df_clean.head(5))

## Output
```
============================================================
STARTING DATA CLEANING PIPELINE
============================================================

📦 Raw df shape: (826108, 16)
📋 Available columns: ['main_category', 'title', 'average_rating', 'rating_number', 'features', 'description', 'price', 'images', 'videos', 'store', 'categories', 'details', 'parent_asin', 'bought_together', 'subtitle', 'author']

⚠️  extracted_gender missing — re-deriving from details + title...
✅ extracted_gender derived:
extracted_gender
Unisex/Unknown    422350
Female            301535
Male              102223

✅ Step 1 — Dropped: ['bought_together', 'subtitle', 'author', 'images', 'videos', 'main_category']
✅ Step 2 — Price cleaned: 775,859 rows removed
✅ Step 3 — Removed 21,814 rows with < 5 reviews
✅ Step 4 — Removed 0 rows with missing rating

✅ Step 5 — Gender harmonised:
gender
Youth    13180
Women     9551
Men       5704

✅ Step 6 — individual_category inferred:
individual_category
Accessories    9714
Other          6735
T-Shirt        2975
Underwear      2379
Dress          1087
Shoes           935
Shirt           880
Pants           861
Socks           697
Jacket          495
Sweater         448
Shorts          372
Activewear      254
Jeans           252
Jumpsuit        105
Swimwear         91
Skirt            80
Coat             47
Kurta            28

✅ Step 7 — is_trending:
is_trending
Yes    16903
No     11532

============================================================
✅ CLEANING COMPLETE — VERIFICATION REPORT
============================================================

📐 Shape:              (28435, 10)
📌 Columns:            ['parent_asin', 'title', 'gender', 'individual_category', 'price_usd', 'brand', 'average_rating', 'rating_number', 'is_trending', 'source_market']

🔍 Null counts:
parent_asin            0
title                  0
gender                 0
individual_category    0
price_usd              0
brand                  0
average_rating         0
rating_number          0
is_trending            0
source_market          0

💰 Price stats (USD):
count    28435.00
mean        31.81
std         80.07
min          0.01
25%         10.95
50%         17.91
75%         29.99
max       6199.95

⭐ Rating stats:
count    28435.000
mean         4.192
std          0.528
min          1.400
25%          3.900
50%          4.300
75%          4.600
max          5.000

🎯 is_trending split:
is_trending
Yes    59.4
No     40.6 %

👤 Gender split:
gender
Youth    13180
Women     9551
Men       5704

👗 Category split:
individual_category
Accessories    9714
Other          6735
T-Shirt        2975
Underwear      2379
Dress          1087
Shoes           935
Shirt           880
Pants           861
Socks           697
Jacket          495
Sweater         448
Shorts          372
Activewear      254
Jeans           252
Jumpsuit        105
Swimwear         91
Skirt            80
Coat             47
Kurta            28

--- Sample Rows ---

```

# Cell 4 (code)

print("=" * 70)
print("FULL DATA QUALITY AUDIT REPORT — df_clean (Amazon Fashion)")
print("=" * 70)

# ─────────────────────────────────────────────
# 0. SHAPE & BASIC INFO
# ─────────────────────────────────────────────
print(f"\n{'─'*70}")
print("0. SHAPE & BASIC INFO")
print(f"{'─'*70}")
print(f"Rows:    {df_clean.shape[0]:,}")
print(f"Columns: {df_clean.shape[1]}")
print(f"\nDtypes:")
print(df_clean.dtypes.to_string())
print(f"\nMemory usage: {df_clean.memory_usage(deep=True).sum() / 1e6:.2f} MB")

# ─────────────────────────────────────────────
# 1. NULL / MISSING CHECK
# ─────────────────────────────────────────────
print(f"\n{'─'*70}")
print("1. NULL / MISSING VALUES")
print(f"{'─'*70}")
null_counts = df_clean.isnull().sum()
null_pct    = (null_counts / len(df_clean) * 100).round(2)
null_df = pd.DataFrame({'null_count': null_counts, 'null_%': null_pct})
print(null_df.to_string())
if null_counts.sum() == 0:
    print("\n✅ PASS — Zero nulls across all columns")
else:
    print(f"\n❌ FAIL — {null_counts.sum()} nulls found!")

# ─────────────────────────────────────────────
# 2. DUPLICATE CHECK
# ─────────────────────────────────────────────
print(f"\n{'─'*70}")
print("2. DUPLICATE ROWS")
print(f"{'─'*70}")
dup_rows = df_clean.duplicated().sum()
dup_asin = df_clean['parent_asin'].duplicated().sum()
print(f"Fully duplicate rows:      {dup_rows:,}")
print(f"Duplicate parent_asin IDs: {dup_asin:,}")
if dup_rows == 0:
    print("✅ PASS — No duplicate rows")
else:
    print("⚠️  WARNING — Duplicate rows exist")

# ─────────────────────────────────────────────
# 3. COLUMN-BY-COLUMN AUDIT
# ─────────────────────────────────────────────

# ── 3a. parent_asin ──
print(f"\n{'─'*70}")
print("3a. COLUMN: parent_asin")
print(f"{'─'*70}")
print(f"Unique values:  {df_clean['parent_asin'].nunique():,}")
print(f"Nulls:          {df_clean['parent_asin'].isnull().sum()}")
print(f"Empty strings:  {(df_clean['parent_asin'] == '').sum()}")
print(f"Sample values:  {df_clean['parent_asin'].head(5).tolist()}")

# ── 3b. title ──
print(f"\n{'─'*70}")
print("3b. COLUMN: title")
print(f"{'─'*70}")
print(f"Unique titles:      {df_clean['title'].nunique():,}")
print(f"Nulls:              {df_clean['title'].isnull().sum()}")
print(f"Empty strings:      {(df_clean['title'].str.strip() == '').sum()}")
print(f"Avg title length:   {df_clean['title'].str.len().mean():.1f} chars")
print(f"Min title length:   {df_clean['title'].str.len().min()}")
print(f"Max title length:   {df_clean['title'].str.len().max()}")
title_lengths = df_clean['title'].str.len()
shortest_titles = df_clean[['title']].assign(length=title_lengths).sort_values('length').head(3)
print(f"\nShortest titles:")
for _, row in shortest_titles.iterrows():
    print(f"  [{row['length']} chars] {row['title']}")
# ── 3c. gender ──
print(f"\n{'─'*70}")
print("3c. COLUMN: gender")
print(f"{'─'*70}")
allowed_gender = {'Men', 'Women', 'Youth'}
print(f"Allowed values:  {allowed_gender}")
print(f"Unique values:   {set(df_clean['gender'].unique())}")
invalid_gender = ~df_clean['gender'].isin(allowed_gender)
print(f"Invalid values:  {invalid_gender.sum()}")
print(f"\nValue counts:")
print(df_clean['gender'].value_counts().to_string())
print(f"\nProportions (%):")
print((df_clean['gender'].value_counts(normalize=True) * 100).round(1).to_string())
if invalid_gender.sum() == 0:
    print("\n✅ PASS — All gender values valid")
else:
    print(f"\n❌ FAIL — {invalid_gender.sum()} invalid gender values!")
    print(df_clean[invalid_gender]['gender'].value_counts())

# ── 3d. individual_category ──
print(f"\n{'─'*70}")
print("3d. COLUMN: individual_category")
print(f"{'─'*70}")
print(f"Unique categories: {df_clean['individual_category'].nunique()}")
print(f"Nulls:             {df_clean['individual_category'].isnull().sum()}")
print(f"\nValue counts:")
print(df_clean['individual_category'].value_counts().to_string())
print(f"\nProportions (%):")
print((df_clean['individual_category'].value_counts(normalize=True) * 100).round(2).to_string())
other_pct = (df_clean['individual_category'] == 'Other').mean() * 100
print(f"\n'Other' = {other_pct:.1f}% of records")
if other_pct > 50:
    print("⚠️  WARNING — More than 50% of records are 'Other' category")
else:
    print("✅ PASS — 'Other' is within acceptable range")

# ── 3e. price_usd ──
print(f"\n{'─'*70}")
print("3e. COLUMN: price_usd")
print(f"{'─'*70}")
print(f"Nulls:       {df_clean['price_usd'].isnull().sum()}")
print(f"Zero prices: {(df_clean['price_usd'] == 0).sum()}")
print(f"Negative:    {(df_clean['price_usd'] < 0).sum()}")
print(f"\nDescriptive stats:")
print(df_clean['price_usd'].describe().round(2).to_string())
print(f"\nPrice distribution buckets:")
bins   = [0, 10, 25, 50, 100, 250, 500, np.inf]
labels = ['$0-10','$10-25','$25-50','$50-100','$100-250','$250-500','$500+']
price_dist = pd.cut(df_clean['price_usd'], bins=bins, labels=labels)
print(price_dist.value_counts().sort_index().to_string())
print(f"\nSuspiciously high prices (> $500):")
print(df_clean[df_clean['price_usd'] > 500][['title','price_usd']].head(5).to_string())

# ── 3f. brand ──
print(f"\n{'─'*70}")
print("3f. COLUMN: brand")
print(f"{'─'*70}")
print(f"Unique brands:       {df_clean['brand'].nunique():,}")
print(f"Nulls:               {df_clean['brand'].isnull().sum()}")
print(f"'Unknown' brands:    {(df_clean['brand'] == 'Unknown').sum()}")
print(f"\nTop 20 brands by product count:")
print(df_clean['brand'].value_counts().head(20).to_string())

# ── 3g. average_rating ──
print(f"\n{'─'*70}")
print("3g. COLUMN: average_rating")
print(f"{'─'*70}")
print(f"Nulls:              {df_clean['average_rating'].isnull().sum()}")
out_of_range = ((df_clean['average_rating'] < 0) | (df_clean['average_rating'] > 5)).sum()
print(f"Out of range (0-5): {out_of_range}")
print(f"\nDescriptive stats:")
print(df_clean['average_rating'].describe().round(3).to_string())
print(f"\nRating distribution buckets:")
rbins   = [0, 1, 2, 3, 3.5, 4, 4.2, 4.5, 5.0]
rlabels = ['0-1','1-2','2-3','3-3.5','3.5-4','4-4.2','4.2-4.5','4.5-5']
rating_dist = pd.cut(df_clean['average_rating'], bins=rbins, labels=rlabels)
print(rating_dist.value_counts().sort_index().to_string())
if out_of_range == 0:
    print("\n✅ PASS — All ratings in valid 0–5 range")
else:
    print(f"\n❌ FAIL — {out_of_range} ratings outside 0–5!")

# ── 3h. rating_number ──
print(f"\n{'─'*70}")
print("3h. COLUMN: rating_number")
print(f"{'─'*70}")
print(f"Nulls:         {df_clean['rating_number'].isnull().sum()}")
print(f"Below 5:       {(df_clean['rating_number'] < 5).sum()}  ← should be 0 after filtering")
print(f"Min:           {df_clean['rating_number'].min()}")
print(f"Max:           {df_clean['rating_number'].max():,}")
print(f"Median:        {df_clean['rating_number'].median():.0f}")
print(f"Mean:          {df_clean['rating_number'].mean():.1f}")
print(f"\nReview count buckets:")
vbins   = [0, 5, 10, 25, 50, 100, 500, 1000, np.inf]
vlabels = ['5-10','10-25','25-50','50-100','100-500','500-1k','1k-∞', 'error']
# fix: only 7 labels for 8 bins
vbins   = [5, 10, 25, 50, 100, 500, 1000, np.inf]
vlabels = ['5-10','10-25','25-50','50-100','100-500','500-1k','1k+']
rev_dist = pd.cut(df_clean['rating_number'], bins=vbins, labels=vlabels)
print(rev_dist.value_counts().sort_index().to_string())
if (df_clean['rating_number'] < 5).sum() == 0:
    print("\n✅ PASS — All records have ≥ 5 reviews")
else:
    print("\n❌ FAIL — Some records have < 5 reviews!")

# ── 3i. is_trending ──
print(f"\n{'─'*70}")
print("3i. COLUMN: is_trending")
print(f"{'─'*70}")
allowed_trending = {'Yes', 'No'}
invalid_trending = ~df_clean['is_trending'].isin(allowed_trending)
print(f"Allowed values:  {allowed_trending}")
print(f"Unique values:   {set(df_clean['is_trending'].unique())}")
print(f"Invalid values:  {invalid_trending.sum()}")
print(f"\nValue counts:")
print(df_clean['is_trending'].value_counts().to_string())
print(f"\nProportions (%):")
print((df_clean['is_trending'].value_counts(normalize=True) * 100).round(1).to_string())

# Verify alignment with average_rating
mismatch = ((df_clean['average_rating'] >= 4.2) & (df_clean['is_trending'] == 'No')).sum()
mismatch += ((df_clean['average_rating'] < 4.2) & (df_clean['is_trending'] == 'Yes')).sum()
print(f"\nMismatches between rating ≥ 4.2 and is_trending: {mismatch}")
if mismatch == 0:
    print("✅ PASS — is_trending perfectly aligned with average_rating threshold")
else:
    print("❌ FAIL — is_trending and average_rating are misaligned!")

# ── 3j. source_market ──
print(f"\n{'─'*70}")
print("3j. COLUMN: source_market")
print(f"{'─'*70}")
print(f"Unique values:  {df_clean['source_market'].unique().tolist()}")
print(f"Value counts:")
print(df_clean['source_market'].value_counts().to_string())
if set(df_clean['source_market'].unique()) == {'US'}:
    print("✅ PASS — All records tagged 'US'")
else:
    print("⚠️  WARNING — Unexpected source_market values!")

# ─────────────────────────────────────────────
# 4. CROSS-COLUMN CHECKS
# ─────────────────────────────────────────────
print(f"\n{'─'*70}")
print("4. CROSS-COLUMN ANALYSIS")
print(f"{'─'*70}")

print("\nAvg rating by gender:")
print(df_clean.groupby('gender')['average_rating'].agg(['mean','median','count']).round(3).to_string())

print("\nAvg price by gender:")
print(df_clean.groupby('gender')['price_usd'].agg(['mean','median','min','max']).round(2).to_string())

print("\nis_trending rate by gender (%):")
print((df_clean.groupby('gender')['is_trending']
       .apply(lambda x: (x == 'Yes').mean() * 100)
       .round(1)).to_string())

print("\nAvg rating by individual_category:")
print(df_clean.groupby('individual_category')['average_rating']
      .agg(['mean','median','count']).round(3)
      .sort_values('count', ascending=False).to_string())

print("\nis_trending rate by individual_category (%):")
print((df_clean.groupby('individual_category')['is_trending']
       .apply(lambda x: (x == 'Yes').mean() * 100)
       .round(1).sort_values(ascending=False)).to_string())

print("\nAvg price by individual_category:")
print(df_clean.groupby('individual_category')['price_usd']
      .agg(['mean','median']).round(2)
      .sort_values('mean', ascending=False).to_string())

# ─────────────────────────────────────────────
# 5. FINAL PASS / FAIL SUMMARY
# ─────────────────────────────────────────────
print(f"\n{'='*70}")
print("5. FINAL AUDIT SUMMARY")
print(f"{'='*70}")
checks = {
    "Zero nulls":                       null_counts.sum() == 0,
    "No duplicate rows":                dup_rows == 0,
    "Valid gender values only":         invalid_gender.sum() == 0,
    "Valid trending values only":       invalid_trending.sum() == 0,
    "is_trending aligned with rating":  mismatch == 0,
    "All prices > 0":                   (df_clean['price_usd'] <= 0).sum() == 0,
    "All ratings in 0–5":              out_of_range == 0,
    "All records have ≥ 5 reviews":    (df_clean['rating_number'] < 5).sum() == 0,
    "source_market all 'US'":          set(df_clean['source_market'].unique()) == {'US'},
}
for check, passed in checks.items():
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"  {status}  —  {check}")

all_passed = all(checks.values())
print(f"\n{'✅ ALL CHECKS PASSED — df_clean is ready for Myntra merge!' if all_passed else '❌ SOME CHECKS FAILED — review above before proceeding'}")
print(f"\nFinal clean dataset shape: {df_clean.shape}")
display(df_clean.sample(5, random_state=42))

## Output
```
======================================================================
FULL DATA QUALITY AUDIT REPORT — df_clean (Amazon Fashion)
======================================================================

──────────────────────────────────────────────────────────────────────
0. SHAPE & BASIC INFO
──────────────────────────────────────────────────────────────────────
Rows:    28,435
Columns: 10

Dtypes:
parent_asin             object
title                   object
gender                  object
individual_category     object
price_usd              float64
brand                   object
average_rating         float64
rating_number            int64
is_trending             object
source_market           object

Memory usage: 14.17 MB

──────────────────────────────────────────────────────────────────────
1. NULL / MISSING VALUES
──────────────────────────────────────────────────────────────────────
                     null_count  null_%
parent_asin                   0     0.0
title                         0     0.0
gender                        0     0.0
individual_category           0     0.0
price_usd                     0     0.0
brand                         0     0.0
average_rating                0     0.0
rating_number                 0     0.0
is_trending                   0     0.0
source_market                 0     0.0

✅ PASS — Zero nulls across all columns

──────────────────────────────────────────────────────────────────────
2. DUPLICATE ROWS
──────────────────────────────────────────────────────────────────────
Fully duplicate rows:      0
Duplicate parent_asin IDs: 0
✅ PASS — No duplicate rows

──────────────────────────────────────────────────────────────────────
3a. COLUMN: parent_asin
──────────────────────────────────────────────────────────────────────
Unique values:  28,435
Nulls:          0
Empty strings:  0
Sample values:  ['B07SB2892S', 'B08FMLXY1Z', 'B07G854X4J', 'B08F7DNKB2', 'B0B31Z29G3']

──────────────────────────────────────────────────────────────────────
3b. COLUMN: title
──────────────────────────────────────────────────────────────────────
Unique titles:      27,999
Nulls:              0
Empty strings:      2
Avg title length:   87.9 chars
Min title length:   0
Max title length:   1536

Shortest titles:
  [0 chars] 
  [0 chars] 
  [5 chars] Women

──────────────────────────────────────────────────────────────────────
3c. COLUMN: gender
──────────────────────────────────────────────────────────────────────
Allowed values:  {'Men', 'Youth', 'Women'}
Unique values:   {'Men', 'Youth', 'Women'}
Invalid values:  0

Value counts:
gender
Youth    13180
Women     9551
Men       5704

Proportions (%):
gender
Youth    46.4
Women    33.6
Men      20.1

✅ PASS — All gender values valid

──────────────────────────────────────────────────────────────────────
3d. COLUMN: individual_category
──────────────────────────────────────────────────────────────────────
Unique categories: 19
Nulls:             0

Value counts:
individual_category
Accessories    9714
Other          6735
T-Shirt        2975
Underwear      2379
Dress          1087
Shoes           935
Shirt           880
Pants           861
Socks           697
Jacket          495
Sweater         448
Shorts          372
Activewear      254
Jeans           252
Jumpsuit        105
Swimwear         91
Skirt            80
Coat             47
Kurta            28

Proportions (%):
individual_category
Accessories    34.16
Other          23.69
T-Shirt        10.46
Underwear       8.37
Dress           3.82
Shoes           3.29
Shirt           3.09
Pants           3.03
Socks           2.45
Jacket          1.74
Sweater         1.58
Shorts          1.31
Activewear      0.89
Jeans           0.89
Jumpsuit        0.37
Swimwear        0.32
Skirt           0.28
Coat            0.17
Kurta           0.10

'Other' = 23.7% of records
✅ PASS — 'Other' is within acceptable range

──────────────────────────────────────────────────────────────────────
3e. COLUMN: price_usd
──────────────────────────────────────────────────────────────────────
Nulls:       0
Zero prices: 0
Negative:    0

Descriptive stats:
count    28435.00
mean        31.81
std         80.07
min          0.01
25%         10.95
50%         17.91
75%         29.99
max       6199.95

Price distribution buckets:
price_usd
$0-10        6779
$10-25      12510
$25-50       5873
$50-100      2029
$100-250     1002
$250-500      168
$500+          74

Suspiciously high prices (> $500):
                                                                     title  price_usd
803                                    Seiko Prospex SBDC101 Made in Japan     920.33
1212           Raymond Weil Parsifal White Dial Men's Watch 5580-STP-00308    1236.68
1363  Prada Women's Vitello Daino Black Leather Satchel Bag Handbag 1BC051    2695.00
1615                                   Casio G-shock MTG-B1000XB-1AJF Mens     800.00
2480                              Luminox Automatic Sport Timer Mens Watch    1000.00

──────────────────────────────────────────────────────────────────────
3f. COLUMN: brand
──────────────────────────────────────────────────────────────────────
Unique brands:       11,698
Nulls:               0
'Unknown' brands:    305

Top 20 brands by product count:
brand
Unknown              305
Nike                 263
Generic              206
Pierced Owl          175
Disney               170
Gem Stone King       146
Bioworld             140
Hanes                118
La Regis Jewelry     115
Blueshaw             106
GRAPHICS & MORE       96
SA106                 93
adidas                88
Revant                86
Gypsy Jewels          81
Topwholesalejewel     78
Owl                   77
MATIGA                73
Clearly Charming      70
Love Jewelry          69

──────────────────────────────────────────────────────────────────────
3g. COLUMN: average_rating
──────────────────────────────────────────────────────────────────────
Nulls:              0
Out of range (0-5): 0

Descriptive stats:
count    28435.000
mean         4.192
std          0.528
min          1.400
25%          3.900
50%          4.300
75%          4.600
max          5.000

Rating distribution buckets:
average_rating
0-1           0
1-2          37
2-3         899
3-3.5      2495
3.5-4      6225
4-4.2      3984
4.2-4.5    7071
4.5-5      7724

✅ PASS — All ratings in valid 0–5 range

──────────────────────────────────────────────────────────────────────
3h. COLUMN: rating_number
──────────────────────────────────────────────────────────────────────
Nulls:         0
Below 5:       0  ← should be 0 after filtering
Min:           5
Max:           46,299
Median:        19
Mean:          103.6

Review count buckets:
rating_number
5-10       6757
10-25      7593
25-50      4416
50-100     3114
100-500    3346
500-1k      525
1k+         434

✅ PASS — All records have ≥ 5 reviews

──────────────────────────────────────────────────────────────────────
3i. COLUMN: is_trending
──────────────────────────────────────────────────────────────────────
Allowed values:  {'No', 'Yes'}
Unique values:   {'No', 'Yes'}
Invalid values:  0

Value counts:
is_trending
Yes    16903
No     11532

Proportions (%):
is_trending
Yes    59.4
No     40.6

Mismatches between rating ≥ 4.2 and is_trending: 0
✅ PASS — is_trending perfectly aligned with average_rating threshold

──────────────────────────────────────────────────────────────────────
3j. COLUMN: source_market
──────────────────────────────────────────────────────────────────────
Unique values:  ['US']
Value counts:
source_market
US    28435
✅ PASS — All records tagged 'US'

──────────────────────────────────────────────────────────────────────
4. CROSS-COLUMN ANALYSIS
──────────────────────────────────────────────────────────────────────

Avg rating by gender:
         mean  median  count
gender                      
Men     4.267     4.3   5704
Women   4.122     4.2   9551
Youth   4.209     4.3  13180

Avg price by gender:
         mean  median   min      max
gender                              
Men     44.92   23.63  0.33  5000.00
Women   30.39   17.99  0.01  2695.00
Youth   27.16   14.99  0.01  6199.95

is_trending rate by gender (%):
gender
Men      66.1
Women    54.3
Youth    60.3

Avg rating by individual_category:
                      mean  median  count
individual_category                      
Accessories          4.205     4.3   9714
Other                4.277     4.4   6735
T-Shirt              4.140     4.2   2975
Underwear            4.151     4.2   2379
Dress                3.992     4.1   1087
Shoes                4.142     4.2    935
Shirt                4.143     4.2    880
Pants                4.036     4.1    861
Socks                4.351     4.4    697
Jacket               4.141     4.3    495
Sweater              4.158     4.2    448
Shorts               4.136     4.2    372
Activewear           4.189     4.2    254
Jeans                4.133     4.2    252
Jumpsuit             4.116     4.2    105
Swimwear             4.023     4.1     91
Skirt                3.974     3.9     80
Coat                 4.228     4.3     47
Kurta                3.786     3.8     28

is_trending rate by individual_category (%):
individual_category
Socks          74.3
Other          65.4
Coat           63.8
Accessories    60.7
Jacket         59.6
Activewear     59.1
Shirt          57.0
Sweater        56.5
Shoes          56.0
Underwear      55.7
T-Shirt        55.1
Jeans          54.4
Shorts         54.0
Jumpsuit       50.5
Pants          47.9
Dress          45.2
Swimwear       40.7
Skirt          37.5
Kurta          17.9

Avg price by individual_category:
                      mean  median
individual_category               
Jacket               63.00   41.99
Coat                 54.64   30.99
Jumpsuit             46.89   36.99
Shoes                40.41   20.99
Kurta                37.59   33.19
Jeans                36.75   29.96
Dress                34.65   25.99
Sweater              34.34   29.96
Other                33.59   16.99
Accessories          32.22   15.99
Skirt                31.30   19.99
Pants                30.05   22.99
Shirt                29.32   24.12
T-Shirt              28.12   16.99
Shorts               27.41   22.98
Underwear            23.93   14.99
Activewear           23.75   14.99
Swimwear             20.81   17.99
Socks                17.88   14.95

======================================================================
5. FINAL AUDIT SUMMARY
======================================================================
  ✅ PASS  —  Zero nulls
  ✅ PASS  —  No duplicate rows
  ✅ PASS  —  Valid gender values only
  ✅ PASS  —  Valid trending values only
  ✅ PASS  —  is_trending aligned with rating
  ✅ PASS  —  All prices > 0
  ✅ PASS  —  All ratings in 0–5
  ✅ PASS  —  All records have ≥ 5 reviews
  ✅ PASS  —  source_market all 'US'

✅ ALL CHECKS PASSED — df_clean is ready for Myntra merge!

Final clean dataset shape: (28435, 10)

```

# Cell 5 (code)

df.info()

## Output
```
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 826108 entries, 0 to 826107
Data columns (total 17 columns):
 #   Column            Non-Null Count   Dtype  
---  ------            --------------   -----  
 0   main_category     826108 non-null  object 
 1   title             826108 non-null  object 
 2   average_rating    826108 non-null  float64
 3   rating_number     826108 non-null  int64  
 4   features          826108 non-null  object 
 5   description       826108 non-null  object 
 6   price             826108 non-null  object 
 7   images            826108 non-null  object 
 8   videos            826108 non-null  object 
 9   store             799270 non-null  object 
 10  categories        826108 non-null  object 
 11  details           826108 non-null  object 
 12  parent_asin       826108 non-null  object 
 13  bought_together   0 non-null       object 
 14  subtitle          0 non-null       object 
 15  author            0 non-null       object 
 16  extracted_gender  826108 non-null  object 
dtypes: float64(1), int64(1), object(15)
memory usage: 107.1+ MB

```

# Cell 6 (code)

df_clean.info()

## Output
```
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 28435 entries, 0 to 28434
Data columns (total 10 columns):
 #   Column               Non-Null Count  Dtype  
---  ------               --------------  -----  
 0   parent_asin          28435 non-null  object 
 1   title                28435 non-null  object 
 2   gender               28435 non-null  object 
 3   individual_category  28435 non-null  object 
 4   price_usd            28435 non-null  float64
 5   brand                28435 non-null  object 
 6   average_rating       28435 non-null  float64
 7   rating_number        28435 non-null  int64  
 8   is_trending          28435 non-null  object 
 9   source_market        28435 non-null  object 
dtypes: float64(2), int64(1), object(7)
memory usage: 2.2+ MB

```

# Cell 7 (code)

df_clean['gender'] = df_clean['gender'].replace('Youth', 'Unisex')

# Cell 8 (code)

cols_to_check = ['gender', 'individual_category', 'brand', 'is_trending', 'source_market']

for col in cols_to_check:
    print(f"\n{'─'*40}")
    print(f"VALUE COUNTS: {col}")
    print(f"{'─'*40}")
    print(df_clean[col].value_counts())

## Output
```

────────────────────────────────────────
VALUE COUNTS: gender
────────────────────────────────────────
gender
Unisex    13180
Women      9551
Men        5704
Name: count, dtype: int64

────────────────────────────────────────
VALUE COUNTS: individual_category
────────────────────────────────────────
individual_category
Accessories    9714
Other          6735
T-Shirt        2975
Underwear      2379
Dress          1087
Shoes           935
Shirt           880
Pants           861
Socks           697
Jacket          495
Sweater         448
Shorts          372
Activewear      254
Jeans           252
Jumpsuit        105
Swimwear         91
Skirt            80
Coat             47
Kurta            28
Name: count, dtype: int64

────────────────────────────────────────
VALUE COUNTS: brand
────────────────────────────────────────
brand
Unknown                           305
Nike                              263
Generic                           206
Pierced Owl                       175
Disney                            170
                                 ... 
ibrsport                            1
Zyduzsc                             1
Wayfarer Style Sunglasses           1
CLAUBTY                             1
For Kelty and other Back Packs      1
Name: count, Length: 11698, dtype: int64

────────────────────────────────────────
VALUE COUNTS: is_trending
────────────────────────────────────────
is_trending
Yes    16903
No     11532
Name: count, dtype: int64

────────────────────────────────────────
VALUE COUNTS: source_market
────────────────────────────────────────
source_market
US    28435
Name: count, dtype: int64

```

# Cell 9 (code)

df_clean.to_csv('cleaned_amazon_fashion_dataset.csv', index=False)
print("Dataset saved successfully as 'cleaned_amazon_fashion_dataset.csv'")

## Output
```
Dataset saved successfully as 'cleaned_amazon_fashion_dataset.csv'

```

# Cell 10 (code)

import kagglehub
import os
import pandas as pd

# 1. Download the dataset
path = kagglehub.dataset_download("manishmathias/myntra-fashion-dataset")

print(f"Dataset downloaded to: {path}")

# 2. List files to find the CSV
files = [f for f in os.listdir(path) if f.endswith('.csv')]
print(f"Available CSV files: {files}")

# 3. Load the first available CSV
if files:
    file_path = os.path.join(path, files[0])
    df_myntra = pd.read_csv(file_path)
    print(f"\nSuccessfully loaded: {files[0]}")
    display(df_myntra.head())
else:
    print("No CSV files found in the dataset directory.")

## Output
```
Downloading to /root/.cache/kagglehub/datasets/manishmathias/myntra-fashion-dataset/1.archive...

```

## Output
```
100%|██████████| 19.6M/19.6M [00:00<00:00, 99.2MB/s]
```

## Output
```
Extracting files...

```

## Output
```


```

## Output
```
Dataset downloaded to: /root/.cache/kagglehub/datasets/manishmathias/myntra-fashion-dataset/versions/1
Available CSV files: ['Myntra Fasion Clothing.csv']

```

## Output
```
/tmp/ipykernel_8325/575608597.py:17: DtypeWarning: Columns (9) have mixed types. Specify dtype option on import or set low_memory=False.
  df_myntra = pd.read_csv(file_path)

```

## Output
```

Successfully loaded: Myntra Fasion Clothing.csv

```

# Cell 11 (code)

df=df_myntra

# Cell 12 (code)

df.info()

## Output
```
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 526564 entries, 0 to 526563
Data columns (total 13 columns):
 #   Column                 Non-Null Count   Dtype  
---  ------                 --------------   -----  
 0   URL                    526564 non-null  object 
 1   Product_id             526564 non-null  int64  
 2   BrandName              526564 non-null  object 
 3   Category               526564 non-null  object 
 4   Individual_category    526564 non-null  object 
 5   category_by_Gender     526564 non-null  object 
 6   Description            526564 non-null  object 
 7   DiscountPrice (in Rs)  333406 non-null  float64
 8   OriginalPrice (in Rs)  526564 non-null  float64
 9   DiscountOffer          452258 non-null  object 
 10  SizeOption             526564 non-null  object 
 11  Ratings                190412 non-null  float64
 12  Reviews                190412 non-null  float64
dtypes: float64(4), int64(1), object(8)
memory usage: 52.2+ MB

```

# Cell 13 (code)

print('='*70)
print('MYNTRA DATASET: COMPLETE QUALITY & STRUCTURAL AUDIT')
print('='*70)

# 1. Basic Dimensions
rows, cols = df.shape
print(f'\n⌒ DIMENSIONS:')
print(f'  ➔ Total Products (Rows): {rows:,}')
print(f'  ➔ Attributes (Columns): {cols}')

# 2. Missing Value Deep Dive
print(f'\n❌ MISSING DATA ANALYSIS:')
null_counts = df.isnull().sum()
null_pct = (df.isnull().sum() / len(df) * 100).round(2)
missing_df = pd.DataFrame({'Missing Count': null_counts, 'Percentage (%)': null_pct})
print(missing_df[missing_df['Missing Count'] > 0].to_string())

# 3. Data Integrity & Messiness Check
print(f'\n⚠️ POTENTIAL ISSUES (THE MESSY STUFF):')

# Check Price Formats
sample_prices = df['OriginalPrice (in Rs)'].head(5).tolist()
print(f'  ➔ Price Format Sample: {sample_prices} (Needs numeric conversion)')

# Check for Duplicates
dup_count = df.duplicated().sum()
print(f'  ➔ Exact Duplicate Rows: {dup_count:,}')

# Check Ratings Range
if 'Ratings' in df.columns:
    print(f"  ➔ Ratings Range: {df['Ratings'].min()} to {df['Ratings'].max()}")

# 4. Column Content Diversity
print(f'\n⌛ UNIQUE VALUES & CATEGORIES:')
for col in ['Category', 'Individual_category', 'category_by_Gender', 'BrandName']:
    print(f"  ➔ {col}: {df[col].nunique()} unique values")

print(f'\n♂️ GENDER SPLIT:')
print(df['category_by_Gender'].value_counts().to_string())

print('\n' + '='*70)
print('CLEANING TODO LIST:')
print('1. Convert Prices to Float (remove currency markers if any).')
print('2. Handle the ~64% missing Ratings (impute or filter).')
print('3. Deduplicate rows based on Product_id.')
print('4. Harmonize Gender tags to match your Amazon dataset (Men/Women/Unisex).')
print('='*70)

## Output
```
======================================================================
MYNTRA DATASET: COMPLETE QUALITY & STRUCTURAL AUDIT
======================================================================

⌒ DIMENSIONS:
  ➔ Total Products (Rows): 526,564
  ➔ Attributes (Columns): 13

❌ MISSING DATA ANALYSIS:
                       Missing Count  Percentage (%)
DiscountPrice (in Rs)         193158           36.68
DiscountOffer                  74306           14.11
Ratings                       336152           63.84
Reviews                       336152           63.84

⚠️ POTENTIAL ISSUES (THE MESSY STUFF):
  ➔ Price Format Sample: [1499.0, 1149.0, 1399.0, 1295.0, 599.0] (Needs numeric conversion)
  ➔ Exact Duplicate Rows: 0
  ➔ Ratings Range: 1.0 to 5.0

⌛ UNIQUE VALUES & CATEGORIES:
  ➔ Category: 8 unique values
  ➔ Individual_category: 92 unique values
  ➔ category_by_Gender: 2 unique values
  ➔ BrandName: 2088 unique values

♂️ GENDER SPLIT:
category_by_Gender
Women    339185
Men      187379

======================================================================
CLEANING TODO LIST:
1. Convert Prices to Float (remove currency markers if any).
2. Handle the ~64% missing Ratings (impute or filter).
3. Deduplicate rows based on Product_id.
4. Harmonize Gender tags to match your Amazon dataset (Men/Women/Unisex).
======================================================================

```

# Cell 14 (code)

print('='*80)
print('MYNTRA DATASET: DEEP DIVE ARCHITECTURAL & QUALITY AUDIT')
print('='*80)

# 1. Identifier Integrity
print('\n❀ IDENTIFIER INTEGRITY:')
unique_ids = df['Product_id'].nunique()
duplicate_ids = len(df) - unique_ids
print(f'  ➔ Unique Product IDs: {unique_ids:,}')
print(f'  ➔ Duplicate IDs found: {duplicate_ids:,} (Rows sharing the same Product_id)')

# 2. Textual Quality (Descriptions & Titles)
print('\n✎ TEXTUAL QUALITY ANALYSIS:')
df['desc_len'] = df['Description'].str.len()
df['title_len'] = df['Individual_category'].str.len() # Using category as a proxy for title content
print(f"  ➔ Avg Description Length: {df['desc_len'].mean():.1f} chars")
print(f"  ➔ Empty/Whitespace Descriptions: {(df['Description'].str.strip() == '').sum():,}")
print(f"  ➔ Potential 'Placeholders' (e.g., 'None', 'NaN'): {df['Description'].isin(['None', 'nan', 'NaN', 'null']).sum():,}")

# 3. Price & Financial Logic
print('\n⌛ PRICE & DISCOUNT LOGIC:')
# Check if DiscountPrice is ever higher than OriginalPrice
illogical_prices = df[df['DiscountPrice (in Rs)'] > df['OriginalPrice (in Rs)']]
print(f'  ➔ Rows where Discount > Original: {len(illogical_prices):,}')

# 4. Deep Category Inspection
print('\n☸ CATEGORY OVERLAP & HIERARCHY:')
top_categories = df['Category'].value_counts()
print("Top Parent Categories:")
print(top_categories.to_string())

# 5. Value Distribution of Ratings (The 36% that exist)
if df['Ratings'].notnull().any():
    print('\n⭐ RATING SKEW (For products with ratings):')
    rating_counts = df['Ratings'].value_counts().sort_index(ascending=False)
    print(rating_counts.to_string())

# 6. Memory & Storage Efficiency
print('\nὌ SYSTEM RESOURCE USAGE:')
usage = df.memory_usage(deep=True).sum() / 1e6
print(f'  ➔ Total memory footprint: {usage:.2f} MB')

print('\n' + '='*80)
print('TECHNICAL OBSERVATIONS:')
print('- Product_id redundancy: We need to decide if we keep the first or last instance.')
print('='*80)

## Output
```
================================================================================
MYNTRA DATASET: DEEP DIVE ARCHITECTURAL & QUALITY AUDIT
================================================================================

❀ IDENTIFIER INTEGRITY:
  ➔ Unique Product IDs: 526,564
  ➔ Duplicate IDs found: 0 (Rows sharing the same Product_id)

✎ TEXTUAL QUALITY ANALYSIS:
  ➔ Avg Description Length: 54.3 chars
  ➔ Empty/Whitespace Descriptions: 0
  ➔ Potential 'Placeholders' (e.g., 'None', 'NaN'): 0

⌛ PRICE & DISCOUNT LOGIC:
  ➔ Rows where Discount > Original: 0

☸ CATEGORY OVERLAP & HIERARCHY:
Top Parent Categories:
Category
Indian Wear                 145845
Western                     140992
Topwear                      74537
Bottom Wear                  55439
Lingerie & Sleep Wear        55258
Sports Wear                  20627
Inner Wear &  Sleep Wear     20370
Plus Size                    13496

⭐ RATING SKEW (For products with ratings):
Ratings
5.0     3235
4.9     1570
4.8     4938
4.7     5823
4.6     9668
4.5    13295
4.4    18339
4.3    22529
4.2    20573
4.1    17278
4.0    17203
3.9    11358
3.8    11034
3.7     7042
3.6     5546
3.5     4135
3.4     3382
3.3     2983
3.2     1810
3.1     1053
3.0     2523
2.9      569
2.8      940
2.7      557
2.6      467
2.5      533
2.4      259
2.3      405
2.2      154
2.1       54
2.0      441
1.9       23
1.8       92
1.7       65
1.6       39
1.5      101
1.4       11
1.3       35
1.2        7
1.1        2
1.0      341

Ὄ SYSTEM RESOURCE USAGE:
  ➔ Total memory footprint: 348.74 MB

================================================================================
TECHNICAL OBSERVATIONS:
- Product_id redundancy: We need to decide if we keep the first or last instance.
================================================================================

```

# Cell 15 (code)

import pandas as pd
import numpy as np

# ============================================================
# MYNTRA FASHION DATASET — COMPLETE CLEANING PIPELINE
# Input:  df  (raw Myntra DataFrame, 526,564 rows)
# Output: df_clean  (ready to concat with Amazon df_clean)
# ============================================================

print("=" * 65)
print("  MYNTRA CLEANING PIPELINE")
print("=" * 65)
print(f"\n📦 Raw shape: {df.shape}")

# ── STEP 1: Work on a copy ───────────────────────────────────
df_clean = df.copy()

# ── STEP 2: Drop identifier-only columns ────────────────────
df_clean.drop(columns=["URL", "Product_id"], inplace=True)
print(f"\n✅ Step 2 | Dropped URL & Product_id → shape: {df_clean.shape}")

# ── STEP 3: Keep only rows with Ratings (non-null) ──────────
before = len(df_clean)
df_clean = df_clean[df_clean["Ratings"].notna()]
print(f"✅ Step 3 | Dropped null Ratings: removed {before - len(df_clean):,} rows → {len(df_clean):,} remain")

# ── STEP 4: Keep only rows where Reviews > 0 ────────────────
before = len(df_clean)
df_clean = df_clean[df_clean["Reviews"].notna() & (df_clean["Reviews"] > 0)]
print(f"✅ Step 4 | Dropped Reviews ≤ 0 or null: removed {before - len(df_clean):,} rows → {len(df_clean):,} remain")

# ── STEP 5: Drop rows with null gender / price / category ───
before = len(df_clean)
df_clean = df_clean.dropna(subset=["category_by_Gender", "OriginalPrice (in Rs)", "Individual_category"])
print(f"✅ Step 5 | Dropped nulls in key cols: removed {before - len(df_clean):,} rows → {len(df_clean):,} remain")

# ── STEP 6: Create parent_asin (reset index as surrogate ID) ─
df_clean = df_clean.reset_index(drop=True)
df_clean["parent_asin"] = "MYNTRA_" + df_clean.index.astype(str)
print(f"✅ Step 6 | Created parent_asin (MYNTRA_0, MYNTRA_1, ...)")

# ── STEP 7: Rename title column ─────────────────────────────
# Description column serves as the product title in Myntra
df_clean.rename(columns={"Description": "title"}, inplace=True)
print(f"✅ Step 7 | Renamed 'Description' → 'title'")

# ── STEP 8: Gender harmonisation ────────────────────────────
gender_map = {
    "Men":   "Men",
    "Women": "Women",
    "Boys":  "Youth",
    "Girls": "Youth",
}
df_clean["gender"] = df_clean["category_by_Gender"].map(gender_map)

# Drop any unmapped gender values
before = len(df_clean)
df_clean = df_clean[df_clean["gender"].notna()]
print(f"✅ Step 8 | Gender harmonised (Men/Women/Youth): removed {before - len(df_clean):,} unknown → {len(df_clean):,} remain")
print(f"           Distribution:\n{df_clean['gender'].value_counts().to_string()}")

# ── STEP 9: individual_category (direct from Myntra) ────────
df_clean.rename(columns={"Individual_category": "individual_category"}, inplace=True)
# Clean up any whitespace
df_clean["individual_category"] = df_clean["individual_category"].str.strip()
print(f"✅ Step 9 | individual_category — {df_clean['individual_category'].nunique()} unique types")

# ── STEP 10: price_usd (INR → USD, cap at $500) ─────────────
INR_TO_USD = 83.5
df_clean["price_usd"] = pd.to_numeric(df_clean["OriginalPrice (in Rs)"], errors="coerce") / INR_TO_USD

before = len(df_clean)
df_clean = df_clean[df_clean["price_usd"].notna() & (df_clean["price_usd"] > 0)]
print(f"✅ Step 10 | Converted INR → USD (÷83.5): removed {before - len(df_clean):,} null/zero prices")

# Cap at $500 (same rule as Amazon)
before = len(df_clean)
df_clean = df_clean[df_clean["price_usd"] <= 500]
print(f"           Capped at $500: removed {before - len(df_clean):,} luxury outliers → {len(df_clean):,} remain")

# ── STEP 11: brand ───────────────────────────────────────────
df_clean.rename(columns={"BrandName": "brand"}, inplace=True)
df_clean["brand"] = df_clean["brand"].fillna("Unknown").str.strip()
print(f"✅ Step 11 | brand — {df_clean['brand'].nunique():,} unique brands")

# ── STEP 12: average_rating & rating_number ─────────────────
df_clean.rename(columns={
    "Ratings": "average_rating",
    "Reviews": "rating_number"
}, inplace=True)
df_clean["average_rating"] = pd.to_numeric(df_clean["average_rating"], errors="coerce")
df_clean["rating_number"]  = pd.to_numeric(df_clean["rating_number"],  errors="coerce").astype(int)
print(f"✅ Step 12 | average_rating & rating_number cast to numeric")

# ── STEP 13: is_trending (same threshold as Amazon: ≥ 4.2) ──
df_clean["is_trending"] = df_clean["average_rating"].apply(lambda x: "Yes" if x >= 4.2 else "No")
trend_counts = df_clean["is_trending"].value_counts()
print(f"✅ Step 13 | is_trending (≥4.2 = Yes):")
print(f"           Yes: {trend_counts.get('Yes', 0):,}  |  No: {trend_counts.get('No', 0):,}")

# ── STEP 14: source_market ───────────────────────────────────
df_clean["source_market"] = "IN"
print(f"✅ Step 14 | source_market = 'IN' (hardcoded)")

# ── STEP 15: Select & reorder to match Amazon schema ─────────
FINAL_COLS = [
    "parent_asin",
    "title",
    "gender",
    "individual_category",
    "price_usd",
    "brand",
    "average_rating",
    "rating_number",
    "is_trending",
    "source_market",
]
df_clean = df_clean[FINAL_COLS].reset_index(drop=True)
print(f"✅ Step 15 | Columns reordered to match Amazon schema")

# ── STEP 16: Final null check & dedup ────────────────────────
null_check = df_clean.isnull().sum()
dup_check  = df_clean.duplicated().sum()
print(f"✅ Step 16 | Null check:\n{null_check.to_string()}")
print(f"           Duplicate rows: {dup_check}")

# ============================================================
# VERIFICATION REPORT
# ============================================================
print("\n" + "=" * 65)
print("  ✅ MYNTRA CLEANING COMPLETE — VERIFICATION REPORT")
print("=" * 65)

print(f"\n📐 Final Shape:       {df_clean.shape[0]:,} rows × {df_clean.shape[1]} columns")

print(f"\n📋 Columns (matches Amazon schema):")
for col in df_clean.columns:
    print(f"   {col:<22} dtype: {df_clean[col].dtype}")

print(f"\n🚻 Gender Distribution:")
print(df_clean["gender"].value_counts().to_string())

print(f"\n🏷️  is_trending Distribution:")
print(df_clean["is_trending"].value_counts().to_string())

print(f"\n💰 Price (USD) Stats:")
print(df_clean["price_usd"].describe().round(2).to_string())

print(f"\n⭐ Rating Stats:")
print(df_clean["average_rating"].describe().round(3).to_string())

print(f"\n🏪 Top 10 Brands:")
print(df_clean["brand"].value_counts().head(10).to_string())

print(f"\n👗 Top 15 Individual Categories:")
print(df_clean["individual_category"].value_counts().head(15).to_string())

print(f"\n🌍 Source Market:")
print(df_clean["source_market"].value_counts().to_string())

print(f"\n🔍 Sample Rows:")
display(df_clean.head(5))

print(f"\n🔗 Schema compatibility with Amazon df_clean:")
amazon_cols = ["parent_asin","title","gender","individual_category",
               "price_usd","brand","average_rating","rating_number",
               "is_trending","source_market"]
match = list(df_clean.columns) == amazon_cols
print(f"   Column order matches Amazon: {'✅ YES' if match else '❌ NO'}")
print(f"   Zero nulls:                  {'✅ YES' if df_clean.isnull().sum().sum() == 0 else '❌ NO — check above'}")
print(f"   Zero duplicates:             {'✅ YES' if df_clean.duplicated().sum() == 0 else '❌ NO'}")

print("\n✅ df_clean is ready. Run pd.concat([amazon_df_clean, df_clean]) to integrate.")

## Output
```
=================================================================
  MYNTRA CLEANING PIPELINE
=================================================================

📦 Raw shape: (526564, 15)

✅ Step 2 | Dropped URL & Product_id → shape: (526564, 13)
✅ Step 3 | Dropped null Ratings: removed 336,152 rows → 190,412 remain
✅ Step 4 | Dropped Reviews ≤ 0 or null: removed 4,454 rows → 185,958 remain
✅ Step 5 | Dropped nulls in key cols: removed 0 rows → 185,958 remain
✅ Step 6 | Created parent_asin (MYNTRA_0, MYNTRA_1, ...)
✅ Step 7 | Renamed 'Description' → 'title'
✅ Step 8 | Gender harmonised (Men/Women/Youth): removed 0 unknown → 185,958 remain
           Distribution:
gender
Women    116915
Men       69043
✅ Step 9 | individual_category — 87 unique types
✅ Step 10 | Converted INR → USD (÷83.5): removed 0 null/zero prices
           Capped at $500: removed 1 luxury outliers → 185,957 remain
✅ Step 11 | brand — 1,563 unique brands
✅ Step 12 | average_rating & rating_number cast to numeric
✅ Step 13 | is_trending (≥4.2 = Yes):
           Yes: 97,514  |  No: 88,443
✅ Step 14 | source_market = 'IN' (hardcoded)
✅ Step 15 | Columns reordered to match Amazon schema
✅ Step 16 | Null check:
parent_asin            0
title                  0
gender                 0
individual_category    0
price_usd              0
brand                  0
average_rating         0
rating_number          0
is_trending            0
source_market          0
           Duplicate rows: 0

=================================================================
  ✅ MYNTRA CLEANING COMPLETE — VERIFICATION REPORT
=================================================================

📐 Final Shape:       185,957 rows × 10 columns

📋 Columns (matches Amazon schema):
   parent_asin            dtype: object
   title                  dtype: object
   gender                 dtype: object
   individual_category    dtype: object
   price_usd              dtype: float64
   brand                  dtype: object
   average_rating         dtype: float64
   rating_number          dtype: int64
   is_trending            dtype: object
   source_market          dtype: object

🚻 Gender Distribution:
gender
Women    116914
Men       69043

🏷️  is_trending Distribution:
is_trending
Yes    97514
No     88443

💰 Price (USD) Stats:
count    185957.00
mean         24.63
std          17.03
min           1.19
25%          14.36
50%          21.54
75%          29.93
max         437.13

⭐ Rating Stats:
count    185957.000
mean          4.094
std           0.499
min           1.000
25%           3.900
50%           4.200
75%           4.400
max           5.000

🏪 Top 10 Brands:
brand
Roadster                 7589
HERE&NOW                 5054
Mast & Harbour           4137
HRX by Hrithik Roshan    3953
DressBerry               3871
Puma                     2944
Sangria                  2891
URBANIC                  2460
Tokyo Talkies            2222
MANGO                    1980

👗 Top 15 Individual Categories:
individual_category
tshirts        22625
tops           15402
dresses        13449
jeans          13102
kurtas         11685
shirts         10687
trousers       10009
kurta-sets      8789
bra             8004
track-pants     7024
sweatshirts     6020
jackets         5397
shorts          5264
sarees          5113
briefs          4472

🌍 Source Market:
source_market
IN    185957

🔍 Sample Rows:

```

## Output
```

🔗 Schema compatibility with Amazon df_clean:
   Column order matches Amazon: ✅ YES
   Zero nulls:                  ✅ YES
   Zero duplicates:             ✅ YES

✅ df_clean is ready. Run pd.concat([amazon_df_clean, df_clean]) to integrate.

```

# Cell 16 (code)

import pandas as pd
import numpy as np

# ============================================================
#   MYNTRA df_clean — FULL PRE-INTEGRATION AUDIT
#   Run this BEFORE pd.concat with Amazon data
# ============================================================

SEP = "=" * 68

print(SEP)
print("  MYNTRA df_clean — COMPLETE MODEL-READINESS AUDIT")
print(SEP)

# ── 1. SHAPE & SCHEMA ───────────────────────────────────────
print("\n📐 [1] SHAPE & SCHEMA")
print(f"   Rows    : {df_clean.shape[0]:,}")
print(f"   Columns : {df_clean.shape[1]}")
print(f"\n   {'Column':<22} {'Dtype':<12} {'Non-Null':>10}  {'Null':>8}  {'Null %':>8}")
print("   " + "-" * 62)
for col in df_clean.columns:
    nn  = df_clean[col].notna().sum()
    nul = df_clean[col].isna().sum()
    pct = nul / len(df_clean) * 100
    print(f"   {col:<22} {str(df_clean[col].dtype):<12} {nn:>10,}  {nul:>8,}  {pct:>7.2f}%")

# ── 2. AMAZON SCHEMA COMPATIBILITY CHECK ────────────────────
print(f"\n🔗 [2] AMAZON SCHEMA COMPATIBILITY")
EXPECTED_COLS = ["parent_asin","title","gender","individual_category",
                 "price_usd","brand","average_rating","rating_number",
                 "is_trending","source_market"]
EXPECTED_DTYPES = {
    "parent_asin": "object", "title": "object", "gender": "object",
    "individual_category": "object", "price_usd": "float64",
    "brand": "object", "average_rating": "float64",
    "rating_number": "int64", "is_trending": "object",
    "source_market": "object"
}
all_ok = True
for col in EXPECTED_COLS:
    present  = col in df_clean.columns
    dtype_ok = str(df_clean[col].dtype) == EXPECTED_DTYPES[col] if present else False
    status   = "✅" if (present and dtype_ok) else "❌"
    if not (present and dtype_ok): all_ok = False
    print(f"   {status}  {col:<22}  expected: {EXPECTED_DTYPES[col]:<10}  got: {str(df_clean[col].dtype) if present else 'MISSING'}")
col_order_ok = list(df_clean.columns) == EXPECTED_COLS
print(f"\n   Column ORDER matches Amazon : {'✅ YES' if col_order_ok else '❌ NO'}")
print(f"   All dtypes correct          : {'✅ YES' if all_ok else '❌ NO — fix before concat'}")

# ── 3. NULLS & DUPLICATES ───────────────────────────────────
print(f"\n🔍 [3] NULLS & DUPLICATES")
total_nulls = df_clean.isnull().sum().sum()
total_dups  = df_clean.duplicated().sum()
asin_dups   = df_clean["parent_asin"].duplicated().sum()
print(f"   Total null cells      : {total_nulls:,}  {'✅' if total_nulls == 0 else '❌'}")
print(f"   Duplicate rows        : {total_dups:,}   {'✅' if total_dups  == 0 else '❌'}")
print(f"   Duplicate parent_asin : {asin_dups:,}   {'✅' if asin_dups   == 0 else '❌'}")

# ── 4. TARGET VARIABLE — is_trending ────────────────────────
print(f"\n🎯 [4] TARGET VARIABLE — is_trending")
vc = df_clean["is_trending"].value_counts()
total = len(df_clean)
for label, count in vc.items():
    bar = "█" * int(count / total * 40)
    print(f"   {label:<5}  {count:>7,}  ({count/total*100:.1f}%)  {bar}")
valid_vals = set(df_clean["is_trending"].unique()) <= {"Yes", "No"}
print(f"\n   Only 'Yes'/'No' values : {'✅' if valid_vals else '❌ unexpected values found'}")
imbalance = vc.max() / vc.min()
print(f"   Class imbalance ratio  : {imbalance:.2f}x  {'✅ acceptable' if imbalance < 3 else '⚠️ consider resampling'}")

# ── 5. GENDER — primary demographic feature ─────────────────
print(f"\n🚻 [5] GENDER  (primary model feature)")
vc = df_clean["gender"].value_counts()
for label, count in vc.items():
    bar = "█" * int(count / total * 40)
    print(f"   {label:<8}  {count:>7,}  ({count/total*100:.1f}%)  {bar}")
valid_gender = set(df_clean["gender"].unique()) <= {"Men", "Women", "Youth"}
print(f"\n   Only Men/Women/Youth   : {'✅' if valid_gender else '❌ unexpected labels found'}")
print(f"   Unexpected values      : {set(df_clean['gender'].unique()) - {'Men','Women','Youth'}}")

# ── 6. INDIVIDUAL CATEGORY — key categorical feature ────────
print(f"\n👗 [6] INDIVIDUAL_CATEGORY  (key categorical feature)")
vc = df_clean["individual_category"].value_counts()
print(f"   Unique categories : {df_clean['individual_category'].nunique()}")
print(f"\n   {'Category':<28} {'Count':>8}  {'%':>6}  Bar")
print("   " + "-" * 58)
for cat, count in vc.head(20).items():
    bar = "█" * int(count / vc.max() * 25)
    print(f"   {cat:<28} {count:>8,}  {count/total*100:>5.1f}%  {bar}")
if len(vc) > 20:
    print(f"   ... and {len(vc)-20} more categories")

# ── 7. PRICE (USD) — numeric feature ────────────────────────
print(f"\n💰 [7] PRICE_USD  (numeric feature)")
p = df_clean["price_usd"]
print(f"   Min     : ${p.min():.2f}")
print(f"   Max     : ${p.max():.2f}   {'✅ capped at $500' if p.max() <= 500 else '❌ cap not applied'}")
print(f"   Mean    : ${p.mean():.2f}")
print(f"   Median  : ${p.median():.2f}")
print(f"   Std Dev : ${p.std():.2f}")
print(f"   Zeros   : {(p == 0).sum():,}  {'✅' if (p==0).sum()==0 else '❌ zero prices found'}")
print(f"   Negatives: {(p < 0).sum():,} {'✅' if (p<0).sum()==0 else '❌'}")
# Price buckets
bins   = [0, 5, 15, 30, 60, 100, 200, 500]
labels = ["$0–5","$5–15","$15–30","$30–60","$60–100","$100–200","$200–500"]
bucketed = pd.cut(p, bins=bins, labels=labels)
print(f"\n   Price Distribution Buckets:")
for lbl, cnt in bucketed.value_counts().sort_index().items():
    bar = "█" * int(cnt / len(p) * 35)
    print(f"   {lbl:<12}  {cnt:>7,}  ({cnt/len(p)*100:.1f}%)  {bar}")

# ── 8. AVERAGE RATING ───────────────────────────────────────
print(f"\n⭐ [8] AVERAGE_RATING")
r = df_clean["average_rating"]
print(f"   Min : {r.min()}  |  Max : {r.max()}  |  Mean : {r.mean():.3f}  |  Median : {r.median()}")
print(f"   Out-of-range (< 1 or > 5) : {((r < 1) | (r > 5)).sum():,}  {'✅' if ((r<1)|(r>5)).sum()==0 else '❌'}")
print(f"\n   Rating Band Breakdown:")
bands = [(5.0,5.0,"⭐⭐⭐⭐⭐ 5.0"),(4.5,4.9,"⭐⭐⭐⭐½ 4.5–4.9"),
         (4.2,4.4,"⭐⭐⭐⭐  4.2–4.4 [TRENDING ZONE]"),
         (4.0,4.1,"⭐⭐⭐⭐  4.0–4.1"),(3.0,3.9,"⭐⭐⭐   3.0–3.9"),
         (1.0,2.9,"⭐⭐    1.0–2.9")]
for lo, hi, name in bands:
    cnt = ((r >= lo) & (r <= hi)).sum()
    bar = "█" * int(cnt / len(r) * 30)
    print(f"   {name:<38}  {cnt:>7,}  ({cnt/len(r)*100:.1f}%)  {bar}")

# ── 9. RATING_NUMBER (review count) ─────────────────────────
print(f"\n📝 [9] RATING_NUMBER (review volume)")
rn = df_clean["rating_number"]
print(f"   Min     : {rn.min():,}")
print(f"   Max     : {rn.max():,}")
print(f"   Mean    : {rn.mean():,.1f}")
print(f"   Zeros   : {(rn == 0).sum():,}  {'✅' if (rn==0).sum()==0 else '❌ zero review rows found'}")

# ── 10. BRAND ───────────────────────────────────────────────
print(f"\n🏪 [10] BRAND")
vc_b = df_clean["brand"].value_counts()
print(f"   Unique brands  : {df_clean['brand'].nunique():,}")
print(f"   'Unknown' count: {(df_clean['brand'] == 'Unknown').sum():,}")
print(f"\n   Top 10 Brands:")
for brand, count in vc_b.head(10).items():
    bar = "█" * int(count / vc_b.max() * 25)
    print(f"   {brand:<30}  {count:>6,}  {bar}")

# ── 11. SOURCE MARKET ────────────────────────────────────────
print(f"\n🌍 [11] SOURCE_MARKET")
vc_sm = df_clean["source_market"].value_counts()
for mkt, cnt in vc_sm.items():
    print(f"   {mkt}  →  {cnt:,}")
print(f"   Only 'IN' values: {'✅' if list(vc_sm.index) == ['IN'] else '❌'}")

# ── 12. CROSS-FEATURE SANITY CHECKS ─────────────────────────
print(f"\n🔬 [12] CROSS-FEATURE SANITY CHECKS")

# is_trending vs average_rating alignment
mismatched = df_clean[
    ((df_clean["average_rating"] >= 4.2) & (df_clean["is_trending"] == "No")) |
    ((df_clean["average_rating"] <  4.2) & (df_clean["is_trending"] == "Yes"))
]
print(f"   is_trending ↔ rating mismatch rows : {len(mismatched):,}  {'✅' if len(mismatched)==0 else '❌ MISMATCH FOUND'}")

# Gender × is_trending cross-tab
print(f"\n   is_trending by Gender (cross-tab):")
ct = pd.crosstab(df_clean["gender"], df_clean["is_trending"], margins=True)
print(ct.to_string())

# Category × is_trending (top 10)
print(f"\n   Trending Rate by Top 10 Category:")
top10_cats = df_clean["individual_category"].value_counts().head(10).index
cat_trend  = (df_clean[df_clean["individual_category"].isin(top10_cats)]
              .groupby("individual_category")["is_trending"]
              .apply(lambda x: (x == "Yes").mean() * 100)
              .sort_values(ascending=False))
for cat, pct in cat_trend.items():
    bar = "█" * int(pct / 100 * 30)
    print(f"   {cat:<25}  {pct:>5.1f}% trending  {bar}")

# ── 13. CONCAT READINESS PREVIEW ────────────────────────────
print(f"\n🔗 [13] pd.concat READINESS — COLUMN ALIGNMENT PREVIEW")
print(f"\n   {'Column':<22}  Myntra dtype    Amazon dtype   Match?")
print("   " + "-" * 60)
amazon_dtypes = {
    "parent_asin": "object", "title": "object", "gender": "object",
    "individual_category": "object", "price_usd": "float64",
    "brand": "object", "average_rating": "float64",
    "rating_number": "int64", "is_trending": "object", "source_market": "object"
}
for col in EXPECTED_COLS:
    m_dtype = str(df_clean[col].dtype)
    a_dtype = amazon_dtypes[col]
    match   = "✅" if m_dtype == a_dtype else "❌"
    print(f"   {col:<22}  {m_dtype:<16} {a_dtype:<14} {match}")

# ── FINAL VERDICT ────────────────────────────────────────────
print(f"\n{SEP}")
print("  FINAL VERDICT")
print(SEP)
checks = {
    "Zero nulls"              : total_nulls == 0,
    "Zero duplicates"         : total_dups  == 0,
    "Correct column order"    : col_order_ok,
    "All dtypes correct"      : all_ok,
    "Gender labels valid"     : valid_gender,
    "is_trending labels valid": valid_vals,
    "No zero prices"          : (df_clean["price_usd"] == 0).sum() == 0,
    "Price capped at $500"    : df_clean["price_usd"].max() <= 500,
    "Rating in 1–5 range"     : ((r < 1) | (r > 5)).sum() == 0,
    "No zero review counts"   : (df_clean["rating_number"] == 0).sum() == 0,
    "is_trending ↔ rating OK" : len(mismatched) == 0,
    "source_market = IN only" : list(df_clean["source_market"].unique()) == ["IN"],
}
all_passed = all(checks.values())
for check, passed in checks.items():
    print(f"   {'✅' if passed else '❌'}  {check}")

print(f"\n   {'🎉 ALL CHECKS PASSED — df_clean is CONCAT-READY' if all_passed else '⚠️  FIX THE ❌ ITEMS ABOVE BEFORE CONCAT'}")
print(f"\n   When ready, run:")
print(f"   >>> combined_df = pd.concat([amazon_df_clean, df_clean], ignore_index=True)")
print(f"   >>> print(combined_df.shape)   # expect ~214,000+ rows × 10 cols")
print(SEP)

## Output
```
====================================================================
  MYNTRA df_clean — COMPLETE MODEL-READINESS AUDIT
====================================================================

📐 [1] SHAPE & SCHEMA
   Rows    : 185,957
   Columns : 10

   Column                 Dtype          Non-Null      Null    Null %
   --------------------------------------------------------------
   parent_asin            object          185,957         0     0.00%
   title                  object          185,957         0     0.00%
   gender                 object          185,957         0     0.00%
   individual_category    object          185,957         0     0.00%
   price_usd              float64         185,957         0     0.00%
   brand                  object          185,957         0     0.00%
   average_rating         float64         185,957         0     0.00%
   rating_number          int64           185,957         0     0.00%
   is_trending            object          185,957         0     0.00%
   source_market          object          185,957         0     0.00%

🔗 [2] AMAZON SCHEMA COMPATIBILITY
   ✅  parent_asin             expected: object      got: object
   ✅  title                   expected: object      got: object
   ✅  gender                  expected: object      got: object
   ✅  individual_category     expected: object      got: object
   ✅  price_usd               expected: float64     got: float64
   ✅  brand                   expected: object      got: object
   ✅  average_rating          expected: float64     got: float64
   ✅  rating_number           expected: int64       got: int64
   ✅  is_trending             expected: object      got: object
   ✅  source_market           expected: object      got: object

   Column ORDER matches Amazon : ✅ YES
   All dtypes correct          : ✅ YES

🔍 [3] NULLS & DUPLICATES
   Total null cells      : 0  ✅
   Duplicate rows        : 0   ✅
   Duplicate parent_asin : 0   ✅

🎯 [4] TARGET VARIABLE — is_trending
   Yes     97,514  (52.4%)  ████████████████████
   No      88,443  (47.6%)  ███████████████████

   Only 'Yes'/'No' values : ✅
   Class imbalance ratio  : 1.10x  ✅ acceptable

🚻 [5] GENDER  (primary model feature)
   Women     116,914  (62.9%)  █████████████████████████
   Men        69,043  (37.1%)  ██████████████

   Only Men/Women/Youth   : ✅
   Unexpected values      : set()

👗 [6] INDIVIDUAL_CATEGORY  (key categorical feature)
   Unique categories : 87

   Category                        Count       %  Bar
   ----------------------------------------------------------
   tshirts                        22,625   12.2%  █████████████████████████
   tops                           15,402    8.3%  █████████████████
   dresses                        13,449    7.2%  ██████████████
   jeans                          13,102    7.0%  ██████████████
   kurtas                         11,685    6.3%  ████████████
   shirts                         10,687    5.7%  ███████████
   trousers                       10,009    5.4%  ███████████
   kurta-sets                      8,789    4.7%  █████████
   bra                             8,004    4.3%  ████████
   track-pants                     7,024    3.8%  ███████
   sweatshirts                     6,020    3.2%  ██████
   jackets                         5,397    2.9%  █████
   shorts                          5,264    2.8%  █████
   sarees                          5,113    2.7%  █████
   briefs                          4,472    2.4%  ████
   night-suits                     4,189    2.3%  ████
   sweaters                        3,514    1.9%  ███
   lounge-pants                    2,580    1.4%  ██
   nightdress                      2,532    1.4%  ██
   leggings                        1,804    1.0%  █
   ... and 67 more categories

💰 [7] PRICE_USD  (numeric feature)
   Min     : $1.19
   Max     : $437.13   ✅ capped at $500
   Mean    : $24.63
   Median  : $21.54
   Std Dev : $17.03
   Zeros   : 0  ✅
   Negatives: 0 ✅

   Price Distribution Buckets:
   $0–5            3,177  (1.7%)  
   $5–15          46,395  (24.9%)  ████████
   $15–30         94,620  (50.9%)  █████████████████
   $30–60         35,677  (19.2%)  ██████
   $60–100         4,948  (2.7%)  
   $100–200        1,069  (0.6%)  
   $200–500           71  (0.0%)  

⭐ [8] AVERAGE_RATING
   Min : 1.0  |  Max : 5.0  |  Mean : 4.094  |  Median : 4.2
   Out-of-range (< 1 or > 5) : 0  ✅

   Rating Band Breakdown:
   ⭐⭐⭐⭐⭐ 5.0                                 3,235  (1.7%)  
   ⭐⭐⭐⭐½ 4.5–4.9                            35,149  (18.9%)  █████
   ⭐⭐⭐⭐  4.2–4.4 [TRENDING ZONE]            59,130  (31.8%)  █████████
   ⭐⭐⭐⭐  4.0–4.1                            33,182  (17.8%)  █████
   ⭐⭐⭐   3.0–3.9                            50,168  (27.0%)  ████████
   ⭐⭐    1.0–2.9                             5,093  (2.7%)  

📝 [9] RATING_NUMBER (review volume)
   Min     : 1
   Max     : 999
   Mean    : 63.5
   Zeros   : 0  ✅

🏪 [10] BRAND
   Unique brands  : 1,563
   'Unknown' count: 0

   Top 10 Brands:
   Roadster                         7,589  █████████████████████████
   HERE&NOW                         5,054  ████████████████
   Mast & Harbour                   4,137  █████████████
   HRX by Hrithik Roshan            3,953  █████████████
   DressBerry                       3,871  ████████████
   Puma                             2,944  █████████
   Sangria                          2,891  █████████
   URBANIC                          2,460  ████████
   Tokyo Talkies                    2,222  ███████
   MANGO                            1,980  ██████

🌍 [11] SOURCE_MARKET
   IN  →  185,957
   Only 'IN' values: ✅

🔬 [12] CROSS-FEATURE SANITY CHECKS
   is_trending ↔ rating mismatch rows : 0  ✅

   is_trending by Gender (cross-tab):
is_trending     No    Yes     All
gender                           
Men          33648  35395   69043
Women        54795  62119  116914
All          88443  97514  185957

   Trending Rate by Top 10 Category:
   tshirts                     63.7% trending  ███████████████████
   shirts                      55.4% trending  ████████████████
   bra                         54.1% trending  ████████████████
   tops                        50.2% trending  ███████████████
   dresses                     48.5% trending  ██████████████
   kurtas                      46.8% trending  ██████████████
   trousers                    44.7% trending  █████████████
   track-pants                 43.7% trending  █████████████
   kurta-sets                  42.1% trending  ████████████
   jeans                       37.0% trending  ███████████

🔗 [13] pd.concat READINESS — COLUMN ALIGNMENT PREVIEW

   Column                  Myntra dtype    Amazon dtype   Match?
   ------------------------------------------------------------
   parent_asin             object           object         ✅
   title                   object           object         ✅
   gender                  object           object         ✅
   individual_category     object           object         ✅
   price_usd               float64          float64        ✅
   brand                   object           object         ✅
   average_rating          float64          float64        ✅
   rating_number           int64            int64          ✅
   is_trending             object           object         ✅
   source_market           object           object         ✅

====================================================================
  FINAL VERDICT
====================================================================
   ✅  Zero nulls
   ✅  Zero duplicates
   ✅  Correct column order
   ✅  All dtypes correct
   ✅  Gender labels valid
   ✅  is_trending labels valid
   ✅  No zero prices
   ✅  Price capped at $500
   ✅  Rating in 1–5 range
   ✅  No zero review counts
   ✅  is_trending ↔ rating OK
   ✅  source_market = IN only

   🎉 ALL CHECKS PASSED — df_clean is CONCAT-READY

   When ready, run:
   >>> combined_df = pd.concat([amazon_df_clean, df_clean], ignore_index=True)
   >>> print(combined_df.shape)   # expect ~214,000+ rows × 10 cols
====================================================================

```

# Cell 17 (code)

df_clean_amazon=pd.read_csv("cleaned_amazon_fashion_dataset.csv")

# Cell 18 (code)

df_clean_amazon.info()

## Output
```
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 28435 entries, 0 to 28434
Data columns (total 10 columns):
 #   Column               Non-Null Count  Dtype  
---  ------               --------------  -----  
 0   parent_asin          28435 non-null  object 
 1   title                28433 non-null  object 
 2   gender               28435 non-null  object 
 3   individual_category  28435 non-null  object 
 4   price_usd            28435 non-null  float64
 5   brand                28432 non-null  object 
 6   average_rating       28435 non-null  float64
 7   rating_number        28435 non-null  int64  
 8   is_trending          28435 non-null  object 
 9   source_market        28435 non-null  object 
dtypes: float64(2), int64(1), object(7)
memory usage: 2.2+ MB

```

# Cell 19 (code)

import pandas as pd
import numpy as np

# ============================================================
#   DATASET INTEGRATION — Amazon (US) + Myntra (IN)
#   Goal: Unified df for Random Forest trend prediction
# ============================================================

SEP  = "=" * 68
SEP2 = "-" * 68

print(SEP)
print("  PHASE 1: PRE-CONCAT FIXES & VALIDATION")
print(SEP)

# ── Fix Amazon: 2 null titles + 3 null brands ───────────────
df_clean_amazon["title"] = df_clean_amazon["title"].fillna("Unknown Product")
df_clean_amazon["brand"] = df_clean_amazon["brand"].fillna("Unknown")

print(f"📦 Amazon  df shape : {df_clean_amazon.shape[0]:>7,} rows × {df_clean_amazon.shape[1]} cols")
print(f"📦 Myntra  df shape : {df_clean.shape[0]:>7,} rows × {df_clean.shape[1]} cols")

# ── Confirm both have identical columns & dtypes ────────────
print(f"\n{'Column':<22} {'Amazon dtype':<16} {'Myntra dtype':<16} {'Match?'}")
print(SEP2)
all_match = True
for col in df_clean_amazon.columns:
    a_dt = str(df_clean_amazon[col].dtype)
    m_dt = str(df_clean[col].dtype)
    match = "✅" if a_dt == m_dt else "❌"
    if a_dt != m_dt: all_match = False
    print(f"{col:<22} {a_dt:<16} {m_dt:<16} {match}")
print(f"\nAll dtypes match: {'✅ YES — safe to concat' if all_match else '❌ Fix dtypes first'}")

# ============================================================
#   PHASE 2: CONCATENATION
# ============================================================
print(f"\n{SEP}")
print("  PHASE 2: CONCATENATION")
print(SEP)

combined_df = pd.concat([df_clean_amazon, df_clean], ignore_index=True)

print(f"\n✅ pd.concat complete!")
print(f"   Amazon rows  : {len(df_clean_amazon):>7,}")
print(f"   Myntra rows  : {len(df_clean):>7,}")
print(f"   Combined rows: {len(combined_df):>7,}  (expected: {len(df_clean_amazon)+len(df_clean):,})")
print(f"   Columns      : {combined_df.shape[1]}")
row_check = len(combined_df) == len(df_clean_amazon) + len(df_clean)
print(f"   Row count OK : {'✅' if row_check else '❌ ROW COUNT MISMATCH'}")

# ── Final dtype fixes for model readiness ───────────────────
combined_df["rating_number"] = combined_df["rating_number"].astype(int)
combined_df["price_usd"]     = combined_df["price_usd"].astype(float)
combined_df["average_rating"]= combined_df["average_rating"].astype(float)

# ── Encode target & categoricals for Random Forest ──────────
combined_df["is_trending_binary"] = (combined_df["is_trending"] == "Yes").astype(int)

print(f"\n✅ Added 'is_trending_binary' (1=Yes, 0=No) for model input")

# ============================================================
#   PHASE 3: FULL INTEGRATION CROSS-CHECK
# ============================================================
print(f"\n{SEP}")
print("  PHASE 3: FULL INTEGRATION CROSS-CHECK")
print(SEP)

# ── 3.1 Shape & Nulls ───────────────────────────────────────
print(f"\n📐 [3.1] SHAPE & NULL CHECK")
print(f"   Final shape : {combined_df.shape[0]:,} rows × {combined_df.shape[1]} columns")
print(f"\n   {'Column':<22} {'Non-Null':>10}  {'Null':>8}  {'Null%':>7}")
print(f"   {SEP2}")
for col in combined_df.columns:
    nn  = combined_df[col].notna().sum()
    nul = combined_df[col].isna().sum()
    pct = nul / len(combined_df) * 100
    flag = "✅" if nul == 0 else "❌"
    print(f"   {col:<22} {nn:>10,}  {nul:>8,}  {pct:>6.2f}%  {flag}")

# ── 3.2 Source Market Split ──────────────────────────────────
print(f"\n🌍 [3.2] SOURCE MARKET SPLIT")
vc_sm = combined_df["source_market"].value_counts()
for mkt, cnt in vc_sm.items():
    bar = "█" * int(cnt / len(combined_df) * 35)
    print(f"   {mkt}   {cnt:>7,}  ({cnt/len(combined_df)*100:.1f}%)  {bar}")
print(f"   Only US/IN values : {'✅' if set(vc_sm.index) == {'US','IN'} else '❌'}")

# ── 3.3 Target Variable ──────────────────────────────────────
print(f"\n🎯 [3.3] TARGET VARIABLE — is_trending (combined)")
vc_t = combined_df["is_trending"].value_counts()
for label, cnt in vc_t.items():
    bar = "█" * int(cnt / len(combined_df) * 35)
    print(f"   {label:<5} {cnt:>7,}  ({cnt/len(combined_df)*100:.1f}%)  {bar}")
imb = vc_t.max() / vc_t.min()
print(f"   Imbalance ratio : {imb:.2f}x  {'✅ acceptable for RF' if imb < 3 else '⚠️ consider resampling'}")
valid_vals = set(combined_df["is_trending"].unique()) <= {"Yes","No"}
print(f"   Only Yes/No     : {'✅' if valid_vals else '❌'}")

# ── 3.4 Gender Distribution ──────────────────────────────────
print(f"\n🚻 [3.4] GENDER DISTRIBUTION (combined + by market)")
vc_g = combined_df["gender"].value_counts()
for g, cnt in vc_g.items():
    bar = "█" * int(cnt / len(combined_df) * 30)
    print(f"   {g:<8} {cnt:>7,}  ({cnt/len(combined_df)*100:.1f}%)  {bar}")
valid_gender = set(combined_df["gender"].unique()) <= {"Men","Women","Youth"}
print(f"   Valid labels (Men/Women/Youth) : {'✅' if valid_gender else '❌'}")
print(f"\n   Gender × Source Market:")
print(pd.crosstab(combined_df["gender"], combined_df["source_market"]).to_string())

# ── 3.5 Category Coverage ────────────────────────────────────
print(f"\n👗 [3.5] INDIVIDUAL CATEGORY COVERAGE")
vc_cat = combined_df["individual_category"].value_counts()
print(f"   Total unique categories : {combined_df['individual_category'].nunique()}")
print(f"\n   {'Category':<28} {'Count':>8}  {'%':>6}  Bar")
print(f"   {SEP2}")
for cat, cnt in vc_cat.head(20).items():
    bar = "█" * int(cnt / vc_cat.max() * 25)
    print(f"   {cat:<28} {cnt:>8,}  {cnt/len(combined_df)*100:>5.1f}%  {bar}")

# Category presence by market
print(f"\n   Categories exclusive to Amazon (US):")
cats_amazon = set(df_clean_amazon["individual_category"].unique())
cats_myntra = set(df_clean["individual_category"].unique())
only_amazon = cats_amazon - cats_myntra
only_myntra = cats_myntra - cats_amazon
shared      = cats_amazon & cats_myntra
print(f"   Amazon-only : {sorted(only_amazon)}")
print(f"   Myntra-only : {sorted(list(only_myntra))[:15]}{'...' if len(only_myntra)>15 else ''}")
print(f"   Shared      : {len(shared)} categories overlap between markets")

# ── 3.6 Price Analysis ───────────────────────────────────────
print(f"\n💰 [3.6] PRICE_USD — COMBINED & BY MARKET")
p = combined_df["price_usd"]
print(f"   Combined → Min: ${p.min():.2f}  Max: ${p.max():.2f}  Mean: ${p.mean():.2f}  Median: ${p.median():.2f}")
print(f"\n   {'Market':<8}  {'Min':>7}  {'Median':>8}  {'Mean':>8}  {'Max':>8}")
print(f"   {'-'*45}")
for mkt in ["US","IN"]:
    sub = combined_df[combined_df["source_market"]==mkt]["price_usd"]
    print(f"   {mkt:<8}  ${sub.min():>6.2f}  ${sub.median():>7.2f}  ${sub.mean():>7.2f}  ${sub.max():>7.2f}")
bins   = [0, 5, 15, 30, 60, 100, 200, 500]
labels = ["$0–5","$5–15","$15–30","$30–60","$60–100","$100–200","$200–500"]
bucketed = pd.cut(p, bins=bins, labels=labels)
print(f"\n   Price Buckets (combined):")
for lbl, cnt in bucketed.value_counts().sort_index().items():
    bar = "█" * int(cnt / len(p) * 30)
    print(f"   {lbl:<12}  {cnt:>7,}  ({cnt/len(p)*100:.1f}%)  {bar}")

# ── 3.7 Rating Distribution ──────────────────────────────────
print(f"\n⭐ [3.7] AVERAGE_RATING — COMBINED & BY MARKET")
r = combined_df["average_rating"]
print(f"   Combined → Min: {r.min()}  Max: {r.max()}  Mean: {r.mean():.3f}  Median: {r.median()}")
print(f"   Out-of-range (< 1 or > 5): {((r<1)|(r>5)).sum():,}  {'✅' if ((r<1)|(r>5)).sum()==0 else '❌'}")
for mkt in ["US","IN"]:
    sub = combined_df[combined_df["source_market"]==mkt]["average_rating"]
    print(f"   {mkt} → Mean: {sub.mean():.3f}  Median: {sub.median()}")

# ── 3.8 Cross-feature sanity ─────────────────────────────────
print(f"\n🔬 [3.8] CROSS-FEATURE SANITY CHECKS")
mismatch = combined_df[
    ((combined_df["average_rating"] >= 4.2) & (combined_df["is_trending"] == "No")) |
    ((combined_df["average_rating"] <  4.2) & (combined_df["is_trending"] == "Yes"))
]
print(f"   is_trending ↔ rating mismatch rows : {len(mismatch):,}  {'✅' if len(mismatch)==0 else '❌'}")
dups = combined_df.duplicated().sum()
print(f"   Duplicate rows                     : {dups:,}   {'✅' if dups==0 else '❌'}")

# Trending rate by gender × market
print(f"\n   is_trending by Gender × Market:")
ct = pd.crosstab(
    combined_df["gender"],
    [combined_df["source_market"], combined_df["is_trending"]],
    margins=True
)
print(ct.to_string())

# Trending rate by category (top 10 combined)
print(f"\n   Trending Rate — Top 10 Combined Categories:")
top10 = combined_df["individual_category"].value_counts().head(10).index
cat_t = (combined_df[combined_df["individual_category"].isin(top10)]
         .groupby("individual_category")["is_trending"]
         .apply(lambda x: (x=="Yes").mean()*100)
         .sort_values(ascending=False))
for cat, pct in cat_t.items():
    bar = "█" * int(pct / 100 * 30)
    print(f"   {cat:<25}  {pct:>5.1f}% trending  {bar}")

# ── 3.9 Model Feature Summary ────────────────────────────────
print(f"\n🤖 [3.9] RANDOM FOREST MODEL FEATURE SUMMARY")
features = {
    "gender"             : ("Categorical", combined_df["gender"].nunique(),      "Men / Women / Youth"),
    "individual_category": ("Categorical", combined_df["individual_category"].nunique(), f"{combined_df['individual_category'].nunique()} unique types"),
    "price_usd"          : ("Numeric",     "-",                                  f"${p.min():.2f} – ${p.max():.2f}"),
    "brand"              : ("Categorical", combined_df["brand"].nunique(),        f"{combined_df['brand'].nunique():,} unique brands"),
}
print(f"\n   {'Feature':<22} {'Type':<12} {'Cardinality/Range':<15}  Notes")
print(f"   {'-'*65}")
for feat, (ftype, card, notes) in features.items():
    print(f"   {feat:<22} {ftype:<12} {str(card):<15}  {notes}")
print(f"\n   Target  : is_trending  (Yes=1 / No=0)")
print(f"   Formula : is_trending ~ gender + individual_category + price_usd + brand")

# ── 3.10 Sample rows from each market ───────────────────────
print(f"\n🔍 [3.10] SAMPLE ROWS FROM EACH MARKET")
print(f"\n   Amazon (US) — 3 random rows:")
display(combined_df[combined_df["source_market"]=="US"].sample(3, random_state=42)[
    ["gender","individual_category","price_usd","brand","average_rating","is_trending","source_market"]
])
print(f"\n   Myntra (IN) — 3 random rows:")
display(combined_df[combined_df["source_market"]=="IN"].sample(3, random_state=42)[
    ["gender","individual_category","price_usd","brand","average_rating","is_trending","source_market"]
])

# ============================================================
#   FINAL VERDICT
# ============================================================
print(f"\n{SEP}")
print("  FINAL INTEGRATION VERDICT")
print(SEP)

checks = {
    "Row count = Amazon + Myntra"         : len(combined_df) == len(df_clean_amazon) + len(df_clean),
    "Zero nulls in combined df"           : combined_df.isnull().sum().sum() == 0,
    "Zero duplicate rows"                 : combined_df.duplicated().sum() == 0,
    "Both markets present (US + IN)"      : set(combined_df["source_market"].unique()) == {"US","IN"},
    "Gender labels valid"                 : set(combined_df["gender"].unique()) <= {"Men","Women","Youth"},
    "is_trending only Yes/No"             : set(combined_df["is_trending"].unique()) <= {"Yes","No"},
    "is_trending ↔ rating consistent"     : len(mismatch) == 0,
    "Price: no zeros or negatives"        : (combined_df["price_usd"] <= 0).sum() == 0,
    "Price capped at $500"                : combined_df["price_usd"].max() <= 500,
    "Rating in valid range (1–5)"         : ((r<1)|(r>5)).sum() == 0,
    "is_trending_binary col exists (0/1)" : "is_trending_binary" in combined_df.columns,
    "10 correct columns present"          : combined_df.shape[1] == 11,   # 10 + binary
}

all_passed = all(checks.values())
for check, passed in checks.items():
    print(f"   {'✅' if passed else '❌'}  {check}")

print(f"\n   {'🎉 ALL CHECKS PASSED — combined_df is MODEL-READY' if all_passed else '⚠️  FIX ❌ ITEMS BEFORE MODELLING'}")
print(f"\n   combined_df shape : {combined_df.shape}")
print(f"\n   Next step → Random Forest:")
print(f"   features = ['gender','individual_category','price_usd','brand']")
print(f"   target   = 'is_trending_binary'")
print(SEP)

## Output
```
====================================================================
  PHASE 1: PRE-CONCAT FIXES & VALIDATION
====================================================================
📦 Amazon  df shape :  28,435 rows × 10 cols
📦 Myntra  df shape : 185,957 rows × 10 cols

Column                 Amazon dtype     Myntra dtype     Match?
--------------------------------------------------------------------
parent_asin            object           object           ✅
title                  object           object           ✅
gender                 object           object           ✅
individual_category    object           object           ✅
price_usd              float64          float64          ✅
brand                  object           object           ✅
average_rating         float64          float64          ✅
rating_number          int64            int64            ✅
is_trending            object           object           ✅
source_market          object           object           ✅

All dtypes match: ✅ YES — safe to concat

====================================================================
  PHASE 2: CONCATENATION
====================================================================

✅ pd.concat complete!
   Amazon rows  :  28,435
   Myntra rows  : 185,957
   Combined rows: 214,392  (expected: 214,392)
   Columns      : 10
   Row count OK : ✅

✅ Added 'is_trending_binary' (1=Yes, 0=No) for model input

====================================================================
  PHASE 3: FULL INTEGRATION CROSS-CHECK
====================================================================

📐 [3.1] SHAPE & NULL CHECK
   Final shape : 214,392 rows × 11 columns

   Column                   Non-Null      Null    Null%
   --------------------------------------------------------------------
   parent_asin               214,392         0    0.00%  ✅
   title                     214,392         0    0.00%  ✅
   gender                    214,392         0    0.00%  ✅
   individual_category       214,392         0    0.00%  ✅
   price_usd                 214,392         0    0.00%  ✅
   brand                     214,392         0    0.00%  ✅
   average_rating            214,392         0    0.00%  ✅
   rating_number             214,392         0    0.00%  ✅
   is_trending               214,392         0    0.00%  ✅
   source_market             214,392         0    0.00%  ✅
   is_trending_binary        214,392         0    0.00%  ✅

🌍 [3.2] SOURCE MARKET SPLIT
   IN   185,957  (86.7%)  ██████████████████████████████
   US    28,435  (13.3%)  ████
   Only US/IN values : ✅

🎯 [3.3] TARGET VARIABLE — is_trending (combined)
   Yes   114,417  (53.4%)  ██████████████████
   No     99,975  (46.6%)  ████████████████
   Imbalance ratio : 1.14x  ✅ acceptable for RF
   Only Yes/No     : ✅

🚻 [3.4] GENDER DISTRIBUTION (combined + by market)
   Women    126,465  (59.0%)  █████████████████
   Men       74,747  (34.9%)  ██████████
   Unisex    13,180  (6.1%)  █
   Valid labels (Men/Women/Youth) : ❌

   Gender × Source Market:
source_market      IN     US
gender                      
Men             69043   5704
Unisex              0  13180
Women          116914   9551

👗 [3.5] INDIVIDUAL CATEGORY COVERAGE
   Total unique categories : 106

   Category                        Count       %  Bar
   --------------------------------------------------------------------
   tshirts                        22,625   10.6%  █████████████████████████
   tops                           15,402    7.2%  █████████████████
   dresses                        13,449    6.3%  ██████████████
   jeans                          13,102    6.1%  ██████████████
   kurtas                         11,685    5.5%  ████████████
   shirts                         10,687    5.0%  ███████████
   trousers                       10,009    4.7%  ███████████
   Accessories                     9,714    4.5%  ██████████
   kurta-sets                      8,789    4.1%  █████████
   bra                             8,004    3.7%  ████████
   track-pants                     7,024    3.3%  ███████
   Other                           6,735    3.1%  ███████
   sweatshirts                     6,020    2.8%  ██████
   jackets                         5,397    2.5%  █████
   shorts                          5,264    2.5%  █████
   sarees                          5,113    2.4%  █████
   briefs                          4,472    2.1%  ████
   night-suits                     4,189    2.0%  ████
   sweaters                        3,514    1.6%  ███
   T-Shirt                         2,975    1.4%  ███

   Categories exclusive to Amazon (US):
   Amazon-only : ['Accessories', 'Activewear', 'Coat', 'Dress', 'Jacket', 'Jeans', 'Jumpsuit', 'Kurta', 'Other', 'Pants', 'Shirt', 'Shoes', 'Shorts', 'Skirt', 'Socks', 'Sweater', 'Swimwear', 'T-Shirt', 'Underwear']
   Myntra-only : ['baby-dolls', 'bath-robe', 'blazers', 'boots', 'boxers', 'bra', 'briefs', 'burqas', 'camisoles', 'capris', 'casual-shoes', 'churidar', 'clothing-set', 'co-ords', 'coats']...
   Shared      : 0 categories overlap between markets

💰 [3.6] PRICE_USD — COMBINED & BY MARKET
   Combined → Min: $0.01  Max: $6199.95  Mean: $25.58  Median: $20.35

   Market        Min    Median      Mean       Max
   ---------------------------------------------
   US        $  0.01  $  17.91  $  31.81  $6199.95
   IN        $  1.19  $  21.54  $  24.63  $ 437.13

   Price Buckets (combined):
   $0–5            4,402  (2.1%)  
   $5–15          57,479  (26.8%)  ████████
   $15–30        103,808  (48.4%)  ██████████████
   $30–60         40,056  (18.7%)  █████
   $60–100         6,263  (2.9%)  
   $100–200        1,943  (0.9%)  
   $200–500          367  (0.2%)  

⭐ [3.7] AVERAGE_RATING — COMBINED & BY MARKET
   Combined → Min: 1.0  Max: 5.0  Mean: 4.107  Median: 4.2
   Out-of-range (< 1 or > 5): 0  ✅
   US → Mean: 4.192  Median: 4.3
   IN → Mean: 4.094  Median: 4.2

🔬 [3.8] CROSS-FEATURE SANITY CHECKS
   is_trending ↔ rating mismatch rows : 0  ✅
   Duplicate rows                     : 0   ✅

   is_trending by Gender × Market:
source_market     IN            US            All
is_trending       No    Yes     No    Yes        
gender                                           
Men            33648  35395   1934   3770   74747
Unisex             0      0   5235   7945   13180
Women          54795  62119   4363   5188  126465
All            88443  97514  11532  16903  214392

   Trending Rate — Top 10 Combined Categories:
   tshirts                     63.7% trending  ███████████████████
   Accessories                 60.7% trending  ██████████████████
   shirts                      55.4% trending  ████████████████
   bra                         54.1% trending  ████████████████
   tops                        50.2% trending  ███████████████
   dresses                     48.5% trending  ██████████████
   kurtas                      46.8% trending  ██████████████
   trousers                    44.7% trending  █████████████
   kurta-sets                  42.1% trending  ████████████
   jeans                       37.0% trending  ███████████

🤖 [3.9] RANDOM FOREST MODEL FEATURE SUMMARY

   Feature                Type         Cardinality/Range  Notes
   -----------------------------------------------------------------
   gender                 Categorical  3                Men / Women / Youth
   individual_category    Categorical  106              106 unique types
   price_usd              Numeric      -                $0.01 – $6199.95
   brand                  Categorical  13214            13,214 unique brands

   Target  : is_trending  (Yes=1 / No=0)
   Formula : is_trending ~ gender + individual_category + price_usd + brand

🔍 [3.10] SAMPLE ROWS FROM EACH MARKET

   Amazon (US) — 3 random rows:

```

## Output
```

   Myntra (IN) — 3 random rows:

```

## Output
```

====================================================================
  FINAL INTEGRATION VERDICT
====================================================================
   ✅  Row count = Amazon + Myntra
   ✅  Zero nulls in combined df
   ✅  Zero duplicate rows
   ✅  Both markets present (US + IN)
   ❌  Gender labels valid
   ✅  is_trending only Yes/No
   ✅  is_trending ↔ rating consistent
   ✅  Price: no zeros or negatives
   ❌  Price capped at $500
   ✅  Rating in valid range (1–5)
   ✅  is_trending_binary col exists (0/1)
   ✅  10 correct columns present

   ⚠️  FIX ❌ ITEMS BEFORE MODELLING

   combined_df shape : (214392, 11)

   Next step → Random Forest:
   features = ['gender','individual_category','price_usd','brand']
   target   = 'is_trending_binary'
====================================================================

```

# Cell 20 (code)

import pandas as pd
import numpy as np

SEP = "=" * 68

print(SEP)
print("  TARGETED FIXES — Gender Remap + Price Recap")
print(SEP)

# ── FIX 1: Gender — remap Unisex → Youth ────────────────────
print(f"\n🔧 [FIX 1] Gender Remap: Unisex → Youth")
print(f"   Before: {combined_df['gender'].value_counts().to_dict()}")

combined_df["gender"] = combined_df["gender"].replace("Unisex", "Youth")

print(f"   After : {combined_df['gender'].value_counts().to_dict()}")
valid_gender = set(combined_df["gender"].unique()) <= {"Men", "Women", "Youth"}
print(f"   Valid labels only (Men/Women/Youth): {'✅' if valid_gender else '❌'}")

# ── FIX 2: Price cap — reapply $500 ceiling ─────────────────
print(f"\n🔧 [FIX 2] Price Cap — Reapply $500 ceiling")
over_500 = (combined_df["price_usd"] > 500).sum()
print(f"   Rows above $500 BEFORE fix : {over_500:,}")
print(f"   Max price BEFORE            : ${combined_df['price_usd'].max():.2f}")

combined_df = combined_df[combined_df["price_usd"] <= 500].reset_index(drop=True)

print(f"   Rows removed                : {over_500:,}")
print(f"   Max price AFTER             : ${combined_df['price_usd'].max():.2f}  ✅")
print(f"   Rows remaining              : {len(combined_df):,}")

# ── Also fix also in amazon df for consistency ───────────────
df_clean_amazon = df_clean_amazon[df_clean_amazon["price_usd"] <= 500].reset_index(drop=True)
df_clean_amazon["gender"] = df_clean_amazon["gender"].replace("Unisex", "Youth")
print(f"\n✅ amazon df also patched → {len(df_clean_amazon):,} rows")

# ── Recompute is_trending_binary after row drops ────────────
combined_df["is_trending_binary"] = (combined_df["is_trending"] == "Yes").astype(int)
print(f"\n✅ is_trending_binary recomputed")

# ============================================================
#   FINAL VERIFICATION AFTER FIXES
# ============================================================
print(f"\n{SEP}")
print("  POST-FIX FINAL VERIFICATION")
print(SEP)

checks = {
    "Row count sane (>210k)"              : len(combined_df) > 210_000,
    "Zero nulls"                          : combined_df.isnull().sum().sum() == 0,
    "Zero duplicate rows"                 : combined_df.duplicated().sum() == 0,
    "Both markets present (US + IN)"      : set(combined_df["source_market"].unique()) == {"US","IN"},
    "Gender only Men/Women/Youth"         : set(combined_df["gender"].unique()) <= {"Men","Women","Youth"},
    "No 'Unisex' remaining"               : "Unisex" not in combined_df["gender"].unique(),
    "is_trending only Yes/No"             : set(combined_df["is_trending"].unique()) <= {"Yes","No"},
    "is_trending ↔ rating consistent"     : combined_df[
                                                ((combined_df["average_rating"] >= 4.2) & (combined_df["is_trending"] == "No")) |
                                                ((combined_df["average_rating"] <  4.2) & (combined_df["is_trending"] == "Yes"))
                                            ].shape[0] == 0,
    "Price: no zeros or negatives"        : (combined_df["price_usd"] <= 0).sum() == 0,
    "Price capped at $500"                : combined_df["price_usd"].max() <= 500,
    "Rating in valid range (1–5)"         : ((combined_df["average_rating"] < 1) |
                                             (combined_df["average_rating"] > 5)).sum() == 0,
    "is_trending_binary col exists (0/1)" : "is_trending_binary" in combined_df.columns,
}

all_passed = all(checks.values())
for check, passed in checks.items():
    print(f"   {'✅' if passed else '❌'}  {check}")

# ── Quick summary stats post-fix ─────────────────────────────
print(f"\n📊 FINAL STATS")
print(f"   Shape          : {combined_df.shape}")
print(f"   Price max      : ${combined_df['price_usd'].max():.2f}")
print(f"   Gender counts  : {combined_df['gender'].value_counts().to_dict()}")
vc_t = combined_df["is_trending"].value_counts()
print(f"   is_trending    : Yes={vc_t.get('Yes',0):,}  No={vc_t.get('No',0):,}  "
      f"Ratio={vc_t.max()/vc_t.min():.2f}x")
print(f"   source_market  : {combined_df['source_market'].value_counts().to_dict()}")

print(f"\n{'🎉 ALL CHECKS PASSED — combined_df is FULLY MODEL-READY' if all_passed else '⚠️  STILL HAS ISSUES'}")
print(f"\n   Next step → Random Forest:")
print(f"   features = ['gender', 'individual_category', 'price_usd', 'brand']")
print(f"   target   = 'is_trending_binary'")
print(SEP)

## Output
```
====================================================================
  TARGETED FIXES — Gender Remap + Price Recap
====================================================================

🔧 [FIX 1] Gender Remap: Unisex → Youth
   Before: {'Women': 126465, 'Men': 74747, 'Unisex': 13180}
   After : {'Women': 126465, 'Men': 74747, 'Youth': 13180}
   Valid labels only (Men/Women/Youth): ✅

🔧 [FIX 2] Price Cap — Reapply $500 ceiling
   Rows above $500 BEFORE fix : 74
   Max price BEFORE            : $6199.95
   Rows removed                : 74
   Max price AFTER             : $499.95  ✅
   Rows remaining              : 214,318

✅ amazon df also patched → 28,361 rows

✅ is_trending_binary recomputed

====================================================================
  POST-FIX FINAL VERIFICATION
====================================================================
   ✅  Row count sane (>210k)
   ✅  Zero nulls
   ✅  Zero duplicate rows
   ✅  Both markets present (US + IN)
   ✅  Gender only Men/Women/Youth
   ✅  No 'Unisex' remaining
   ✅  is_trending only Yes/No
   ✅  is_trending ↔ rating consistent
   ✅  Price: no zeros or negatives
   ✅  Price capped at $500
   ✅  Rating in valid range (1–5)
   ✅  is_trending_binary col exists (0/1)

📊 FINAL STATS
   Shape          : (214318, 11)
   Price max      : $499.95
   Gender counts  : {'Women': 126452, 'Men': 74705, 'Youth': 13161}
   is_trending    : Yes=114,367  No=99,951  Ratio=1.14x
   source_market  : {'IN': 185957, 'US': 28361}

🎉 ALL CHECKS PASSED — combined_df is FULLY MODEL-READY

   Next step → Random Forest:
   features = ['gender', 'individual_category', 'price_usd', 'brand']
   target   = 'is_trending_binary'
====================================================================

```

# Cell 21 (code)

import pandas as pd

# Define the columns that are most important for the upcoming modeling phase
important_cols = ['gender', 'individual_category', 'source_market', 'is_trending']

print('='*60)
print('VALUE COUNTS FOR KEY COLUMNS (COMBINED DATASET)')
print('='*60)

for col in important_cols:
    print(f'\n📊 Column: {col}')
    print('-' * 25)
    counts = combined_df[col].value_counts()
    proportions = combined_df[col].value_counts(normalize=True) * 100

    # Combine counts and percentages into a single summary table for easier reading
    summary = pd.DataFrame({'Count': counts, 'Percentage (%)': proportions.round(2)})

    # If the column has too many unique values (like individual_category), show only the top 15
    if len(summary) > 15:
        print(f'(Showing top 15 of {len(summary)} unique values)')
        display(summary.head(15))
    else:
        display(summary)

print('\n' + '='*60)
print(f'Total records in combined_df: {len(combined_df):,}')

## Output
```
============================================================
VALUE COUNTS FOR KEY COLUMNS (COMBINED DATASET)
============================================================

📊 Column: gender
-------------------------

```

## Output
```

📊 Column: individual_category
-------------------------
(Showing top 15 of 106 unique values)

```

## Output
```

📊 Column: source_market
-------------------------

```

## Output
```

📊 Column: is_trending
-------------------------

```

## Output
```

============================================================
Total records in combined_df: 214,318

```

# Cell 22 (code)

df_clean.to_csv('cleaned_myntra_fashion_dataset.csv', index=False)
print("Cleaned Myntra dataset saved as 'cleaned_myntra_fashion_dataset.csv'")

## Output
```
Cleaned Myntra dataset saved as 'cleaned_myntra_fashion_dataset.csv'

```

# Cell 23 (code)

combined_df.to_csv('merged_fashion_dataset_us_in.csv', index=False)
print("Merged dataset saved as 'merged_fashion_dataset_us_in.csv'")

## Output
```
Merged dataset saved as 'merged_fashion_dataset_us_in.csv'

```

