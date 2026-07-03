"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = "pgmate-theme";

function getSystemPreference(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") return getSystemPreference();
  return mode;
}

function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", resolved);
  // Update meta theme-color for mobile browsers
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "dark" ? "#081225" : "#f8fafc");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const mode = stored && ["light", "dark", "system"].includes(stored) ? stored : "system";
    setThemeState(mode);
    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Listen for OS preference changes when in "system" mode
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const resolved = getSystemPreference();
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    // Cycle: light → dark → system → light
    setTheme(
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
    );
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
