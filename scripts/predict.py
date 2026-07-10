"""
Fashion Trend Prediction — Inference Script
============================================
Reads JSON from stdin, loads the trained pipeline, and outputs prediction JSON to stdout.

Usage:
    echo '{"title":"Nike Running Shoes","price":89.99,"category":"tshirts","gender":"Women","market":"IN","brand":"Nike"}' | python scripts/predict.py
"""

import sys
import json
import re
import numpy as np
import pandas as pd
import joblib
from pathlib import Path

MODEL_PATH = (
    Path(__file__).resolve().parent.parent / "graphs" / "model_realistic.joblib"
)
BRAND_MAP_PATH = (
    Path(__file__).resolve().parent.parent / "public" / "data" / "brands.json"
)


def load_brand_map():
    with open(BRAND_MAP_PATH) as f:
        data = json.load(f)
    return data.get("brandMap", {})


def extract_title_features(title: str) -> dict:
    title_lower = str(title).lower()
    return {
        "title_length": len(str(title)),
        "title_word_count": len(str(title).split()),
        "kw_women": int(bool(re.search(r"women|woman|ladies", title_lower))),
        "kw_men": int(bool(re.search(r"\bmen\b|\bman\b|male", title_lower))),
        "kw_kids": int(bool(re.search(r"kids|children|boy|girl|youth", title_lower))),
    }


def main():
    try:
        raw = sys.stdin.read()
        data = json.loads(raw)
    except (json.JSONDecodeError, Exception) as e:
        print(json.dumps({"error": f"Invalid input: {e}"}))
        sys.exit(1)

    title = data.get("title", "")
    price = float(data.get("price", 25.0))
    category = data.get("category", "tshirts")
    gender = data.get("gender", "Women")
    market = data.get("market", "IN")
    brand = data.get("brand", "Other")

    title_feats = extract_title_features(title)

    # Look up brand stats for log_rating_count proxy
    brand_map = load_brand_map()
    brand_key = brand if brand in brand_map else "Other"
    brand_stats = brand_map.get(
        brand_key,
        {
            "avg_rating": 4.0,
            "avg_rating_count": 30.0,
        },
    )

    # Use brand's historical avg review count as proxy for listing maturity
    avg_rating_count = max(1.0, brand_stats["avg_rating_count"])
    log_rating_count = float(np.log1p(avg_rating_count))

    input_row = {
        "price_usd": price,
        "log_price": float(np.log1p(price)),
        "log_rating_count": log_rating_count,
        "title_length": title_feats["title_length"],
        "title_word_count": title_feats["title_word_count"],
        "kw_women": title_feats["kw_women"],
        "kw_men": title_feats["kw_men"],
        "kw_kids": title_feats["kw_kids"],
        "gender": gender,
        "source_market": market,
        "individual_category": category,
        "brand_grouped": brand_key,
    }

    try:
        pipeline = joblib.load(MODEL_PATH)
    except Exception as e:
        print(json.dumps({"error": f"Model load failed: {e}"}))
        sys.exit(1)

    X = pd.DataFrame([input_row])

    try:
        proba = pipeline.predict_proba(X)[0]
        pred = int(pipeline.predict(X)[0])
    except Exception as e:
        print(json.dumps({"error": f"Prediction failed: {e}"}))
        sys.exit(1)

    trending_prob = float(proba[1])
    confidence = round(trending_prob * 100, 1)

    result = {
        "confidence": confidence,
        "prediction": pred,
        "predictionLabel": "Trending" if pred == 1 else "Not Trending",
        "trendingProbability": round(trending_prob, 4),
        "notTrendingProbability": round(float(proba[0]), 4),
        "inputs": {
            "title": title,
            "price": price,
            "category": category,
            "gender": gender,
            "market": market,
            "brand": brand_key,
            "logRatingCount": round(log_rating_count, 3),
        },
    }

    print(json.dumps(result))


if __name__ == "__main__":
    main()
