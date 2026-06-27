"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: "none",
          background: "radial-gradient(circle at 50% 40%, rgba(239, 68, 68, 0.06), transparent 60%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.75rem" }}>
          Something went wrong
        </h1>

        <p style={{ color: "#94a3b8", fontSize: "1rem", maxWidth: "420px", lineHeight: 1.6, marginBottom: "2rem" }}>
          An unexpected error occurred. Our team has been notified. Please try again or go back to the dashboard.
        </p>

        {error?.digest && (
          <p style={{ color: "#475569", fontSize: "0.75rem", marginBottom: "1.5rem", fontFamily: "monospace" }}>
            Error ID: {error.digest}
          </p>
        )}

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              backgroundColor: "#00c49f",
              color: "#0f172a",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(0,196,159,0.3)",
            }}
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#e2e8f0",
              fontWeight: 600,
              textDecoration: "none",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          >
            Go to Dashboard
          </Link>
        </div>

        <p style={{ marginTop: "3rem", color: "#475569", fontSize: "0.875rem" }}>
          © {new Date().getFullYear()} PGmate · v4stay
        </p>
      </div>
    </div>
  );
}
