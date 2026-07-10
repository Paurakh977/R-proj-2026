"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Zap, Shirt, DollarSign, Tag, User, Globe } from "lucide-react";
import { usePredictionStore } from "@/lib/hooks";

export default function PredictionPanel() {
  const { filters, isLoading, runPrediction } = usePredictionStore();
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  let rippleId = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId.current;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
    runPrediction();
  };

  const iconMap: Record<string, React.ReactNode> = {
    Title: <Shirt size={14} strokeWidth={1.5} />,
    Price: <DollarSign size={14} strokeWidth={1.5} />,
    Category: <Tag size={14} strokeWidth={1.5} />,
    Brand: <Sparkles size={14} strokeWidth={1.5} />,
    Gender: <User size={14} strokeWidth={1.5} />,
    Market: <Globe size={14} strokeWidth={1.5} />,
  };

  const summaryItems = [
    { label: "Title", value: filters.title || "—" },
    { label: "Price", value: `$${filters.price.toFixed(2)}` },
    { label: "Category", value: filters.category },
    { label: "Brand", value: filters.brand || "Other" },
    { label: "Gender", value: filters.gender },
    { label: "Market", value: filters.market === "US" ? "United States" : "India" },
  ];

  return (
    <section id="prediction-panel" className="relative py-20 md:py-[110px]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10">
        <div className="max-w-[820px] mx-auto">

          {/* Section header */}
          <div className="text-center mb-14">
            <motion.div
              className="eyebrow flex items-center justify-center gap-2 mb-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="divider-gradient" style={{ flex: 1, maxWidth: 60 }} />
              make your prediction
              <span className="divider-gradient" style={{ flex: 1, maxWidth: 60 }} />
            </motion.div>

            <div className="overflow-hidden">
              <motion.h2
                className="font-display text-gray-900"
                style={{
                  fontSize: "clamp(38px, 5.5vw, 58px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  fontStyle: "italic",
                  fontWeight: 700,
                }}
                initial={{ y: "100%", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                Prediction <span className="gradient-text-pink">Panel</span>
              </motion.h2>
            </div>
          </div>

          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="gradient-border"
            style={{ marginBottom: 32 }}
          >
            <div
              className="glass"
              style={{ padding: "44px 48px", borderRadius: "inherit", position: "relative" }}
            >
              {/* Summary grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
                {summaryItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.5 }}
                    className="relative overflow-hidden"
                    style={{
                      padding: "16px 18px",
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.50)",
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span style={{ color: i % 2 === 0 ? "#e84a86" : "#5a8c42", display: "flex" }}>{iconMap[item.label]}</span>
                      <p
                        className="text-gray-400 uppercase font-body"
                        style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.10em" }}
                      >
                        {item.label}
                      </p>
                    </div>
                    <p
                      className="font-display font-bold text-gray-800"
                      style={{ fontSize: 15, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {item.value}
                    </p>

                    <div
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        height: 2,
                        borderRadius: "0 0 16px 16px",
                        background: i % 2 === 0
                          ? "linear-gradient(to right, rgba(244,114,160,0.40), transparent)"
                          : "linear-gradient(to right, rgba(122,170,92,0.35), transparent)",
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* AI description */}
              <div
                className="flex items-start gap-3 mb-10"
                style={{
                  padding: "16px 20px",
                  borderRadius: 16,
                  background: "rgba(244,114,160,0.06)",
                  border: "1px solid rgba(244,114,160,0.15)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #fde8f0, #ffc8d9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Zap size={15} style={{ color: "#e84a86" }} />
                </div>
                <div>
                  <p className="font-body font-semibold text-gray-700" style={{ fontSize: 13 }}>
                  Model ready to predict
                  </p>
                  <p className="text-gray-400 font-body" style={{ fontSize: 12, marginTop: 2, lineHeight: 1.6 }}>
                    The model analyzes {filters.brand || "brand"} {filters.category} products
                    at ${filters.price.toFixed(2)} price point in {filters.market === "US" ? "US" : "Indian"} market.
                    Brand is the strongest predictor (17% of model signal).
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                ref={btnRef}
                onClick={handleClick}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="relative w-full flex items-center justify-center gap-3 font-body font-semibold text-white overflow-hidden"
                style={{
                  fontSize: 17,
                  padding: "20px 48px",
                  borderRadius: 99,
                  background: isLoading
                    ? "linear-gradient(135deg, #f9a8c9, #f472a0)"
                    : "linear-gradient(135deg, #f472a0 0%, #e84a86 50%, #cc2e6e 100%)",
                  backgroundSize: "200% auto",
                  boxShadow: isLoading
                    ? "0 4px 20px rgba(232,74,134,0.20)"
                    : "0 10px 48px rgba(232,74,134,0.42), 0 4px 16px rgba(0,0,0,0.08)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  letterSpacing: "0.02em",
                  animation: isLoading ? "none" : "shimmer 3s linear infinite",
                }}
              >
                {ripples.map((r) => (
                  <motion.span
                    key={r.id}
                    className="absolute rounded-full bg-white/30 pointer-events-none"
                    style={{ width: 10, height: 10, top: r.y - 5, left: r.x - 5 }}
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 40, opacity: 0 }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                  />
                ))}

                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.span
                      key="loading"
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <Loader2 size={20} className="animate-spin" />
                      Running Model...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="ready"
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <motion.span
                        animate={{ rotate: [0, 20, 0, -20, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Sparkles size={20} />
                      </motion.span>
                      Predict Trend Now
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
