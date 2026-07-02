"use client";

import { useEffect } from "react";

/**
 * Dynamically draws a colored dot on top of the current favicon.
 * Resets to the original favicon when count === 0.
 */
export function useFaviconBadge(unreadCount: number) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const draw = (originalHref: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = originalHref;

      img.onload = () => {
        ctx.drawImage(img, 0, 0, 32, 32);

        if (unreadCount > 0) {
          // Draw green pulsing dot in top-right corner
          const dotRadius = 7;
          const x = 32 - dotRadius - 1;
          const y = dotRadius + 1;

          // Outer glow ring
          ctx.beginPath();
          ctx.arc(x, y, dotRadius + 2, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(16, 185, 129, 0.35)";
          ctx.fill();

          // Solid dot
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
          ctx.fillStyle = "#10b981"; // emerald-500
          ctx.fill();

          // White border
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Apply new favicon
        let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = canvas.toDataURL("image/png");
      };

      // If image fails to load, just draw a plain dot on a transparent canvas
      img.onerror = () => {
        if (unreadCount > 0) {
          ctx.beginPath();
          ctx.arc(16, 16, 12, 0, 2 * Math.PI);
          ctx.fillStyle = "#10b981";
          ctx.fill();

          let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = canvas.toDataURL("image/png");
        }
      };
    };

    // Get original favicon href
    const originalLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    const originalHref = originalLink?.href || "/favicon.ico";

    draw(originalHref);

    // Cleanup: when component unmounts (user navigates away), no reset needed
  }, [unreadCount]);
}
