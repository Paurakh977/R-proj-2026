"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, Code, MessageCircle, Camera } from "lucide-react";

const NAV_LINKS = [
  { label: "About Project", href: "#about" },
  { label: "Methodology", href: "#predictions" },
  { label: "Predictions", href: "#predictions" },
  { label: "Categories", href: "#categories" },
];

const SOCIAL_LINKS = [
  { icon: Code, label: "GitHub" },
  { icon: MessageCircle, label: "Twitter" },
  { icon: Camera, label: "Instagram" },
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
            Where Data
            <br />
            Meets Style
          </p>

          {/* Script accent */}
          <p
            className="font-script flex items-center justify-center gap-2 mt-6"
            style={{ fontSize: 20, color: "#5a8c42" }}
          >
            <Sparkles size={14} className="text-pink-400" />
            Fashion meets intelligence
            <Sparkles size={14} className="text-pink-400" />
          </p>

          {/* Description */}
          <p
            className="text-gray-400 font-body mx-auto mt-4"
            style={{ fontSize: 14, lineHeight: 1.75, maxWidth: 440 }}
          >
            An AI-powered fashion prediction platform developed as a university
            project exploring the intersection of machine learning and style
            intelligence.
          </p>
        </motion.div>

        {/* ── Links + Team row ── */}
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

          {/* Team */}
          <div>
            <h4
              className="font-body font-semibold mb-5"
              style={{ fontSize: 11, letterSpacing: "0.14em", color: "#a3a3a3", textTransform: "uppercase" }}
            >
              Team & University
            </h4>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-body font-semibold text-gray-800" style={{ fontSize: 14 }}>
                  Research Team
                </p>
                <p className="text-gray-400 font-body" style={{ fontSize: 13 }}>
                  Fashion AI Lab · 2026
                </p>
              </div>
              <div>
                <p className="font-body font-semibold text-gray-800" style={{ fontSize: 14 }}>
                  TEAM 6
                </p>
                <p className="text-gray-400 font-body" style={{ fontSize: 13 }}>
                  Department of Data Science
                </p>
              </div>
              <a
                href="#"
                className="font-body font-semibold inline-flex items-center gap-1.5 transition-colors duration-250"
                style={{ fontSize: 13, color: "#e84a86", textDecoration: "none" }}
              >
                Contact the Team →
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4
              className="font-body font-semibold mb-5"
              style={{ fontSize: 11, letterSpacing: "0.14em", color: "#a3a3a3", textTransform: "uppercase" }}
            >
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="flex items-center gap-3 font-body font-medium text-gray-500 group transition-colors duration-250"
                  style={{ fontSize: 14, textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#e84a86";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#737373";
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: "rgba(0,0,0,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <Icon size={15} />
                  </div>
                  {label}
                </a>
              ))}
            </div>
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
              © 2026 TrendSeer · Fashion AI Prediction Platform
            </p>
            <div className="flex items-center gap-1.5 text-gray-400 font-body" style={{ fontSize: 13 }}>
              Built with
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart size={13} className="text-pink-400" fill="rgba(244,114,160,0.7)" />
              </motion.span>
              for academic excellence
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
