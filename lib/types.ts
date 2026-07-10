export interface PredictionFilters {
  title: string;
  price: number;
  category: string;
  gender: string;
  market: string;
  brand: string;
}

export interface PredictionResult {
  confidence: number;
  prediction: number;
  predictionLabel: string;
  trendingProbability: number;
  notTrendingProbability: number;
  inputs: {
    title: string;
    price: number;
    category: string;
    gender: string;
    market: string;
    brand: string;
    logRatingCount: number;
  };
}

export interface BrandData {
  brand: string;
  count: number;
  avgRating: number;
  avgRatingCount: number;
  trendingRate: number;
}

export interface BrandMapEntry {
  avg_rating: number;
  avg_rating_count: number;
  trending_rate: number;
}

export interface CategoryData {
  value: string;
  label: string;
  count: number;
  trendingRate: number;
}
