/**
 * WelcomeBack — warm amber "Welcome back, {name}!" overlay for returning users.
 *
 * Renders as a full-screen overlay that:
 *   1. Fades + scales in over 600ms (warm amber glow — "light turning on")
 *   2. Holds for ~1.2s so the user can read it
 *   3. Fades out over 500ms to reveal the page beneath
 *
 * Design intent: soft golden warmth — like arriving home and turning on a familiar lamp.
 * NOT a loading screen — content beneath is already rendered and interactive.
 *
 * Props:
 *   name      — user's first name (falls back to "there" if empty)
 *   onDone    — callback fired when the animation completes (so parent can unrender it)
 */
"use client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

interface WelcomeBackProps {
  name?: string;
  onDone: () => void;
}

export function WelcomeBack({ name, onDone }: WelcomeBackProps) {
  const [visible, setVisible] = useState(true);
  const shouldReduce = useReducedMotion();

  const greeting = name ? `Welcome back, ${name}!` : "Welcome back!";

  useEffect(() => {
    // Total animation: 600ms in + 1200ms hold + 500ms out = ~2.3s
    const holdTimer = setTimeout(
      () => setVisible(false),
      shouldReduce ? 600 : 1800 // shorter hold if reduced motion
    );
    return () => clearTimeout(holdTimer);
  }, [shouldReduce]);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="welcome-back"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            // Enter: 600ms ease-out; Exit: 500ms ease-in
            duration: shouldReduce ? 0.15 : 0.6,
            ease: visible ? "easeOut" : "easeIn",
          }}
          style={{
            // Full-screen overlay — sits above everything, pointer-events off so
            // underlying content stays immediately clickable mid-animation
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // Warm amber radial glow — "familiar room, lamp turning on"
            background:
              "radial-gradient(ellipse at center, rgba(251, 191, 36, 0.18) 0%, rgba(245, 158, 11, 0.10) 40%, rgba(15, 23, 42, 0.92) 75%)",
          }}
        >
          {/* Ambient warm ring */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.08, opacity: 0 }}
            transition={{ duration: shouldReduce ? 0.1 : 0.55, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: "480px",
              height: "480px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* Greeting text */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduce ? 0 : 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: shouldReduce ? 0 : -8, scale: 0.98 }}
            transition={{ duration: shouldReduce ? 0.1 : 0.5, delay: shouldReduce ? 0 : 0.1, ease: "easeOut" }}
            style={{
              position: "relative",
              textAlign: "center",
              zIndex: 1,
            }}
          >
            {/* Warm house icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: shouldReduce ? 0 : 0.15, ease: "easeOut" }}
              style={{
                fontSize: "2.5rem",
                marginBottom: "1rem",
                filter: "drop-shadow(0 0 12px rgba(251,191,36,0.6))",
              }}
            >
              🏠
            </motion.div>

            <div
              style={{
                fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
                fontWeight: 700,
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
                // Warm golden gradient text
                background: "linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #fbbf24 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
                marginBottom: "0.5rem",
              }}
            >
              {greeting}
            </div>

            <div
              style={{
                fontSize: "1rem",
                color: "rgba(253, 230, 138, 0.7)",
                fontWeight: 400,
                letterSpacing: "0.2px",
              }}
            >
              Your PG dashboard is ready
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
