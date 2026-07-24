"use client";

import { motion } from "framer-motion";

/**
 * MotionBackground — Sleek Premium Black Obsidian Canvas (#0d1117).
 * Glowing ambient sunbeams with golden amber (#f59e0b), sunset terracotta (#ea580c),
 * and lush balcony plant green (#16a34a).
 */
export default function MotionBackground() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        backgroundColor: "#0d1117",
      }}
    >
      {/* Glowing Golden Amber Ambient Orb */}
      <motion.div
        animate={{
          x: [0, 50, -40, 0],
          y: [0, -50, 40, 0],
          scale: [1, 1.15, 0.92, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          top: "-15%",
          left: "35%",
          width: "650px",
          height: "650px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.18), transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* Glowing Terracotta Ambient Orb */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 50, -40, 0],
          scale: [1, 0.92, 1.12, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          top: "30%",
          left: "-10%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 60% 50%, rgba(234, 88, 12, 0.16), transparent 70%)",
          filter: "blur(95px)",
        }}
      />

      {/* Lush Green Balcony Plant Glow */}
      <motion.div
        animate={{
          x: [0, 35, -30, 0],
          y: [0, -35, 50, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          bottom: "10%",
          right: "-5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, rgba(22, 163, 74, 0.14), transparent 65%)",
          filter: "blur(85px)",
        }}
      />

      {/* Subtle Grid overlay for architectural depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.8,
        }}
      />
    </div>
  );
}
