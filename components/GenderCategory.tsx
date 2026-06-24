"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Heart, Zap, ArrowRight } from "lucide-react";
import { GENDER_CATEGORIES } from "@/lib/types";

const ICON_MAP: Record<string, React.ReactNode> = {
  heart: <Heart size={22} strokeWidth={1.5} />,
  zap: <Zap size={22} strokeWidth={1.5} />,
};

const TAG_SIZES = [14, 13, 15, 12, 14, 13, 12, 15, 13, 14, 12, 15];

export default function GenderCategories() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string>("");
  const [hoveredItem, setHoveredItem] = useState<string>("");

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectItem = (item: string) => {
    setSelected(item);
    setTimeout(() => {
      document.getElementById("product-section")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <section id="categories" className="relative py-20 md:py-[110px]">
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
            explore by style
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
              Gender-Inclusive
              <br />
              <span className="gradient-text-pink">Fashion Categories</span>
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
            Every style matters. Choose a fashion world to explore and find your trend.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GENDER_CATEGORIES.map((cat, catIndex) => {
            const isExpanded = expanded[cat.id];
            const isPink = cat.colorClass === "pink";

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.85,
                  delay: catIndex * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative overflow-hidden"
                style={{ borderRadius: 28 }}
              >
                {/* Card background */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: isPink
                      ? "linear-gradient(145deg, rgba(255,255,255,0.75), rgba(255,240,248,0.60))"
                      : "linear-gradient(145deg, rgba(255,255,255,0.75), rgba(240,248,240,0.60))",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: isPink
                      ? "1px solid rgba(255,176,204,0.35)"
                      : "1px solid rgba(164,200,138,0.35)",
                    borderRadius: 28,
                  }}
                />

                {/* Decorative orb */}
                <div
                  className="absolute"
                  style={{
                    width: 220,
                    height: 220,
                    top: -60,
                    right: -40,
                    borderRadius: "50%",
                    background: isPink
                      ? "radial-gradient(circle, rgba(255,176,204,0.25) 0%, transparent 70%)"
                      : "radial-gradient(circle, rgba(122,170,92,0.20) 0%, transparent 70%)",
                    filter: "blur(30px)",
                    pointerEvents: "none",
                  }}
                />

                {/* Accent line */}
                <div
                  className="absolute left-0 top-0 bottom-0"
                  style={{
                    width: 3,
                    borderRadius: "28px 0 0 28px",
                    background: isPink
                      ? "linear-gradient(to bottom, #f472a0, #e84a86, rgba(232,74,134,0))"
                      : "linear-gradient(to bottom, #7aaa5c, #5a8c42, rgba(90,140,66,0))",
                  }}
                />

                <div className="relative p-8">
                  {/* Card header */}
                  <button
                    className="w-full flex items-center justify-between mb-6 group"
                    onClick={() => toggleExpand(cat.id)}
                  >
                    <div className="flex items-center gap-5">
                      {/* Icon with animated background */}
                      <div
                        className="relative flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 18,
                          background: isPink
                            ? "linear-gradient(135deg, #fde8f0, #ffc8d9)"
                            : "linear-gradient(135deg, #eef5eb, #c8dfba)",
                          color: isPink ? "#e84a86" : "#5a8c42",
                          boxShadow: isPink
                            ? "0 4px 16px rgba(232,74,134,0.20)"
                            : "0 4px 16px rgba(90,140,66,0.18)",
                        }}
                      >
                        {ICON_MAP[cat.iconName]}
                      </div>

                      <div className="text-left">
                        <h3
                          className="font-display font-bold text-gray-900"
                          style={{ fontSize: 24, letterSpacing: "-0.02em", fontStyle: "italic" }}
                        >
                          {cat.label}
                        </h3>
                        <p className="text-gray-400 font-body" style={{ fontSize: 13, marginTop: 2 }}>
                          {cat.tagline}
                        </p>
                      </div>
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        background: isPink
                          ? "rgba(255,176,204,0.20)"
                          : "rgba(164,200,138,0.20)",
                        color: isPink ? "#e84a86" : "#5a8c42",
                      }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </button>

                  {/* Preview tags (collapsed state) */}
                  <AnimatePresence mode="wait">
                    {!isExpanded && (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-wrap gap-2"
                      >
                        {cat.items.slice(0, 5).map((item, i) => (
                          <motion.button
                            key={item}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            onHoverStart={() => setHoveredItem(item)}
                            onHoverEnd={() => setHoveredItem("")}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectItem(item);
                            }}
                            className="font-body font-medium rounded-full transition-colors duration-250"
                            style={{
                              padding: "7px 18px",
                              fontSize: TAG_SIZES[i % TAG_SIZES.length] - 1,
                              background:
                                selected === item
                                  ? isPink ? "#e84a86" : "#5a8c42"
                                  : hoveredItem === item
                                  ? isPink ? "rgba(232,74,134,0.15)" : "rgba(90,140,66,0.15)"
                                  : isPink ? "rgba(255,200,217,0.25)" : "rgba(164,200,138,0.20)",
                              color:
                                selected === item
                                  ? "#fff"
                                  : isPink ? "#cc2e6e" : "#5a8c42",
                              border: isPink
                                ? "1px solid rgba(255,176,204,0.35)"
                                : "1px solid rgba(164,200,138,0.30)",
                              boxShadow: selected === item
                                ? isPink ? "0 4px 16px rgba(232,74,134,0.30)" : "0 4px 16px rgba(90,140,66,0.28)"
                                : "none",
                            }}
                          >
                            {item}
                          </motion.button>
                        ))}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(cat.id);
                          }}
                          className="flex items-center gap-1 font-body font-medium rounded-full transition-colors duration-250"
                          style={{
                            padding: "7px 16px",
                            fontSize: 13,
                            background: "rgba(0,0,0,0.04)",
                            color: "#737373",
                            border: "1px solid rgba(0,0,0,0.07)",
                          }}
                        >
                          +{cat.items.length - 5} more
                          <ArrowRight size={11} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expanded grid */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        key="expanded"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                          {cat.items.map((item, i) => (
                            <motion.button
                              key={item}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04, duration: 0.3 }}
                              onClick={() => selectItem(item)}
                              className="py-3 px-4 rounded-2xl text-sm font-body font-medium text-center transition-colors duration-300"
                              style={{
                                background:
                                  selected === item
                                    ? isPink
                                      ? "linear-gradient(135deg, #f472a0, #e84a86)"
                                      : "linear-gradient(135deg, #7aaa5c, #5a8c42)"
                                    : isPink
                                    ? "rgba(255,200,217,0.20)"
                                    : "rgba(164,200,138,0.18)",
                                color: selected === item ? "#fff" : isPink ? "#cc2e6e" : "#5a8c42",
                                border:
                                  selected === item
                                    ? "1px solid transparent"
                                    : isPink
                                    ? "1px solid rgba(255,176,204,0.30)"
                                    : "1px solid rgba(164,200,138,0.25)",
                                boxShadow:
                                  selected === item
                                    ? isPink
                                      ? "0 4px 16px rgba(232,74,134,0.30)"
                                      : "0 4px 16px rgba(90,140,66,0.26)"
                                    : "none",
                                transform: selected === item ? "scale(1.02)" : "scale(1)",
                              }}
                            >
                              {item}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
