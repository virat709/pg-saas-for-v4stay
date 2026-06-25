/**
 * HeroEntrance — staggered fade+slide-up for hero elements on page load.
 *
 * Uses Framer Motion for smooth GPU-accelerated entrance.
 * Each child receives an `index` prop to compute its stagger delay:
 *   delay = index * 100ms, so elements arrive one after another.
 *
 * Respects prefers-reduced-motion: skips translateY, only fades.
 *
 * Usage:
 *   <HeroEntrance index={0}><Badge /></HeroEntrance>
 *   <HeroEntrance index={1}><h1>Headline</h1></HeroEntrance>
 */
"use client";
import { motion, useReducedMotion } from "framer-motion";
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
  const shouldReduce = useReducedMotion();

  // Stagger: 100ms per element; first element enters at 80ms (feels immediate)
  const delay = 0.08 + index * 0.10;

  const variants = {
    hidden: {
      opacity: 0,
      // If reduced motion: skip the translateY, only animate opacity
      y: shouldReduce ? 0 : 22,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.div
      className={className}
      style={{ willChange: "opacity, transform", ...style }}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{
        duration: shouldReduce ? 0.15 : 0.52,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
