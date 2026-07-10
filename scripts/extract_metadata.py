"""
Extract dataset metadata to JSON for the UI dropdowns and inference.
Run: python scripts/extract_metadata.py
"""

import pandas as pd
import json
from pathlib import Path

CSV_PATH = (
    Path(__file__).resolve().parent.parent
    / "dataset"
    / "merged_fashion_dataset_us_in.csv"
)
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "data"

df = pd.read_csv(CSV_PATH)

# --- Brands: top 50 by count, with stats ---
brand_stats = (
    df.groupby("brand")
    .agg(
        count=("brand", "size"),
        avg_rating=("average_rating", "mean"),
        avg_rating_count=("rating_number", "mean"),
        trending_rate=("is_trending_binary", "mean"),
    )
    .reset_index()
)

# Apply the same rare-brand grouping as the model (threshold=10)
rare_mask = brand_stats["count"] < 10
brand_stats.loc[rare_mask, "brand"] = "Other"

# Re-aggregate after grouping
brand_stats = (
    brand_stats.groupby("brand")
    .agg(
        count=("count", "sum"),
        avg_rating=("avg_rating", "mean"),
        avg_rating_count=("avg_rating_count", "mean"),
        trending_rate=("trending_rate", "mean"),
    )
    .reset_index()
)

brand_stats = brand_stats.sort_values("count", ascending=False)

# Top 50 brands for UI dropdown (exclude "Other" from the list)
brands_for_ui = (
    brand_stats[brand_stats["brand"] != "Other"].head(50).to_dict(orient="records")
)

# "Other" entry
other_row = brand_stats[brand_stats["brand"] == "Other"]
other_stats = (
    other_row.iloc[0].to_dict()
    if len(other_row) > 0
    else {
        "brand": "Other",
        "count": 0,
        "avg_rating": 4.0,
        "avg_rating_count": 30,
        "trending_rate": 0.53,
    }
)

# Full brand map for inference (all grouped brands)
brand_map = {}
for _, row in brand_stats.iterrows():
    brand_map[row["brand"]] = {
        "avg_rating": round(float(row["avg_rating"]), 3),
        "avg_rating_count": round(float(row["avg_rating_count"]), 1),
        "trending_rate": round(float(row["trending_rate"]), 4),
    }

# --- Categories: all 106 with stats ---
cat_stats = (
    df.groupby("individual_category")
    .agg(
        count=("individual_category", "size"),
        avg_rating=("average_rating", "mean"),
        avg_rating_count=("rating_number", "mean"),
        trending_rate=("is_trending_binary", "mean"),
    )
    .reset_index()
    .sort_values("count", ascending=False)
)

categories_for_ui = []
for _, row in cat_stats.iterrows():
    categories_for_ui.append(
        {
            "value": row["individual_category"],
            "label": row["individual_category"].replace("-", " ").title(),
            "count": int(row["count"]),
            "trendingRate": round(float(row["trending_rate"]) * 100, 1),
        }
    )

# --- Write outputs ---
OUT_DIR.mkdir(parents=True, exist_ok=True)

with open(OUT_DIR / "brands.json", "w") as f:
    json.dump(
        {
            "brands": brands_for_ui,
            "other": {
                "brand": "Other",
                "avg_rating": round(float(other_stats["avg_rating"]), 3),
                "avg_rating_count": round(float(other_stats["avg_rating_count"]), 1),
                "trendingRate": round(float(other_stats["trending_rate"]) * 100, 1),
            },
            "brandMap": brand_map,
        },
        f,
        indent=2,
    )

with open(OUT_DIR / "categories.json", "w") as f:
    json.dump({"categories": categories_for_ui}, f, indent=2)

print(f"Extracted {len(brands_for_ui)} brands + Other")
print(f"Extracted {len(categories_for_ui)} categories")
print(f"Brand map entries: {len(brand_map)}")
print(f"Output: {OUT_DIR}")
