"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { PREDICT_CATEGORIES } from "@/lib/types";
import { TrendingUp, Package, Users, Star, Gem, CheckCircle2 } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  "trending-up": <TrendingUp size={22} />,
  "package": <Package size={22} />,
  "users": <Users size={22} />,
  "star": <Star size={22} />,
  "gem": <Gem size={22} />,
};

const ICON_GRADIENTS = [
  "linear-gradient(135deg, #fde8f0, #ffc8d9)",
  "linear-gradient(135deg, #eef5eb, #c8dfba)",
  "linear-gradient(135deg, #fde8f0, #ffb0cc)",
  "linear-gradient(135deg, #fff0f5, #ffc0d3)",
  "linear-gradient(135deg, #eef5eb, #a4c88a)",
];

const ICON_COLORS = ["#e84a86", "#5a8c42", "#cc2e6e", "#f472a0", "#5a8c42"];

const CARD_COUNTS = ["2.4K", "1.8K", "3.1K", "2.9K", "1.5K"];

interface TiltCardProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

function TiltCard({ children, isActive, onClick, index }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -8, y: dx * 8 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.75,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: 1000,
        cursor: "pointer",
      }}
    >
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isActive ? 1.02 : isHovered ? 1.01 : 1,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="relative flex flex-col items-start text-left overflow-hidden h-full"
        style={{
          padding: "32px 26px",
          borderRadius: 24,
          background: isActive
            ? "rgba(255,255,255,0.80)"
            : "rgba(255,255,255,0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: isActive
            ? "1.5px solid rgba(244, 114, 160, 0.50)"
            : "1px solid rgba(255,255,255,0.80)",
          boxShadow: isActive
            ? "0 12px 40px rgba(232,74,134,0.18), 0 4px 12px rgba(0,0,0,0.06)"
            : isHovered
            ? "0 8px 32px rgba(232,74,134,0.12), 0 2px 8px rgba(0,0,0,0.05)"
            : "0 4px 20px rgba(0,0,0,0.05)",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Glow shimmer */}
        <motion.div
          className="absolute inset-0"
          style={{ borderRadius: "inherit" }}
          animate={{ opacity: isHovered || isActive ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              background:
                "linear-gradient(135deg, rgba(244,114,160,0.07) 0%, transparent 60%)",
            }}
          />
        </motion.div>

        {children}

        {/* Active check */}
        {isActive && (
          <motion.div
            className="absolute top-3.5 right-3.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <CheckCircle2 size={18} className="text-pink-500" fill="rgba(244,114,160,0.15)" />
          </motion.div>
        )}

        {/* Count badge */}
        <motion.div
          className="absolute bottom-3.5 right-3.5"
          animate={{ opacity: isHovered || isActive ? 0.9 : 0.4 }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: 11, color: "#a3a3a3", fontWeight: 600, letterSpacing: "0.04em" }}
        >
          {/* Placeholder, filled from parent */}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

interface PredictSectionProps {
  onCategorySelect?: (id: string) => void;
}

export default function PredictSection({ onCategorySelect }: PredictSectionProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setActiveId(id);
    onCategorySelect?.(id);
    setTimeout(() => {
      document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
    }, 350);
  };

  return (
    <section id="predictions" className="relative py-20 md:py-[110px]">
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
            choose your focus
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
              What Do You Want <br />
              <span className="gradient-text-pink">To Predict?</span>
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
            Select a prediction category to begin your fashion intelligence journey.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {PREDICT_CATEGORIES.map((cat, i) => (
            <TiltCard
              key={cat.id}
              isActive={activeId === cat.id}
              onClick={() => handleSelect(cat.id)}
              index={i}
            >
              {/* Icon */}
              <div
                className="flex items-center justify-center mb-5 relative z-10"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: ICON_GRADIENTS[i],
                  color: ICON_COLORS[i],
                }}
              >
                {ICON_MAP[cat.iconName]}
              </div>

              {/* Count badge */}
              <div
                className="absolute top-3.5 left-3.5 rounded-full font-body font-semibold"
                style={{
                  padding: "3px 10px",
                  fontSize: 10,
                  background: "rgba(0,0,0,0.04)",
                  color: "#a3a3a3",
                  letterSpacing: "0.04em",
                }}
              >
                {CARD_COUNTS[i]}
              </div>

              <h3
                className="font-display font-bold text-gray-800 mb-2 relative z-10"
                style={{ fontSize: 17, letterSpacing: "-0.01em" }}
              >
                {cat.label}
              </h3>
              <p
                className="text-gray-400 relative z-10 font-body"
                style={{ fontSize: 13, lineHeight: 1.6 }}
              >
                {cat.description}
              </p>

              {/* Bottom bar */}
              <motion.div
                className="absolute bottom-0 left-0 right-0"
                style={{ height: 3, borderRadius: "0 0 24px 24px" }}
                animate={{
                  background: activeId === cat.id
                    ? `linear-gradient(to right, ${ICON_COLORS[i]}, transparent)`
                    : "transparent",
                }}
                transition={{ duration: 0.4 }}
              />
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
