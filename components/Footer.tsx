"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, BookOpen, GraduationCap, MapPin } from "lucide-react";

const NAV_LINKS = [
  { label: "About Project", href: "#about" },
  { label: "Methodology", href: "#predictions" },
  { label: "Predictions", href: "#predictions" },
  { label: "Categories", href: "#categories" },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer id="about" className="relative overflow-hidden">
      {/* Top decorative gradient line */}
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(to right, transparent, rgba(244,114,160,0.50), rgba(122,170,92,0.40), transparent)",
        }}
      />

      {/* Large bg orb */}
      <div
        className="absolute"
        style={{
          width: 600,
          height: 600,
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,176,204,0.20) 0%, rgba(255,176,204,0.06) 50%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-20 relative">

        {/* ── Main brand statement ── */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div
              className="flex items-center justify-center"
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f472a0, #e84a86)",
                boxShadow: "0 8px 32px rgba(232,74,134,0.40)",
              }}
            >
              <Sparkles size={22} className="text-white" />
            </div>
            <h3
              className="font-display font-bold text-gray-900"
              style={{ fontSize: 28, letterSpacing: "-0.02em", fontStyle: "italic" }}
            >
              TrendSeer
            </h3>
          </div>

          {/* Big editorial tagline */}
          <p
            className="font-display mx-auto"
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              fontStyle: "italic",
              fontWeight: 700,
              maxWidth: 700,
              background:
                "linear-gradient(135deg, #262626 0%, #404040 40%, #e84a86 70%, #262626 100%)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 6s linear infinite",
            }}
          >
            Kathmandu
            <br />
            University
          </p>

          {/* Description */}
          <p
            className="text-gray-400 font-body mx-auto mt-4"
            style={{ fontSize: 14, lineHeight: 1.75, maxWidth: 440 }}
          >
            An AI-powered fashion trend prediction platform developed as a
            capstone project by students of Kathmandu University, Department of
            Computer Science and Engineering.
          </p>
        </motion.div>

        {/* ── Links + University Info row ── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Navigation */}
          <div>
            <h4
              className="font-body font-semibold mb-5"
              style={{ fontSize: 11, letterSpacing: "0.14em", color: "#a3a3a3", textTransform: "uppercase" }}
            >
              Navigation
            </h4>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(link.href);
                    }}
                    className="font-body font-medium text-gray-500 transition-colors duration-250 inline-flex items-center gap-1 group"
                    style={{
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "#e84a86")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "#737373")
                    }
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* University Info */}
          <div>
            <h4
              className="font-body font-semibold mb-5"
              style={{ fontSize: 11, letterSpacing: "0.14em", color: "#a3a3a3", textTransform: "uppercase" }}
            >
              University
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <GraduationCap size={16} className="text-pink-400" style={{ marginTop: 2 }} />
                <div>
                  <p className="font-body font-semibold text-gray-800" style={{ fontSize: 14 }}>
                    Kathmandu University
                  </p>
                  <p className="text-gray-400 font-body" style={{ fontSize: 13 }}>
                    Dept. of Computer Science & Engineering
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen size={16} className="text-green-400" style={{ marginTop: 2 }} />
                <div>
                  <p className="font-body font-semibold text-gray-800" style={{ fontSize: 14 }}>
                    Capstone Project
                  </p>
                  <p className="text-gray-400 font-body" style={{ fontSize: 13 }}>
                    Fashion Trend Prediction · 2026
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-400" style={{ marginTop: 2 }} />
                <div>
                  <p className="font-body font-semibold text-gray-800" style={{ fontSize: 14 }}>
                    Dhulikhel, Nepal
                  </p>
                  <p className="text-gray-400 font-body" style={{ fontSize: 13 }}>
                    School of Engineering
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <h4
              className="font-body font-semibold mb-5"
              style={{ fontSize: 11, letterSpacing: "0.14em", color: "#a3a3a3", textTransform: "uppercase" }}
            >
              About
            </h4>
            <p className="text-gray-400 font-body leading-relaxed" style={{ fontSize: 13 }}>
              TrendSeer is a machine learning platform that predicts fashion
              product trend potential using listing-time metadata. Built with
              XGBoost and trained on 214K+ products across 106 categories.
            </p>
          </div>
        </motion.div>

        {/* ── Bottom bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="divider-gradient mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-400 font-body" style={{ fontSize: 13 }}>
              &copy; 2026 Kathmandu University · Capstone Project
            </p>
            <div className="flex items-center gap-1.5 text-gray-400 font-body" style={{ fontSize: 13 }}>
              Built with
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart size={13} className="text-pink-400" fill="rgba(244,114,160,0.7)" />
              </motion.span>
              by Team 6, Dept. of Mathematics
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
