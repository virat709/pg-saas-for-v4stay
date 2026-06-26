"use client";

import React from "react";

interface LogoProps {
  variant?: "light" | "dark"; // "light" is white text for dark bg, "dark" is navy text for light bg
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
  const textColor = variant === "light" ? "#ffffff" : "var(--text-main)";
  const taglineColor = variant === "light" ? "rgba(255,255,255,0.6)" : "#64748b";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", verticalAlign: "middle" }}>
      {/* SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          {/* Blue-Teal Gradient for House */}
          <linearGradient id="houseGrad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e6091" />
            <stop offset="100%" stopColor="#00b4d8" />
          </linearGradient>
          {/* Teal Gradient for Checkmark */}
          <linearGradient id="checkGrad" x1="50" y1="60" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00c49f" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* House Roof (Thick Rounded Stroke) */}
        <path
          d="M 22 55 L 60 21 L 98 55"
          stroke="url(#houseGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* House Walls (curves at bottom-left, right wall is cut off/merged with checkmark) */}
        <path
          d="M 30 50 V 88 C 30 96 36 96 42 96 H 70"
          stroke="url(#houseGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Window Grid (4 small squares in attic area) */}
        <rect x="52" y="38" width="6" height="6" rx="1" fill="url(#houseGrad)" />
        <rect x="62" y="38" width="6" height="6" rx="1" fill="url(#houseGrad)" />
        <rect x="52" y="48" width="6" height="6" rx="1" fill="url(#houseGrad)" />
        <rect x="62" y="48" width="6" height="6" rx="1" fill="url(#houseGrad)" />

        {/* Bed Outline inside House */}
        {/* Headboard */}
        <path
          d="M 42 82 V 72"
          stroke="url(#houseGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Mattress/Frame */}
        <path
          d="M 44 76 H 74 C 77 76 78 77 78 80 V 82"
          stroke="url(#houseGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Pillow */}
        <rect x="47" y="72" width="9" height="4" rx="1" fill="url(#houseGrad)" />

        {/* Checkmark Accent on Right Side */}
        <path
          d="M 50 86 L 62 98 L 98 62"
          stroke="url(#checkGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Logotype Text */}
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <div style={{ fontSize: `${size * 0.58}px`, fontWeight: 700, letterSpacing: "-0.5px" }}>
            <span style={{ color: textColor }}>PG</span>
            <span style={{ color: "#00c49f" }}>mate</span>
          </div>
          {showTagline && (
            <div style={{ fontSize: `${size * 0.22}px`, fontWeight: 500, color: taglineColor, marginTop: "2px", letterSpacing: "0.2px" }}>
              Manage. Simplify. Grow.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
