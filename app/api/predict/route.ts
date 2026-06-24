import { NextResponse } from "next/server";

interface PredictRequest {
  product: string;
  category: string;
  priceRange: number;
  budgetCategory: string;
  brand: string;
  styleType: string;
  season: string;
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST(request: Request) {
  const body: PredictRequest = await request.json();

  // Simulate AI processing delay
  await new Promise((r) => setTimeout(r, 1200));

  const confidence = randomBetween(72, 97);
  const demand = randomBetween(78, 98);
  const trendScore = randomBetween(65, 95);

  const trendDirections = ["Rising", "Stable", "Declining"] as const;
  const trendDirection =
    confidence > 85
      ? "Rising"
      : confidence > 70
      ? "Stable"
      : "Declining";

  const popularityLabels = ["Viral", "Rising", "Stable", "Peaking"] as const;
  const popularityLabel =
    confidence > 90
      ? "Viral"
      : confidence > 80
      ? "Rising"
      : confidence > 70
      ? "Stable"
      : "Peaking";

  const audiences = [
    {
      label: "Gen Z & Millennials",
      tags: [
        "Ages 18-34",
        "Streetwear Lovers",
        "Trend Setters",
        "Social Media Active",
      ],
    },
    {
      label: "Fashion Enthusiasts",
      tags: [
        "Ages 20-40",
        "Style Conscious",
        "Brand Loyal",
        "Early Adopters",
      ],
    },
    {
      label: "Young Professionals",
      tags: [
        "Ages 25-40",
        "Urban Dwellers",
        "Quality Seekers",
        "Minimalists",
      ],
    },
  ];
  const audience = audiences[randomBetween(0, 2)];

  const insights = [
    {
      emoji: "📈",
      text: `${body.product} in ${body.category} shows ${trendDirection.toLowerCase()} momentum with a ${confidence}% confidence score.`,
    },
    {
      emoji: "🎯",
      text: `Peak demand expected in ${["Spring", "Summer", "Fall", "Winter"][randomBetween(0, 3)]} ${2026}. Consider early inventory planning.`,
    },
    {
      emoji: "💡",
      text: `${body.brand || "Brand-agnostic"} positioning in the ${body.styleType || "versatile"} segment shows strong market fit.`,
    },
  ];

  const chartData = Array.from({ length: 8 }, () => randomBetween(20, 80));

  return NextResponse.json({
    success: true,
    data: {
      confidence,
      demand,
      trendDirection,
      popularityLabel,
      audienceLabel: audience.label,
      audienceTags: audience.tags,
      trendScore,
      insights,
      peakMonth: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][randomBetween(0, 11)]} 2026`,
      chartData,
      styleKeywords: [body.product, body.category, body.styleType || "general"]
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    },
  });
}
