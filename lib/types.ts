export interface PredictionFilters {
  product: string;
  category: string;
  priceRange: number;
  budgetCategory: string;
  brand: string;
  styleType: string;
  season: string;
}

export interface PredictionInsight {
  icon: string;
  text: string;
}

export interface PredictionResult {
  confidence: number;
  demand: number;
  trendDirection: "Rising" | "Stable" | "Declining";
  popularityLabel: "Viral" | "Rising" | "Stable" | "Peaking";
  audienceLabel: string;
  audienceTags: string[];
  trendScore: number;
  insights: PredictionInsight[];
  peakMonth: string;
  chartData: number[];
  styleKeywords: string[];
}

export interface GenderCategory {
  id: "female" | "male";
  label: string;
  tagline: string;
  iconName: string;
  colorClass: string;
  items: string[];
}

export const GENDER_CATEGORIES: GenderCategory[] = [
  {
    id: "female",
    label: "Female Fashion",
    tagline: "Explore feminine & fluid styles",
    iconName: "heart",
    colorClass: "pink",
    items: [
      "Dresses",
      "Skirts",
      "Jeans",
      "Shirts",
      "Hoodies",
      "Jackets",
      "Sneakers",
      "Accessories",
      "High Heels",
    ],
  },
  {
    id: "male",
    label: "Male Fashion",
    tagline: "Discover masculine & modern styles",
    iconName: "zap",
    colorClass: "sage",
    items: [
      "Jeans",
      "Shirts",
      "Hoodies",
      "Jackets",
      "Sneakers",
      "T-Shirts",
      "Shorts",
      "Accessories",
    ],
  },
];

export const PRODUCT_ICON_MAP: Record<string, string> = {
  Dresses: "shirt",
  Skirts: "scissors",
  Jeans: "scissors",
  Shirts: "shirt",
  Hoodies: "shirt",
  Jackets: "shirt",
  Sneakers: "footprints",
  Accessories: "shopping-bag",
  "High Heels": "footprints",
  "T-Shirts": "shirt",
  Shorts: "scissors",
};

export const PREDICT_CATEGORIES = [
  {
    id: "fashion-trends",
    iconName: "trending-up",
    label: "Fashion Trends",
    description: "Upcoming style movements & micro-trends",
  },
  {
    id: "clothing-demand",
    iconName: "package",
    label: "Clothing Demand",
    description: "Market demand & inventory forecasting",
  },
  {
    id: "gender-inclusive",
    iconName: "users",
    label: "Gender-Inclusive",
    description: "Fluid & inclusive fashion predictions",
  },
  {
    id: "popular-products",
    iconName: "star",
    label: "Popular Products",
    description: "Most wanted items right now",
  },
  {
    id: "price-trends",
    iconName: "gem",
    label: "Price Trends",
    description: "Smart pricing & value predictions",
  },
];