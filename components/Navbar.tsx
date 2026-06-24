"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#hero", label: "Home", id: "hero" },
  { href: "#predictions", label: "Predict", id: "predictions" },
  { href: "#categories", label: "Explore", id: "categories" },
  { href: "#about", label: "About", id: "about" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [hovered, setHovered] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);

      const sections = document.querySelectorAll("section[id], footer[id]");
      let current = "hero";
      sections.forEach((sec) => {
        const top = (sec as HTMLElement).offsetTop - 160;
        if (window.scrollY >= top) {
          current = sec.getAttribute("id") || current;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Magnetic CTA button effect
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.3;
      const dy = (e.clientY - cy) * 0.3;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const handleMouseLeave = () => {
      btn.style.transform = "translate(0,0)";
      btn.style.transition = "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
    };

    const handleMouseEnter = () => {
      btn.style.transition = "transform 0.1s ease";
    };

    btn.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseleave", handleMouseLeave);
    btn.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
      btn.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <motion.nav
      id="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-5 inset-x-0 mx-auto z-50 w-[calc(100%-2.5rem)] max-w-[1120px]",
        "flex items-center justify-between py-3 px-6",
        "border transition-[box-shadow,border-color] duration-500"
      )}
      style={{
        borderRadius: 9999,
        backdropFilter: "blur(28px) saturate(200%)",
        WebkitBackdropFilter: "blur(28px) saturate(200%)",
        background: scrolled
          ? "rgba(255,255,255,0.85)"
          : "rgba(255,255,255,0.60)",
        borderColor: scrolled
          ? "rgba(255,176,204,0.35)"
          : "rgba(255,255,255,0.80)",
        boxShadow: scrolled
          ? "0 8px 40px rgba(232,74,134,0.12), 0 2px 8px rgba(0,0,0,0.06)"
          : "0 4px 24px rgba(232,74,134,0.06), 0 1px 4px rgba(0,0,0,0.03)",
      }}
    >
      {/* ── Brand ── */}
      <button
        onClick={() => scrollTo("#hero")}
        className="flex items-center gap-3 group"
      >
        <div
          className="shrink-0 flex items-center justify-center text-white relative overflow-hidden"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f472a0, #e84a86)",
            boxShadow: "0 4px 16px rgba(232,74,134,0.40)",
          }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)",
            }}
          />
          <Sparkles size={18} className="relative z-10" />
        </div>
        <div className="text-left">
          <p
            className="font-display font-bold text-gray-800 leading-none"
            style={{ fontSize: 17, letterSpacing: "-0.01em" }}
          >
            TrendSeer
          </p>
          <p
            className="text-pink-400 font-body"
            style={{ fontSize: 10, letterSpacing: "0.12em", fontWeight: 500 }}
          >
            FASHION AI
          </p>
        </div>
      </button>

      {/* ── Desktop Links ── */}
      <ul className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map((link) => {
          const isActive = activeSection === link.id;
          const isHov = hovered === link.id;
          return (
            <li key={link.href} className="relative">
              <button
                onMouseEnter={() => setHovered(link.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => scrollTo(link.href)}
                className={cn(
                  "relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-300",
                  isActive ? "text-pink-600" : "text-gray-500 hover:text-gray-800"
                )}
              >
                {/* Hover/active pill background */}
                <AnimatePresence>
                  {(isActive || isHov) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: isActive
                          ? "rgba(244,114,160,0.12)"
                          : "rgba(0,0,0,0.04)",
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                {/* Active dot */}
                {isActive && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pink-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <span className="relative z-10">{link.label}</span>
              </button>
            </li>
          );
        })}

        <li>
          <button
            ref={btnRef}
            onClick={() => scrollTo("#predictions")}
            className="ml-2 flex items-center gap-2 text-sm font-semibold text-white"
            style={{
              padding: "10px 24px",
              borderRadius: 9999,
              background: "linear-gradient(135deg, #f472a0, #e84a86)",
              boxShadow: "0 6px 24px rgba(232,74,134,0.38)",
              transition: "box-shadow 0.3s ease",
              willChange: "transform",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 10px 36px rgba(232,74,134,0.52)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 6px 24px rgba(232,74,134,0.38)";
            }}
          >
            Try Now
            <motion.span
              animate={{ rotate: [0, 20, 0, -20, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={13} />
            </motion.span>
          </button>
        </li>
      </ul>

      {/* ── Mobile Toggle ── */}
      <button
        className="md:hidden p-2 text-gray-500 hover:text-pink-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={20} />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={20} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[calc(100%+14px)] left-0 right-0 p-3 flex flex-col gap-1 md:hidden"
            style={{
              borderRadius: 24,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,176,204,0.30)",
              boxShadow: "0 12px 48px rgba(232,74,134,0.14)",
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25 }}
                onClick={() => scrollTo(link.href)}
                className={cn(
                  "text-left px-5 py-3.5 rounded-2xl text-sm font-medium transition-colors duration-250",
                  activeSection === link.id
                    ? "text-pink-600 bg-pink-50/80"
                    : "text-gray-600 hover:text-pink-600 hover:bg-pink-50/50"
                )}
              >
                {link.label}
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              onClick={() => scrollTo("#predictions")}
              className="mt-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #f472a0, #e84a86)",
                boxShadow: "0 6px 24px rgba(232,74,134,0.38)",
              }}
            >
              Try Now <Sparkles size={13} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
