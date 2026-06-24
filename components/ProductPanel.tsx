"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCT_ICON_MAP } from "@/lib/types";
import { usePredictionStore } from "@/lib/hooks";
import { Shirt, Scissors, Footprints, ShoppingBag, ChevronRight, ChevronLeft, Check } from "lucide-react";

const ICON_COMPONENTS: Record<string, React.ReactNode> = {
  shirt: <Shirt size={20} />,
  scissors: <Scissors size={20} />,
  footprints: <Footprints size={20} />,
  "shopping-bag": <ShoppingBag size={20} />,
};

const STEPS = [
  { id: 0, label: "Budget", hint: "Price range & tier" },
  { id: 1, label: "Brand", hint: "Your preference" },
  { id: 2, label: "Style", hint: "Aesthetic direction" },
  { id: 3, label: "Season", hint: "When to wear" },
];

const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget Friendly", sub: "Under $50", emoji: "💚" },
  { value: "mid", label: "Mid Range", sub: "$50–$150", emoji: "💛" },
  { value: "premium", label: "Premium", sub: "$150–$400", emoji: "🧡" },
  { value: "luxury", label: "Luxury", sub: "$400+", emoji: "💎" },
];

const BRAND_OPTIONS = [
  { value: "zara", label: "Zara" },
  { value: "hm", label: "H&M" },
  { value: "uniqlo", label: "Uniqlo" },
  { value: "nike", label: "Nike" },
  { value: "gucci", label: "Gucci" },
  { value: "levi", label: "Levi's" },
  { value: "adidas", label: "Adidas" },
  { value: "prada", label: "Prada" },
];

const STYLE_OPTIONS = [
  { value: "casual", label: "Casual", icon: "☁️" },
  { value: "streetwear", label: "Streetwear", icon: "🔥" },
  { value: "formal", label: "Formal", icon: "✨" },
  { value: "athleisure", label: "Athleisure", icon: "⚡" },
  { value: "bohemian", label: "Bohemian", icon: "🌿" },
  { value: "minimalist", label: "Minimalist", icon: "◆" },
  { value: "vintage", label: "Vintage", icon: "🎞️" },
  { value: "luxury", label: "Luxury", icon: "👑" },
];

const SEASON_OPTIONS = [
  { value: "spring", label: "Spring", sub: "Mar–May", icon: "🌸" },
  { value: "summer", label: "Summer", sub: "Jun–Aug", icon: "☀️" },
  { value: "fall", label: "Autumn", sub: "Sep–Nov", icon: "🍂" },
  { value: "winter", label: "Winter", sub: "Dec–Feb", icon: "❄️" },
  { value: "year-round", label: "Year Round", sub: "All seasons", icon: "🌍" },
];

