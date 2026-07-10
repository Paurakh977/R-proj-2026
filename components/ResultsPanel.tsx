"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Info, ArrowRight } from "lucide-react";
import { usePredictionStore } from "@/lib/hooks";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function ProbabilityRing({
  value,
  color = "#e84a86",
  size = 180,
}: {
  value: number;
  color?: string;
  size?: number;
}) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = value / 100;
  const ref = useRef<SVGCircleElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    el.style.strokeDashoffset = String(circ);
    gsap.to(el, {
      strokeDashoffset: circ * (1 - pct),
      duration: 1.8,
      ease: "power3.out",
      delay: 0.3,
    });
  }, [circ, pct]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(0,0,0,0.05)"
          strokeWidth={12}
        />
        <circle
          ref={ref}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeDasharray={circ}
          strokeDashoffset={circ}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
        />
      </svg>
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
        <span
          className="font-display font-bold text-gray-900"
          style={{ fontSize: 42, lineHeight: 1, letterSpacing: "-0.03em" }}
        >
          {value.toFixed(1)}
          <span style={{ fontSize: 20, color: "#a3a3a3", fontWeight: 500 }}>%</span>
        </span>
        <span
          className="font-body"
          style={{ fontSize: 12, color: "#a3a3a3", marginTop: 4 }}
        >
          trending probability
        </span>
      </div>
    </div>
  );
}

export default function ResultsPanel() {
  const { result, isLoading } = usePredictionStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, [result]);

  if (isLoading || !result) return null;

  const isTrending = result.prediction === 1;
  const prob = result.trendingProbability * 100;

  const ringColor = prob > 70 ? "#5a8c42" : prob > 50 ? "#e84a86" : "#a3a3a3";
  const verdictText = prob > 80
    ? "Strong trending potential"
    : prob > 65
    ? "Moderate trending potential"
    : prob > 50
    ? "Marginal trending potential"
    : "Low trending potential";

  return (
    <section
      ref={panelRef}
      className="relative max-w-[1200px] mx-auto px-4 md:px-10 pb-16 md:pb-[100px]"
    >
      <div className="max-w-[700px] mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3
            className="font-display font-bold text-gray-900"
            style={{ fontSize: 32, letterSpacing: "-0.02em", fontStyle: "italic" }}
          >
            Prediction Result
          </h3>
        </motion.div>

        {/* Main result card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card"
          style={{ padding: "40px 36px", borderRadius: 22 }}
        >
          {/* Probability ring */}
          <div className="flex flex-col items-center mb-8">
            <ProbabilityRing value={prob} color={ringColor} />
          </div>

          {/* Verdict */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div
              className="flex items-center gap-2 font-body font-semibold rounded-full"
              style={{
                padding: "8px 20px",
                fontSize: 14,
                background: isTrending ? "rgba(90,140,66,0.12)" : "rgba(163,163,163,0.12)",
                color: isTrending ? "#5a8c42" : "#737373",
                border: isTrending ? "1px solid rgba(90,140,66,0.25)" : "1px solid rgba(163,163,163,0.25)",
              }}
            >
              {isTrending ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {result.predictionLabel}
            </div>
            <p className="font-body text-gray-500 text-center" style={{ fontSize: 14, lineHeight: 1.6 }}>
              {verdictText}. This product has a{" "}
              <strong className="text-gray-700">{prob.toFixed(1)}%</strong> chance
              of achieving trending status (rating ≥ 4.2).
            </p>
          </div>

          {/* Input breakdown */}
          <div
            style={{
              padding: "20px 24px",
              borderRadius: 16,
              background: "rgba(0,0,0,0.02)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Info size={14} className="text-gray-400" />
              <p className="font-body font-semibold text-gray-500" style={{ fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Model Inputs
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Brand", value: result.inputs.brand },
                { label: "Category", value: result.inputs.category },
                { label: "Price", value: `$${result.inputs.price.toFixed(2)}` },
                { label: "Gender", value: result.inputs.gender },
                { label: "Market", value: result.inputs.market === "US" ? "United States" : "India" },
                { label: "Brand Rating", value: `log(${result.inputs.logRatingCount.toFixed(1)})` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center" style={{ padding: "6px 0" }}>
                  <span className="font-body text-gray-400" style={{ fontSize: 12 }}>{item.label}</span>
                  <span className="font-body font-semibold text-gray-700" style={{ fontSize: 13 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div
            className="flex items-start gap-2 mt-6"
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              background: "rgba(244,114,160,0.06)",
              border: "1px solid rgba(244,114,160,0.15)",
            }}
          >
            <ArrowRight size={14} style={{ color: "#e84a86", marginTop: 2, flexShrink: 0 }} />
            <p className="font-body text-gray-500" style={{ fontSize: 12, lineHeight: 1.6 }}>
              This prediction uses listing-time metadata only (brand, category, price, gender, market).
              No review data is used. Model accuracy: AUC 0.72 on test set.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
