"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { num: 214, suffix: "K+", label: "Products Analyzed", color: "#e84a86" },
  { num: 106, suffix: "", label: "Fashion Categories", color: "#e84a86" },
  { num: 700, suffix: "+", label: "Brands Tracked", color: "#5a8c42" },
];

function CountUp({
  target,
  suffix,
  color,
}: {
  target: number;
  suffix: string;
  color: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
              if (el) el.textContent = Math.round(obj.val) + suffix;
            },
          });
        },
        once: true,
      });
    });

    return () => ctx.revert();
  }, [target, suffix]);

  return (
    <span ref={ref} style={{ color }}>
      0{suffix}
    </span>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse tilt for hero card
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 120, damping: 18 });
  const springY = useSpring(my, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // GSAP clip-text reveal — word by word
      const words = headlineRef.current?.querySelectorAll(".clip-text");
      if (words) {
        gsap.fromTo(
          words,
          { y: "110%", opacity: 0 },
          {
            y: "0%",
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "power4.out",
            delay: 0.3,
          }
        );
      }

      // Parallax on scroll
      if (sectionRef.current) {
        gsap.to(".hero-badge", {
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        });
        gsap.to(".hero-cta", {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 2,
          },
        });
        gsap.to(".hero-stats", {
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 2.5,
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center text-center relative pt-[130px] pb-[80px] px-4 md:px-10"
    >
      {/* ── Badge ── */}
      <motion.div
        className="hero-badge badge-pink mb-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          animate={{ rotate: [0, 15, 0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles size={13} className="text-pink-500" />
        </motion.span>
        AI-Powered Fashion Intelligence
        <motion.span
          animate={{ rotate: [0, -15, 0, 15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Sparkles size={13} className="text-pink-500" />
        </motion.span>
      </motion.div>

      {/* ── Main Headline ── */}
      <h1
        ref={headlineRef}
        className="font-display text-gray-900 mb-5"
        style={{
          fontSize: "clamp(52px, 8vw, 96px)",
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          fontStyle: "italic",
          fontWeight: 700,
        }}
      >
        <span className="clip-text-wrapper block">
          <span className="clip-text block">Want to&nbsp;</span>
        </span>
        <span className="clip-text-wrapper block">
          <span className="clip-text gradient-text-pink block">Predict</span>
        </span>
        <span className="clip-text-wrapper block">
          <span className="clip-text block">Something?</span>
        </span>
      </h1>

      {/* ── Script tagline ── */}
      <motion.p
        className="font-script flex items-center justify-center gap-2 mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        style={{
          fontSize: "clamp(18px, 2.5vw, 26px)",
          color: "#5a8c42",
        }}
      >
        <Sparkles size={14} className="text-pink-400" />
        where data meets style
        <Sparkles size={14} className="text-pink-400" />
      </motion.p>

      {/* ── Description ── */}
      <motion.p
        className="max-w-[520px] mb-10 text-gray-500"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.1 }}
        style={{ fontSize: "clamp(15px, 1.5vw, 17px)", lineHeight: 1.75 }}
      >
        Explore fashion trends through intelligent, gender-inclusive prediction.
        Discover what&apos;s rising, fading, or trending in the world of style.
      </motion.p>

      {/* ── CTA Buttons ── */}
      <motion.div
        className="hero-cta flex flex-col sm:flex-row items-center gap-4 mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.3 }}
      >
        <button
          onClick={() => scrollTo("predictions")}
          className="btn-primary"
          style={{ fontSize: 15, padding: "17px 40px" }}
        >
          Start Predicting
          <ArrowRight size={16} />
        </button>
        <button
          onClick={() => scrollTo("about")}
          className="btn-ghost"
          style={{ fontSize: 15 }}
        >
          How It Works
        </button>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div
        className="hero-stats flex flex-wrap items-center justify-center gap-10 mb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        {STATS.map((s, i) => (
          <div key={i} className="text-center">
            <p
              className="font-display font-bold text-gray-900 leading-none mb-1"
              style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.02em" }}
            >
              <CountUp target={s.num} suffix={s.suffix} color={s.color} />
            </p>
            <p className="text-gray-400 font-body" style={{ fontSize: 12, letterSpacing: "0.04em" }}>
              {s.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* ── Floating trend card ── */}
      <motion.div
        className="hero-card"
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 1000 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          ref={cardRef}
          className="glass-card"
          style={{
            padding: "20px 28px",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            gap: 18,
            minWidth: 280,
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Chart bars */}
          <div className="flex items-end gap-1.5" style={{ height: 40 }}>
            {[40, 65, 52, 80, 70, 90, 78].map((h, i) => (
              <motion.div
                key={i}
                className="w-2.5 rounded-t-sm"
                style={{
                  height: `${h}%`,
                  background:
                    i === 5
                      ? "linear-gradient(to top, #e84a86, #f472a0)"
                      : i % 2 === 0
                      ? "rgba(232,74,134,0.25)"
                      : "rgba(90,140,66,0.20)",
                  transformOrigin: "bottom",
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  delay: 1.8 + i * 0.08,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#e84a86", animation: "pulse-ring 2s ease infinite" }}
              />
              <span className="text-pink-500 font-body font-semibold" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
                LIVE TREND
              </span>
            </div>
            <p className="font-display font-bold text-gray-800" style={{ fontSize: 16, letterSpacing: "-0.01em" }}>
              Oversized Blazers
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <TrendingUp size={13} className="text-green-500" />
              <span className="text-gray-500 font-body" style={{ fontSize: 12 }}>
                +34% this month
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ bottom: 36 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <span
          className="text-gray-400 font-body uppercase"
          style={{ fontSize: 10, letterSpacing: "0.14em" }}
        >
          scroll
        </span>
        <motion.div
          className="relative border border-gray-300 flex justify-center"
          style={{ width: 22, height: 36, borderRadius: 11 }}
          animate={{ borderColor: ["rgba(163,163,163,0.5)", "rgba(232,74,134,0.6)", "rgba(163,163,163,0.5)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="absolute rounded-full bg-pink-400"
            style={{ width: 3, height: 6, top: 6, left: "50%", transform: "translateX(-50%)" }}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
