"use client";

import { useMemo, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  TrendingUp, Minus, TrendingDown, BarChart2, Eye,
  ShoppingBag, User, Sparkles, ArrowUpRight,
} from "lucide-react";
import { usePredictionStore } from "@/lib/hooks";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AUDIENCE_PRESETS = [
  {
    label: "Gen Z & Millennials",
    tags: ["Ages 18–34", "Streetwear Lovers", "Trend Setters", "Social Media Active"],
  },
  {
    label: "Fashion Enthusiasts",
    tags: ["Ages 20–40", "Style Conscious", "Brand Loyal", "Early Adopters"],
  },
  {
    label: "Young Professionals",
    tags: ["Ages 25–40", "Urban Dwellers", "Quality Seekers", "Minimalists"],
  },
];

const MARQUEE_ITEMS = [
  "🔮 Trend Analysis Complete",
  "✨ Pattern Recognition Active",
  "📊 Market Intelligence",
  "🎯 Precision Forecasting",
  "💡 Style Intelligence",
  "🚀 AI Powered Insights",
  "👑 Fashion Forward",
  "⚡ Real-Time Data",
];

// SVG radial progress ring
function RadialRing({
  value,
  max = 100,
  color,
  size = 130,
  strokeWidth = 8,
  label,
  suffix = "%",
}: {
  value: number;
  max?: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
  suffix?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = value / max;
  const ref = useRef<SVGCircleElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!ref.current || !isInView) return;
    const el = ref.current;
    el.style.strokeDashoffset = String(circ);
    const target = circ * (1 - pct);
    gsap.to(el, {
      strokeDashoffset: target,
      duration: 1.6,
      ease: "power3.out",
      delay: 0.2,
    });
  }, [isInView, circ, pct]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2">
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(0,0,0,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            ref={ref}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circ}
            strokeDashoffset={circ}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        {/* Center value */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.span
            className="font-display font-bold text-gray-900"
            style={{ fontSize: 26, lineHeight: 1, letterSpacing: "-0.02em" }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {value}
            <span style={{ fontSize: 14, color: "#a3a3a3", fontWeight: 500 }}>{suffix}</span>
          </motion.span>
          {label && (
            <span className="font-body" style={{ fontSize: 10, color: "#a3a3a3", marginTop: 2 }}>
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Animated wave chart
function WaveChart({ data, color }: { data: number[]; color: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  return (
    <div
      ref={containerRef}
      className="flex items-end gap-1.5"
      style={{ height: 72, marginTop: 16 }}
    >
      {data.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-md"
          style={{
            minWidth: 10,
            background:
              i === data.indexOf(Math.max(...data))
                ? `linear-gradient(to top, ${color}, ${color}cc)`
                : `${color}30`,
            borderRadius: "4px 4px 2px 2px",
            transformOrigin: "bottom",
            boxShadow:
              i === data.indexOf(Math.max(...data))
                ? `0 4px 16px ${color}40`
                : "none",
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={
            isInView
              ? { scaleY: h / 100, opacity: 1 }
              : { scaleY: 0, opacity: 0 }
          }
          transition={{
            delay: i * 0.08,
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
    </div>
  );
}

export default function ResultsPanel() {
  const { result, isLoading } = usePredictionStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const audience = useMemo(() => {
    if (result?.audienceLabel) {
      return { label: result.audienceLabel, tags: result.audienceTags };
    }
    return AUDIENCE_PRESETS[0];
  }, [result]);

  useEffect(() => {
    if (result && panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, [result]);

  if (isLoading || !result) return null;

  const trendConfig = {
    Rising: { color: "#5a8c42", bg: "rgba(90,140,66,0.10)", label: "↑ Rising Trend", Icon: TrendingUp },
    Declining: { color: "#ef4444", bg: "rgba(239,68,68,0.10)", label: "↓ Declining", Icon: TrendingDown },
    Stable: { color: "#e84a86", bg: "rgba(232,74,134,0.10)", label: "→ Stable Trend", Icon: Minus },
  };
  const tc = trendConfig[result.trendDirection];

  const cards = [
    {
      id: "confidence",
      title: "Trend Confidence",
      Icon: BarChart2,
      iconBg: "rgba(244,114,160,0.12)",
      iconColor: "#e84a86",
      content: (
        <div className="flex flex-col items-center pt-2">
          <RadialRing value={result.confidence} color="#e84a86" label="confidence" />
          <div className="mt-4 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 font-body font-semibold rounded-full"
              style={{
                padding: "5px 14px",
                fontSize: 12,
                background: tc.bg,
                color: tc.color,
              }}
            >
              <tc.Icon size={13} />
              {tc.label}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "demand",
      title: "Demand Score",
      Icon: ShoppingBag,
      iconBg: "rgba(122,170,92,0.12)",
      iconColor: "#5a8c42",
      content: (
        <div className="flex flex-col items-center pt-2">
          <RadialRing
            value={result.demand}
            color="#5a8c42"
            label="demand"
            suffix="/100"
          />
          <div className="w-full mt-4">
            <div
              className="w-full overflow-hidden"
              style={{ height: 5, borderRadius: 99, background: "rgba(0,0,0,0.05)" }}
            >
              <motion.div
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background: "linear-gradient(to right, #a4c88a, #5a8c42)",
                }}
                initial={{ width: 0 }}
                whileInView={{ width: `${result.demand}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span style={{ fontSize: 10, color: "#a3a3a3" }}>Low</span>
              <span style={{ fontSize: 10, color: "#a3a3a3" }}>High</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "popularity",
      title: "Popularity Forecast",
      Icon: Eye,
      iconBg: "rgba(255,176,204,0.15)",
      iconColor: "#f472a0",
      content: (
        <>
          <div className="flex items-baseline gap-2 mt-2">
            <p
              className="font-display font-bold text-gray-900"
              style={{ fontSize: 30, letterSpacing: "-0.02em" }}
            >
              {result.popularityLabel}
            </p>
            <ArrowUpRight size={16} className="text-pink-400" />
          </div>
          <WaveChart data={result.chartData} color="#e84a86" />
          <div className="flex justify-between mt-1">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].slice(0, result.chartData.length).map(
              (m, i) => (
                <span key={i} style={{ fontSize: 9, color: "#a3a3a3" }}>
                  {m}
                </span>
              )
            )}
          </div>
        </>
      ),
    },
    {
      id: "audience",
      title: "Target Audience",
      Icon: User,
      iconBg: "rgba(168,237,234,0.15)",
      iconColor: "#5bb5b0",
      content: (
        <>
          <p
            className="font-display font-bold text-gray-900 mt-2"
            style={{ fontSize: 20, letterSpacing: "-0.01em", lineHeight: 1.3 }}
          >
            {audience.label}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {audience.tags.map((tag: string, i: number) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="font-body font-medium rounded-full"
                style={{
                  padding: "5px 13px",
                  fontSize: 12,
                  background:
                    i % 2 === 0
                      ? "rgba(244,114,160,0.12)"
                      : "rgba(122,170,92,0.12)",
                  color: i % 2 === 0 ? "#cc2e6e" : "#5a8c42",
                  border:
                    i % 2 === 0
                      ? "1px solid rgba(244,114,160,0.25)"
                      : "1px solid rgba(122,170,92,0.22)",
                }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </>
      ),
    },
  ];

  return (
    <section
      ref={panelRef}
      className="relative max-w-[1200px] mx-auto px-4 md:px-10 pb-16 md:pb-[100px]"
    >
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "linear-gradient(135deg, #fde8f0, #ffc8d9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={20} style={{ color: "#e84a86" }} />
            </div>
          </div>
          <h3
            className="font-display font-bold text-gray-900"
            style={{ fontSize: 32, letterSpacing: "-0.02em", fontStyle: "italic" }}
          >
            Prediction Results
          </h3>
          <p className="text-gray-400 font-body mt-2" style={{ fontSize: 14 }}>
            AI-powered fashion intelligence insights for{" "}
            <strong className="text-gray-600">{result.peakMonth}</strong>
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card"
              style={{ padding: "28px 28px", borderRadius: 22 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-600 font-body font-semibold" style={{ fontSize: 13 }}>
                  {card.title}
                </h4>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: card.iconBg,
                    color: card.iconColor,
                  }}
                >
                  <card.Icon size={16} />
                </div>
              </div>
              {card.content}
            </motion.div>
          ))}
        </div>

        {/* Style Keywords */}
        {result.styleKeywords && result.styleKeywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="glass-card mb-6"
            style={{ padding: "24px 28px", borderRadius: 22 }}
          >
            <p className="font-body font-semibold text-gray-600 mb-3" style={{ fontSize: 13 }}>
              Style Keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {result.styleKeywords.map((kw: string, i: number) => (
                <motion.span
                  key={kw}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.06 }}
                  className="font-body font-semibold"
                  style={{
                    padding: "6px 16px",
                    fontSize: 13,
                    borderRadius: 99,
                    background: "linear-gradient(135deg, rgba(244,114,160,0.12), rgba(232,74,134,0.08))",
                    color: "#cc2e6e",
                    border: "1px solid rgba(244,114,160,0.25)",
                  }}
                >
                  {kw}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Marquee insight ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="overflow-hidden"
          style={{
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(244,114,160,0.08), rgba(232,74,134,0.05))",
            border: "1px solid rgba(244,114,160,0.18)",
            padding: "12px 0",
          }}
        >
          <div className="marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span
                key={i}
                className="font-body font-medium inline-flex items-center gap-2"
                style={{
                  fontSize: 12,
                  color: "#cc2e6e",
                  padding: "0 32px",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.04em",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
