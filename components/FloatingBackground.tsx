"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FloatingBackground() {
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const orb4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Orbs drift independently on scroll
      gsap.to(orb1Ref.current, {
        y: -180,
        x: 40,
        ease: "none",
        scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 2 },
      });
      gsap.to(orb2Ref.current, {
        y: -220,
        x: -60,
        ease: "none",
        scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 3 },
      });
      gsap.to(orb3Ref.current, {
        y: -140,
        x: 80,
        ease: "none",
        scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1.5 },
      });
      gsap.to(orb4Ref.current, {
        y: -100,
        x: -40,
        ease: "none",
        scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 2.5 },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Fixed gradient base */}
      <div
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(160deg, #fff8fa 0%, #fff0f5 20%, #fde8f0 45%, #fff5f8 65%, #f4f9f2 85%, #eef5eb 100%)",
        }}
      />

      {/* Large blurred gradient orbs */}
      <div className="fixed inset-0 -z-15 pointer-events-none overflow-hidden">
        {/* Orb 1 — top left pink */}
        <div
          ref={orb1Ref}
          className="absolute"
          style={{
            width: 700,
            height: 700,
            top: "-15%",
            left: "-10%",
            background:
              "radial-gradient(circle, rgba(255, 200, 217, 0.55) 0%, rgba(255, 200, 217, 0.20) 45%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "orbFloat 22s ease-in-out infinite",
          }}
        />

        {/* Orb 2 — top right sage */}
        <div
          ref={orb2Ref}
          className="absolute"
          style={{
            width: 600,
            height: 600,
            top: "5%",
            right: "-10%",
            background:
              "radial-gradient(circle, rgba(164, 200, 138, 0.40) 0%, rgba(164, 200, 138, 0.15) 45%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(70px)",
            animation: "orbFloat 28s ease-in-out infinite 4s",
          }}
        />

        {/* Orb 3 — center pink */}
        <div
          ref={orb3Ref}
          className="absolute"
          style={{
            width: 500,
            height: 500,
            top: "35%",
            left: "30%",
            background:
              "radial-gradient(circle, rgba(255, 176, 204, 0.35) 0%, rgba(255, 176, 204, 0.10) 50%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(80px)",
            animation: "orbFloat 18s ease-in-out infinite 8s",
          }}
        />

        {/* Orb 4 — bottom left sage */}
        <div
          ref={orb4Ref}
          className="absolute"
          style={{
            width: 550,
            height: 550,
            bottom: "5%",
            left: "-5%",
            background:
              "radial-gradient(circle, rgba(122, 170, 92, 0.30) 0%, rgba(122, 170, 92, 0.10) 50%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(65px)",
            animation: "orbFloat 25s ease-in-out infinite 12s",
          }}
        />

        {/* Orb 5 — bottom right accent */}
        <div
          className="absolute"
          style={{
            width: 450,
            height: 450,
            bottom: "10%",
            right: "5%",
            background:
              "radial-gradient(circle, rgba(244, 114, 160, 0.30) 0%, rgba(244, 114, 160, 0.08) 50%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(75px)",
            animation: "orbFloat 20s ease-in-out infinite 6s",
          }}
        />
      </div>

      {/* Fashion silhouettes */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Dress */}
        <svg
          className="absolute"
          style={{
            width: 100,
            top: "6%",
            left: "2.5%",
            opacity: 0.055,
            stroke: "#e84a86",
            fill: "none",
            strokeWidth: 1,
            animation: "floatSlow 20s ease-in-out infinite",
          }}
          viewBox="0 0 80 100"
        >
          <path d="M40 5 L25 35 L15 95 L65 95 L55 35 Z M30 5 Q40 15 50 5" />
          <path d="M25 35 Q40 42 55 35" />
          <path d="M30 8 L22 30" strokeWidth={0.8} />
          <path d="M50 8 L58 30" strokeWidth={0.8} />
        </svg>

        {/* Hoodie */}
        <svg
          className="absolute"
          style={{
            width: 88,
            top: "18%",
            right: "3%",
            opacity: 0.05,
            stroke: "#5a8c42",
            fill: "none",
            strokeWidth: 1,
            animation: "floatSlow 24s ease-in-out infinite 3s",
          }}
          viewBox="0 0 90 90"
        >
          <path d="M20 30 Q45 15 70 30 L75 85 L15 85 Z" />
          <path d="M35 20 Q45 10 55 20" />
          <path d="M30 85 L30 55 Q45 62 60 55 L60 85" />
          <circle cx="45" cy="22" r="4" strokeWidth={0.7} />
        </svg>

        {/* Tote bag */}
        <svg
          className="absolute"
          style={{
            width: 78,
            top: "43%",
            left: "1.5%",
            opacity: 0.05,
            stroke: "#e84a86",
            fill: "none",
            strokeWidth: 1,
            animation: "floatSlow 22s ease-in-out infinite 1s",
          }}
          viewBox="0 0 70 80"
        >
          <rect x="10" y="30" width="50" height="45" rx="6" />
          <path d="M22 30 Q22 8 35 8 Q48 8 48 30" />
          <line x1="10" y1="46" x2="60" y2="46" strokeWidth={0.7} strokeDasharray="3 2" />
        </svg>

        {/* Sneaker */}
        <svg
          className="absolute"
          style={{
            width: 95,
            top: "58%",
            right: "2%",
            opacity: 0.05,
            stroke: "#5a8c42",
            fill: "none",
            strokeWidth: 1,
            animation: "floatSlow 21s ease-in-out infinite 5s",
          }}
          viewBox="0 0 90 60"
        >
          <path d="M10 45 Q10 20 35 20 L60 20 Q80 20 82 35 L85 45 Q85 50 75 50 L10 50 Q5 50 10 45Z" />
          <line x1="35" y1="25" x2="35" y2="45" strokeWidth={0.7} />
          <line x1="45" y1="22" x2="45" y2="45" strokeWidth={0.7} />
          <line x1="55" y1="22" x2="55" y2="45" strokeWidth={0.7} />
          <path d="M10 48 Q45 52 85 46" strokeWidth={0.7} />
        </svg>

        {/* High Heel */}
        <svg
          className="absolute"
          style={{
            width: 72,
            top: "76%",
            left: "4%",
            opacity: 0.055,
            stroke: "#e84a86",
            fill: "none",
            strokeWidth: 1,
            animation: "floatSlow 23s ease-in-out infinite 2s",
          }}
          viewBox="0 0 70 70"
        >
          <path d="M15 15 Q20 10 30 12 L35 30 L25 60 L20 65 L5 65 L15 55 Q10 40 15 15Z" />
          <path d="M35 30 L60 25 Q70 25 65 35 L35 40Z" />
        </svg>

        {/* Jeans */}
        <svg
          className="absolute"
          style={{
            width: 82,
            top: "11%",
            right: "7%",
            opacity: 0.05,
            stroke: "#5a8c42",
            fill: "none",
            strokeWidth: 1,
            animation: "floatSlow 19s ease-in-out infinite 4s",
          }}
          viewBox="0 0 70 100"
        >
          <path d="M15 5 L55 5 L55 35 Q55 50 50 55 L50 95 L38 95 L35 50 L32 95 L20 95 L20 55 Q15 50 15 35 Z" />
          <path d="M15 20 L55 20" strokeDasharray="3 2" strokeWidth={0.7} />
          <circle cx="35" cy="8" r="2" fill="#5a8c42" stroke="none" />
        </svg>

        {/* Skirt */}
        <svg
          className="absolute"
          style={{
            width: 80,
            top: "33%",
            right: "1.5%",
            opacity: 0.055,
            stroke: "#e84a86",
            fill: "none",
            strokeWidth: 1,
            animation: "floatSlow 26s ease-in-out infinite 6s",
          }}
          viewBox="0 0 80 70"
        >
          <path d="M25 5 L55 5 L70 65 L10 65 Z" />
          <path d="M25 5 Q40 16 55 5" />
          <path d="M28 18 L18 62" strokeWidth={0.7} />
          <path d="M52 18 L62 62" strokeWidth={0.7} />
          <path d="M40 12 L40 65" strokeWidth={0.7} />
        </svg>

        {/* Hat */}
        <svg
          className="absolute"
          style={{
            width: 66,
            top: "4%",
            left: "49%",
            opacity: 0.05,
            stroke: "#5a8c42",
            fill: "none",
            strokeWidth: 1,
            animation: "floatSlow 27s ease-in-out infinite 7s",
          }}
          viewBox="0 0 80 50"
        >
          <ellipse cx="40" cy="40" rx="38" ry="8" />
          <path d="M20 40 Q20 12 40 10 Q60 12 60 40" />
          <path d="M28 24 Q40 20 52 24" strokeWidth={0.7} />
        </svg>

        {/* Shirt */}
        <svg
          className="absolute"
          style={{
            width: 86,
            top: "52%",
            left: "5%",
            opacity: 0.05,
            stroke: "#e84a86",
            fill: "none",
            strokeWidth: 1,
            animation: "floatSlow 18s ease-in-out infinite 3.5s",
          }}
          viewBox="0 0 80 90"
        >
          <path d="M25 5 L10 20 L20 30 L25 25 L25 85 L55 85 L55 25 L60 30 L70 20 L55 5 Z" />
          <path d="M25 5 Q40 15 55 5" />
          <line x1="40" y1="25" x2="40" y2="72" strokeWidth={0.7} />
        </svg>
      </div>

      {/* Sparkle particles */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {[
          { top: "14%", left: "19%", delay: "0s", color: "#f472a0", size: 5 },
          { top: "29%", left: "71%", delay: "0.9s", color: "#7aaa5c", size: 4 },
          { top: "48%", left: "41%", delay: "1.7s", color: "#f472a0", size: 6 },
          { top: "68%", left: "84%", delay: "2.5s", color: "#7aaa5c", size: 4 },
          { top: "82%", left: "14%", delay: "3.3s", color: "#f472a0", size: 5 },
          { top: "9%",  left: "54%", delay: "0.5s", color: "#5a8c42", size: 4 },
          { top: "38%", left: "91%", delay: "1.3s", color: "#f472a0", size: 5 },
          { top: "57%", left: "28%", delay: "2.1s", color: "#7aaa5c", size: 4 },
          { top: "23%", left: "9%",  delay: "2.9s", color: "#f472a0", size: 6 },
          { top: "73%", left: "61%", delay: "3.7s", color: "#5a8c42", size: 5 },
          { top: "4%",  left: "78%", delay: "0.7s", color: "#f472a0", size: 4 },
          { top: "91%", left: "46%", delay: "1.5s", color: "#7aaa5c", size: 5 },
          { top: "44%", left: "58%", delay: "4.1s", color: "#f472a0", size: 3 },
          { top: "62%", left: "5%",  delay: "2.7s", color: "#5a8c42", size: 4 },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: s.color,
              opacity: 0,
              animation: `sparkle 5s ease-in-out infinite ${s.delay}`,
              boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
            }}
          />
        ))}

        {/* Pink dots */}
        {[
          { top: "17%", left: "47%", size: 9, delay: "0s" },
          { top: "31%", right: "27%", size: 13, delay: "2s" },
          { top: "54%", left: "53%", size: 7, delay: "4.2s" },
          { top: "70%", right: "36%", size: 11, delay: "1.1s" },
          { top: "44%", left: "34%", size: 8, delay: "3.1s" },
          { top: "85%", left: "68%", size: 10, delay: "5s" },
        ].map((d, i) => (
          <div
            key={`dot-${i}`}
            className="absolute rounded-full"
            style={{
              top: d.top,
              left: "left" in d ? d.left : undefined,
              right: "right" in d ? (d as { right: string }).right : undefined,
              width: d.size,
              height: d.size,
              background: "radial-gradient(circle, #f472a0, #e84a86)",
              opacity: 0.28,
              animation: `floatMed 9s ease-in-out infinite ${d.delay}`,
              filter: "blur(1px)",
            }}
          />
        ))}
      </div>
    </>
  );
}
