"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Load Spline only in the browser (ssr: false) to prevent the
// "async Client Component" crash caused by @splinetool/react-spline/next
// being imported inside a "use client" module.
const SplineScene = dynamic(
  () => import("@splinetool/react-spline").then((m) => m.default),
  { ssr: false, loading: () => null }
);

export default function SplineBackground() {
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
        width: "100%",
        height: "100%",
      }}
    >
      <Suspense fallback={null}>
        <SplineScene
          scene="https://prod.spline.design/dMlOZZ8vJrCgbMf6/scene.splinecode"
        />
      </Suspense>
    </div>
  );
}
