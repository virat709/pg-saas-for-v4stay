"use client";

import React from "react";

interface LogoProps {
  variant?: "light" | "dark" | "auto"; // "light" is white text, "dark" is navy text, "auto" uses theme variables
  showText?: boolean;
  showTagline?: boolean;
  size?: number; // size in pixels of the SVG icon
}

export default function Logo({
  variant = "light",
  showText = true,
  showTagline = false,
  size = 36,
}: LogoProps) {
  const textColor = 
    variant === "light" 
      ? "#ffffff" 
      : variant === "dark" 
      ? "#0f172a" 
      : "var(--text-main)";

  const taglineColor = 
    variant === "light" 
      ? "rgba(255,255,255,0.6)" 
      : variant === "dark" 
      ? "#64748b" 
      : "var(--text-muted)";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", verticalAlign: "middle" }}>
      {/* SVG Icon — Building/Home mark for PG management */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="pgGrad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00c49f" />
            <stop offset="50%" stopColor="#1e6091" />
            <stop offset="100%" stopColor="#154c75" />
          </linearGradient>
        </defs>

        {/* Building outline */}
        <rect
          x="25" y="35" width="70" height="60" rx="6"
          stroke="url(#pgGrad)" strokeWidth="5" fill="none"
        />
        {/* Roof / top */}
        <path
          d="M20 38 L60 15 L100 38"
          stroke="url(#pgGrad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
        {/* Door */}
        <rect
          x="48" y="65" width="24" height="30" rx="3"
          stroke="url(#pgGrad)" strokeWidth="4" fill="none"
        />
        {/* Windows */}
        <rect
          x="35" y="47" width="16" height="12" rx="2"
          stroke="url(#pgGrad)" strokeWidth="3.5" fill="none"
        />
        <rect
          x="69" y="47" width="16" height="12" rx="2"
          stroke="url(#pgGrad)" strokeWidth="3.5" fill="none"
        />
      </svg>

      {/* Logotype Text */}
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <div style={{ fontSize: `${size * 0.5}px`, fontWeight: 700, letterSpacing: "-0.5px" }}>
            <span style={{ color: "#00c49f" }}>PG</span>
            <span style={{ color: textColor }}>mate</span>
          </div>
          {showTagline && (
            <div style={{ fontSize: `${size * 0.2}px`, fontWeight: 500, color: taglineColor, marginTop: "2px", letterSpacing: "0.2px" }}>
              Smart PG Management
            </div>
          )}
        </div>
      )}
    </div>
  );
}