function PillToggle({
  options,
  value,
  onChange,
  columns = 4,
}: {
  options: { value: string; label: string; sub?: string; icon?: string; emoji?: string }[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${Math.min(columns, 2)}, 1fr)` }}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            whileTap={{ scale: 0.97 }}
            className="relative text-left font-body transition-colors duration-300 overflow-hidden"
            style={{
              padding: opt.sub ? "14px 18px" : "12px 18px",
              borderRadius: 16,
              background: isActive
                ? "linear-gradient(135deg, rgba(244,114,160,0.15), rgba(232,74,134,0.10))"
                : "rgba(255,255,255,0.60)",
              border: isActive
                ? "1.5px solid rgba(244,114,160,0.50)"
                : "1px solid rgba(0,0,0,0.07)",
              boxShadow: isActive
                ? "0 4px 20px rgba(232,74,134,0.14)"
                : "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {isActive && (
              <motion.div
                layoutId={`pill-${opt.value}`}
                className="absolute top-2 right-2 flex items-center justify-center"
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#e84a86",
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Check size={10} color="#fff" strokeWidth={3} />
              </motion.div>
            )}

            <div className="flex items-start gap-2.5">
              {(opt.icon || opt.emoji) && (
                <span style={{ fontSize: 18, lineHeight: 1 }}>{opt.icon || opt.emoji}</span>
              )}
              <div>
                <p
                  className="font-semibold"
                  style={{
                    fontSize: 13,
                    color: isActive ? "#cc2e6e" : "#404040",
                    lineHeight: 1.3,
                  }}
                >
                  {opt.label}
                </p>
                {opt.sub && (
                  <p style={{ fontSize: 11, color: "#a3a3a3", marginTop: 2 }}>{opt.sub}</p>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export default function ProductPanel() {
  const { filters, updateFilters } = usePredictionStore();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="font-body font-semibold text-gray-600" style={{ fontSize: 13 }}>
                  Price Range
                </label>
                <span
                  className="font-body font-bold"
                  style={{ fontSize: 15, color: "#e84a86" }}
                >
                  Up to ${filters.priceRange}
                </span>
              </div>
              <div className="relative py-3">
                <input
                  type="range"
                  min={0}
                  max={500}
                  value={filters.priceRange}
                  onChange={(e) => updateFilters({ priceRange: Number(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: "#e84a86" }}
                />
                <div className="flex justify-between mt-2">
                  <span style={{ fontSize: 11, color: "#a3a3a3", fontWeight: 500 }}>$0</span>
                  <span style={{ fontSize: 11, color: "#a3a3a3", fontWeight: 500 }}>$500</span>
                </div>
              </div>
            </div>
            <div>
              <label className="font-body font-semibold text-gray-600 block mb-3" style={{ fontSize: 13 }}>
                Budget Category
              </label>
              <PillToggle
                options={BUDGET_OPTIONS}
                value={filters.budgetCategory}
                onChange={(v) => updateFilters({ budgetCategory: v })}
                columns={4}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <label className="font-body font-semibold text-gray-600 block mb-3" style={{ fontSize: 13 }}>
              Brand Preference
            </label>
            <PillToggle
              options={BRAND_OPTIONS}
              value={filters.brand}
              onChange={(v) => updateFilters({ brand: v })}
              columns={4}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <label className="font-body font-semibold text-gray-600 block mb-3" style={{ fontSize: 13 }}>
              Style Direction
            </label>
            <PillToggle
              options={STYLE_OPTIONS}
              value={filters.styleType}
              onChange={(v) => updateFilters({ styleType: v })}
              columns={4}
            />
          </div>
        );
      case 3:
        return (
          <div>
            <label className="font-body font-semibold text-gray-600 block mb-3" style={{ fontSize: 13 }}>
              Seasonal Preference
            </label>
            <PillToggle
              options={SEASON_OPTIONS}
              value={filters.season}
              onChange={(v) => updateFilters({ season: v })}
              columns={3}
            />
          </div>
        );
    }
  };

  return (
    <section id="product-section" className="relative py-20 md:py-[110px]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10">

        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            className="eyebrow flex items-center justify-center gap-2 mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="divider-gradient" style={{ flex: 1, maxWidth: 60 }} />
            refine your search
            <span className="divider-gradient" style={{ flex: 1, maxWidth: 60 }} />
          </motion.div>

          <div className="overflow-hidden">
            <motion.h2
              className="font-display text-gray-900 mb-4"
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
              Product <span className="gradient-text-pink">Selection</span>
            </motion.h2>
          </div>

          <motion.p
            className="text-gray-400 mx-auto"
            style={{ fontSize: 15, maxWidth: 460, lineHeight: 1.75 }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Configure your prediction parameters for tailored fashion insights.
          </motion.p>
        </div>

        {/* Panel */}
        <motion.div
          className="mx-auto gradient-border"
          style={{ maxWidth: 860 }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="glass"
            style={{ padding: "44px 48px", borderRadius: "inherit", position: "relative", overflow: "hidden" }}
          >
            {/* Header row */}
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
              style={{ paddingBottom: 24, borderBottom: "1px solid rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 15,
                    background: "linear-gradient(135deg, #fde8f0, #ffc8d9)",
                    color: "#e84a86",
                    boxShadow: "0 4px 16px rgba(232,74,134,0.20)",
                  }}
                >
                  {ICON_COMPONENTS[PRODUCT_ICON_MAP[filters.product]] || <ShoppingBag size={20} />}
                </div>
                <div>
                  <h4
                    className="font-display font-bold text-gray-900"
                    style={{ fontSize: 18, letterSpacing: "-0.01em" }}
                  >
                    {filters.product}
                  </h4>
                  <span className="text-gray-400 font-body" style={{ fontSize: 12 }}>
                    {filters.category}
                  </span>
                </div>
              </div>

              <button
                onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}
                className="font-body font-medium text-pink-500 flex items-center gap-1.5"
                style={{
                  fontSize: 13,
                  padding: "8px 20px",
                  borderRadius: 99,
                  background: "rgba(244,114,160,0.10)",
                  border: "1px solid rgba(244,114,160,0.25)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "rgba(244,114,160,0.18)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "rgba(244,114,160,0.10)")
                }
              >
                Change Selection
              </button>
            </div>

            {/* Step progress */}
            <div className="flex items-center gap-2 mb-8">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex-1 flex items-center gap-2">
                  <button
                    onClick={() => goTo(i)}
                    className="flex items-center gap-2 group"
                    style={{ flexShrink: 0 }}
                  >
                    <motion.div
                      animate={{
                        background:
                          i < step
                            ? "linear-gradient(135deg, #f472a0, #e84a86)"
                            : i === step
                            ? "rgba(244,114,160,0.20)"
                            : "rgba(0,0,0,0.05)",
                        border:
                          i === step
                            ? "2px solid #e84a86"
                            : "2px solid transparent",
                        color:
                          i < step ? "#fff" : i === step ? "#e84a86" : "#a3a3a3",
                      }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center font-body font-bold"
                      style={{ width: 28, height: 28, borderRadius: "50%", fontSize: 12 }}
                    >
                      {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
                    </motion.div>
                    <span
                      className="font-body font-medium hidden sm:block"
                      style={{
                        fontSize: 12,
                        color: i === step ? "#e84a86" : i < step ? "#5a8c42" : "#a3a3a3",
                      }}
                    >
                      {s.label}
                    </span>
                  </button>

                  {i < STEPS.length - 1 && (
                    <motion.div
                      className="flex-1"
                      style={{ height: 2, borderRadius: 1 }}
                      animate={{
                        background: i < step
                          ? "linear-gradient(to right, #f472a0, #e84a86)"
                          : "rgba(0,0,0,0.07)",
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            <div style={{ minHeight: 240 }}>
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
              <button
                onClick={() => goTo(Math.max(0, step - 1))}
                disabled={step === 0}
                className="flex items-center gap-2 font-body font-medium"
                style={{
                  fontSize: 14,
                  padding: "10px 22px",
                  borderRadius: 99,
                  background: step === 0 ? "transparent" : "rgba(0,0,0,0.05)",
                  color: step === 0 ? "rgba(0,0,0,0.20)" : "#525252",
                  border: "1px solid rgba(0,0,0,0.06)",
                  cursor: step === 0 ? "not-allowed" : "pointer",
                  transition: "all 0.25s ease",
                }}
              >
                <ChevronLeft size={15} /> Previous
              </button>

              <span className="font-body text-gray-400" style={{ fontSize: 12 }}>
                Step {step + 1} of {STEPS.length}
              </span>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => goTo(step + 1)}
                  className="flex items-center gap-2 font-body font-semibold text-white"
                  style={{
                    fontSize: 14,
                    padding: "10px 24px",
                    borderRadius: 99,
                    background: "linear-gradient(135deg, #f472a0, #e84a86)",
                    boxShadow: "0 4px 16px rgba(232,74,134,0.30)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.boxShadow =
                      "0 8px 28px rgba(232,74,134,0.45)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.boxShadow =
                      "0 4px 16px rgba(232,74,134,0.30)")
                  }
                >
                  Next <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  onClick={() =>
                    document.getElementById("prediction-panel")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="flex items-center gap-2 font-body font-semibold text-white"
                  style={{
                    fontSize: 14,
                    padding: "10px 24px",
                    borderRadius: 99,
                    background: "linear-gradient(135deg, #7aaa5c, #5a8c42)",
                    boxShadow: "0 4px 16px rgba(90,140,66,0.28)",
                    transition: "all 0.3s ease",
                  }}
                >
                  Finish Setup <Check size={15} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
