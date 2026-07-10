"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { usePredictionStore } from "@/lib/hooks";
import { ChevronDown, Check, Search, X } from "lucide-react";
import type { BrandData, CategoryData } from "@/lib/types";

const GENDER_OPTIONS = [
  { value: "Women", label: "Women" },
  { value: "Men", label: "Men" },
  { value: "Youth", label: "Youth" },
];

const MARKET_OPTIONS = [
  { value: "IN", label: "India" },
  { value: "US", label: "US" },
];

function SearchableSelect({
  value,
  options,
  onChange,
  placeholder,
  labelKey = "label",
  valueKey = "value",
}: {
  value: string;
  options: { [key: string]: string | number }[];
  onChange: (v: string) => void;
  placeholder: string;
  labelKey?: string;
  valueKey?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o[valueKey] === value);
  const displayValue = selected ? String(selected[labelKey]) : value;

  const filtered = options.filter((o) =>
    String(o[labelKey]).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Selected value / search input */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "14px 40px 14px 18px",
          borderRadius: 14,
          background: "rgba(255,255,255,0.60)",
          border: open
            ? "1.5px solid rgba(244,114,160,0.50)"
            : "1px solid rgba(0,0,0,0.07)",
          boxShadow: open
            ? "0 4px 20px rgba(232,74,134,0.14)"
            : "0 1px 4px rgba(0,0,0,0.04)",
          fontSize: 14,
          fontFamily: "var(--font-body)",
          color: "#404040",
          cursor: "pointer",
          transition: "all 0.25s ease",
          display: "flex",
          alignItems: "center",
          gap: 8,
          position: "relative",
        }}
      >
        {open ? (
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 14,
              fontFamily: "var(--font-body)",
              color: "#404040",
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                setSearch("");
              }
              if (e.key === "Enter" && filtered.length > 0) {
                onChange(String(filtered[0][valueKey]));
                setOpen(false);
                setSearch("");
              }
            }}
          />
        ) : (
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayValue}
          </span>
        )}
        <ChevronDown
          size={16}
          style={{
            position: "absolute",
            right: 14,
            color: "#a3a3a3",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s ease",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            maxHeight: 240,
            overflowY: "auto",
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(12px)",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            zIndex: 50,
          }}
        >
          {filtered.length === 0 && (
            <div
              style={{
                padding: "12px 18px",
                fontSize: 13,
                color: "#a3a3a3",
                fontFamily: "var(--font-body)",
                textAlign: "center",
              }}
            >
              No results found
            </div>
          )}
          {filtered.map((opt) => {
            const optVal = String(opt[valueKey]);
            const optLabel = String(opt[labelKey]);
            const isActive = value === optVal;
            return (
              <button
                key={optVal}
                onClick={() => {
                  onChange(optVal);
                  setOpen(false);
                  setSearch("");
                }}
                style={{
                  width: "100%",
                  padding: "10px 18px",
                  textAlign: "left",
                  fontSize: 13,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  background: isActive ? "rgba(244,114,160,0.1)" : "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                  color: isActive ? "#cc2e6e" : "#404040",
                  fontWeight: isActive ? 600 : 400,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="flex items-center gap-2">
                  {isActive && <Check size={12} strokeWidth={3} style={{ color: "#cc2e6e" }} />}
                  {optLabel}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductPanel() {
  const { filters, updateFilters } = usePredictionStore();
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    fetch("/data/brands.json")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands || []))
      .catch(() => {});
    fetch("/data/categories.json")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  const categoryOptions = categories.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  // Add "Other" option for brand if not already in list
  const brandOptions = [
    { value: "Other", label: "Other (Unknown Brand)" },
    ...brands.map((b) => ({ value: b.brand, label: b.brand })),
  ];

  const inputStyle = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.60)",
    border: "1px solid rgba(0,0,0,0.07)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    fontSize: 14,
    fontFamily: "var(--font-body)",
    color: "#404040",
    outline: "none",
    transition: "all 0.25s ease" as const,
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600 as const,
    color: "#525252",
    marginBottom: 8,
    display: "block" as const,
    fontFamily: "var(--font-body)",
  };

  const pillStyle = (active: boolean) => ({
    padding: "10px 22px",
    borderRadius: 99,
    fontSize: 13,
    fontWeight: 600 as const,
    fontFamily: "var(--font-body)",
    cursor: "pointer" as const,
    border: active
      ? "1.5px solid rgba(244,114,160,0.50)"
      : "1px solid rgba(0,0,0,0.07)",
    background: active
      ? "linear-gradient(135deg, rgba(244,114,160,0.15), rgba(232,74,134,0.10))"
      : "rgba(255,255,255,0.60)",
    color: active ? "#cc2e6e" : "#737373",
    boxShadow: active
      ? "0 4px 16px rgba(232,74,134,0.14)"
      : "0 1px 4px rgba(0,0,0,0.04)",
    transition: "all 0.25s ease" as const,
  });

  return (
    <section id="product-section" className="relative py-20 md:py-[110px]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10">
        <div className="text-center mb-16">
          <motion.div
            className="eyebrow flex items-center justify-center gap-2 mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="divider-gradient" style={{ flex: 1, maxWidth: 60 }} />
            configure prediction
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
              Product <span className="gradient-text-pink">Details</span>
            </motion.h2>
          </div>

          <motion.p
            className="text-gray-400 mx-auto"
            style={{ fontSize: 15, maxWidth: 500, lineHeight: 1.75 }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Enter listing-time product details. The model predicts trending
            potential before reviews accumulate.
          </motion.p>
        </div>

        <motion.div
          className="mx-auto gradient-border"
          style={{ maxWidth: 720 }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="glass"
            style={{ padding: "44px 48px", borderRadius: "inherit", position: "relative", overflow: "hidden" }}
          >
            {/* Title */}
            <div className="mb-6">
              <label style={labelStyle}>Product Title</label>
              <input
                type="text"
                value={filters.title}
                onChange={(e) => updateFilters({ title: e.target.value })}
                placeholder="e.g. Nike Women's Running Shoes"
                style={inputStyle}
              />
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label style={labelStyle}>Price (USD)</label>
                <span className="font-body font-bold" style={{ fontSize: 15, color: "#e84a86" }}>
                  ${filters.price.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.01}
                max={500}
                step={0.01}
                value={filters.price}
                onChange={(e) => updateFilters({ price: Number(e.target.value) })}
                className="w-full"
                style={{ accentColor: "#e84a86" }}
              />
              <div className="flex justify-between mt-1">
                <span style={{ fontSize: 11, color: "#a3a3a3" }}>$0</span>
                <span style={{ fontSize: 11, color: "#a3a3a3" }}>$500</span>
              </div>
            </div>

            {/* Category - searchable */}
            <div className="mb-6">
              <label style={labelStyle}>Category</label>
              <SearchableSelect
                value={filters.category}
                options={categoryOptions}
                onChange={(v) => updateFilters({ category: v })}
                placeholder="Search categories..."
              />
            </div>

            {/* Brand - searchable with Other */}
            <div className="mb-6">
              <label style={labelStyle}>Brand</label>
              <SearchableSelect
                value={filters.brand}
                options={brandOptions}
                onChange={(v) => updateFilters({ brand: v })}
                placeholder="Search brands..."
              />
            </div>

            {/* Gender + Market */}
            <div className="grid grid-cols-2 gap-5 mb-6">
              <div>
                <label style={labelStyle}>Gender</label>
                <div className="flex gap-2">
                  {GENDER_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateFilters({ gender: opt.value })}
                      style={pillStyle(filters.gender === opt.value)}
                    >
                      <span className="flex items-center gap-1.5">
                        {filters.gender === opt.value && <Check size={12} strokeWidth={3} />}
                        {opt.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Market</label>
                <div className="flex gap-2">
                  {MARKET_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateFilters({ market: opt.value })}
                      style={pillStyle(filters.market === opt.value)}
                    >
                      <span className="flex items-center gap-1.5">
                        {filters.market === opt.value && <Check size={12} strokeWidth={3} />}
                        {opt.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              onClick={() =>
                document.getElementById("prediction-panel")?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full flex items-center justify-center gap-2 font-body font-semibold text-white"
              style={{
                fontSize: 15,
                padding: "16px 32px",
                borderRadius: 99,
                background: "linear-gradient(135deg, #7aaa5c, #5a8c42)",
                boxShadow: "0 4px 16px rgba(90,140,66,0.28)",
                transition: "all 0.3s ease",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue to Prediction
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
