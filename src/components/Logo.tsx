"use client";

import React from "react";

export type LogoConcept = 1 | 2 | 3;

interface LogoProps {
  variant?: "light" | "dark" | "auto";
  showText?: boolean;
  showTagline?: boolean;
  size?: number;
  concept?: LogoConcept; // 1 = Architectural Monogram, 2 = Sunset Terrace Shield, 3 = Isometric Co-Living Cube
}

export default function Logo({
  variant = "light",
  showText = true,
  showTagline = false,
  size = 38,
  concept = 1,
}: LogoProps) {
  const textColor =
    variant === "light"
      ? "#ffffff"
      : variant === "dark"
      ? "#0f172a"
      : "var(--text-main)";

  const taglineColor =
    variant === "light"
      ? "rgba(255,255,255,0.7)"
      : variant === "dark"
      ? "#64748b"
      : "var(--text-muted)";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", verticalAlign: "middle" }}>
      {/* ── Concept 1: Architectural Golden P&G Monogram Building ──────── */}
      {concept === 1 && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0, filter: "drop-shadow(0 4px 12px rgba(234, 88, 12, 0.3))" }}
        >
          <defs>
            <linearGradient id="logo1_amberGrad" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="logo1_greenGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>

          {/* Outer Rounded Architectural Frame */}
          <rect x="15" y="15" width="90" height="90" rx="22" fill="#161b22" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="3" />
          
          {/* Architectural Roof Silhouette */}
          <path d="M30 46 L60 22 L90 46" stroke="url(#logo1_amberGrad)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Monogram P & G Building Structure */}
          {/* Left Column (P stem) */}
          <rect x="34" y="48" width="14" height="46" rx="4" fill="url(#logo1_amberGrad)" />
          {/* P Loop */}
          <path d="M48 48 H68 C76 48 82 54 82 62 C82 70 76 76 68 76 H48 V48 Z" fill="url(#logo1_amberGrad)" opacity="0.9" />
          {/* Inner P Cutout */}
          <path d="M48 56 H66 C70 56 74 59 74 62 C74 65 70 68 66 68 H48 V56 Z" fill="#161b22" />

          {/* G Accent Base */}
          <rect x="52" y="80" width="32" height="14" rx="4" fill="url(#logo1_amberGrad)" />
          
          {/* Glowing Green Balcony Plant Dot */}
          <circle cx="86" cy="34" r="6" fill="url(#logo1_greenGrad)" />
        </svg>
      )}

      {/* ── Concept 2: Glowing Sunset Terrace Shield ────────────────────── */}
      {concept === 2 && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0, filter: "drop-shadow(0 4px 14px rgba(245, 158, 11, 0.35))" }}
        >
          <defs>
            <linearGradient id="logo2_bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#0d1117" />
            </linearGradient>
            <linearGradient id="logo2_terracotta" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Shield Badge Background */}
          <path d="M60 10 L102 28 V65 C102 90 60 110 60 110 C60 110 18 90 18 65 V28 L60 10 Z" fill="url(#logo2_bg)" stroke="rgba(234, 88, 12, 0.5)" strokeWidth="3" />

          {/* Building Facade */}
          <rect x="36" y="38" width="48" height="52" rx="6" fill="url(#logo2_terracotta)" />
          
          {/* Windows Grid */}
          <rect x="44" y="46" width="12" height="12" rx="3" fill="#ffffff" opacity="0.9" />
          <rect x="64" y="46" width="12" height="12" rx="3" fill="#ffffff" opacity="0.9" />
          <rect x="44" y="66" width="12" height="18" rx="2" fill="#ffffff" opacity="0.9" />
          <rect x="64" y="66" width="12" height="18" rx="2" fill="#ffffff" opacity="0.9" />

          {/* Golden Roof Crown Spark */}
          <circle cx="60" cy="25" r="5" fill="#fef08a" />
        </svg>
      )}

      {/* ── Concept 3: Minimalist Modern Isometric Co-Living Cube ───────── */}
      {concept === 3 && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0, filter: "drop-shadow(0 6px 16px rgba(234, 88, 12, 0.35))" }}
        >
          <defs>
            <linearGradient id="cube_top" x1="20" y1="20" x2="100" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="cube_left" x1="20" y1="40" x2="60" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>
            <linearGradient id="cube_right" x1="60" y1="40" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>

          {/* Top Face */}
          <polygon points="60,16 102,38 60,60 18,38" fill="url(#cube_top)" />
          {/* Left Face (Terracotta Building Wall) */}
          <polygon points="18,38 60,60 60,104 18,82" fill="url(#cube_left)" />
          {/* Right Face (Lush Emerald Balcony Wall) */}
          <polygon points="60,60 102,38 102,82 60,104" fill="url(#cube_right)" />

          {/* Windows Cutouts on Left Face */}
          <polygon points="28,52 46,61 46,74 28,65" fill="#ffffff" opacity="0.85" />
          {/* Windows Cutouts on Right Face */}
          <polygon points="74,61 92,52 92,65 74,74" fill="#ffffff" opacity="0.85" />
        </svg>
      )}

      {/* Logotype Text */}
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <div style={{ fontSize: `${size * 0.52}px`, fontWeight: 800, letterSpacing: "-0.5px" }}>
            <span
              style={{
                color: "transparent",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                backgroundImage: "linear-gradient(90deg, #f59e0b, #ea580c)",
              }}
            >
              PG
            </span>
            <span style={{ color: textColor }}>mate</span>
          </div>
          {showTagline && (
            <div style={{ fontSize: `${size * 0.2}px`, fontWeight: 600, color: taglineColor, marginTop: "2px", letterSpacing: "0.2px" }}>
              Smart PG Management
            </div>
          )}
        </div>
      )}
    </div>
  );
}
