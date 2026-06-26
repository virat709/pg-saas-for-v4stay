/**
 * AnimatedSection — reusable scroll-reveal wrapper.
 *
 * Uses the native IntersectionObserver API (no extra lib needed).
 * Triggers ONCE per element — does not re-animate on scroll-up.
 * Respects prefers-reduced-motion: skips transform, only fades in instantly.
 *
 * Props:
 *   delay     — stagger offset in ms (default 0)
 *   className — forwarded to the wrapper div
 *   style     — forwarded to the wrapper div
 *   children  — content to reveal
 */
"use client";
import { useEffect, useRef, useState, CSSProperties, ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;       // stagger delay in ms
  className?: string;
  style?: CSSProperties;
}

export function AnimatedSection({
  children,
  delay = 0,
  className,
  style,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // Track reduced-motion in state to avoid SSR hydration mismatch.
  // Defaults to false on the server; syncs on mount.
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mql.matches);

    // Listen for changes (e.g. user toggles OS preference while page is open)
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (prefersReduced) {
            // Instant reveal — no transform, just show
            setVisible(true);
          } else {
            // Respect stagger delay before showing
            setTimeout(() => setVisible(true), delay);
          }
          // Trigger once only — unobserve after first intersection
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 } // trigger when 12% of the element is in view
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, prefersReduced]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        // Reserve space before animation (no layout shift)
        opacity: visible ? 1 : 0,
        transform:
          visible || prefersReduced
            ? "translateY(0)"
            : "translateY(28px)",
        transition: prefersReduced
          ? "opacity 0.2s ease-out"
          : "opacity 0.6s ease-out, transform 0.6s ease-out",
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
