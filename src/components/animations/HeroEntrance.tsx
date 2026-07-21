/**
 * HeroEntrance — staggered fade+slide-up for hero elements on page load.
 *
 * Uses a CSS @keyframes animation (no framer-motion dependency).
 * Each child receives an `index` prop to compute its stagger delay:
 *   delay = 80ms + index * 100ms, so elements arrive one after another.
 *
 * Respects prefers-reduced-motion via the CSS media query in globals.css.
 *
 * Usage:
 *   <HeroEntrance index={0}><Badge /></HeroEntrance>
 *   <HeroEntrance index={1}><h1>Headline</h1></HeroEntrance>
 */
"use client";
import { ReactNode, CSSProperties } from "react";

interface HeroEntranceProps {
  children: ReactNode;
  index?: number;       // stagger position (0 = first, 1 = second, etc.)
  className?: string;
  style?: CSSProperties;
}

export function HeroEntrance({
  children,
  index = 0,
  className,
  style,
}: HeroEntranceProps) {
  // 80ms head-start + 100ms per element, matching previous framer-motion timing
  const delayMs = 80 + index * 100;

  return (
    <>
      <style>{`
        @keyframes hero-entrance {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-entrance-el {
            animation-duration: 0.15s !important;
            animation-name: hero-entrance-reduced !important;
          }
        }
        @keyframes hero-entrance-reduced {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
      <div
        className={`hero-entrance-el${className ? ` ${className}` : ""}`}
        style={{
          animationName: "hero-entrance",
          animationDuration: "0.52s",
          animationTimingFunction: "ease-out",
          animationFillMode: "both",
          animationDelay: `${delayMs}ms`,
          ...style,
        }}
      >
        {children}
      </div>
    </>
  );
}

