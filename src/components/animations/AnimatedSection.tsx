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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check reduced-motion preference
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  }, [delay]);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
