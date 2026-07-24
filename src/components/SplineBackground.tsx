"use client";

import MotionBackground from "./MotionBackground";

/**
 * SplineBackground — legacy export forwarder to MotionBackground.
 * Replaced Spline WebGL with high-performance Framer Motion ambient background.
 */
export default function SplineBackground() {
  return <MotionBackground />;
}
