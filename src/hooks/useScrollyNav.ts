/**
 * useScrollyNav — tracks scroll depth to apply sticky-header polish.
 * Returns `isScrolled` (true once user scrolls past `threshold` px).
 * Use to add shadow/blur to the navbar on scroll.
 */
"use client";
import { useState, useEffect } from "react";

export function useScrollyNav(threshold = 40) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > threshold);
    }
    // Passive listener — never blocks scroll on mobile
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { isScrolled };
}
