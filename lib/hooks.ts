"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PredictionFilters, PredictionResult } from "@/lib/types";

// ── Scroll reveal hook ──
export function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// ── Global prediction state ──
interface PredictionStore {
  filters: PredictionFilters;
  result: PredictionResult | null;
  isLoading: boolean;
  updateFilters: (updates: Partial<PredictionFilters>) => void;
  runPrediction: () => Promise<void>;
}

const DEFAULT_FILTERS: PredictionFilters = {
  title: "Casual Cotton Top",
  price: 29.99,
  category: "tops",
  gender: "Women",
  market: "IN",
  brand: "Alcis",
};

let globalFilters: PredictionFilters = { ...DEFAULT_FILTERS };
let globalResult: PredictionResult | null = null;
let globalLoading = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function usePredictionStore(): PredictionStore {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const update = () => forceUpdate((n) => n + 1);
    listeners.add(update);
    return () => void listeners.delete(update);
  }, []);

  const updateFilters = useCallback((updates: Partial<PredictionFilters>) => {
    globalFilters = { ...globalFilters, ...updates };
    notify();
  }, []);

  const runPrediction = useCallback(async () => {
    globalLoading = true;
    globalResult = null;
    notify();

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(globalFilters),
      });
      const json = await res.json();
      if (json.success) {
        globalResult = json.data;
      }
    } catch (e) {
      console.error("Prediction failed:", e);
    } finally {
      globalLoading = false;
      notify();
    }
  }, []);

  return {
    filters: globalFilters,
    result: globalResult,
    isLoading: globalLoading,
    updateFilters,
    runPrediction,
  };
}