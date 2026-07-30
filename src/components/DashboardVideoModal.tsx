"use client";

import { useState } from "react";

interface DashboardVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardVideoModal({ isOpen, onClose }: DashboardVideoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "900px",
          backgroundColor: "#1e293b",
          borderRadius: "16px",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.2)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem", color: "#f59e0b" }}>🎬</span>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#f8fafc" }}>
              PGmate Dashboard Walkthrough
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#cbd5e1",
              fontSize: "1.25rem",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
            aria-label="Close video modal"
          >
            ✕
          </button>
        </div>

        {/* Video Container */}
        <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", backgroundColor: "#000" }}>
          <iframe
            src="https://www.youtube.com/embed/Gb4M-gGC1ok?autoplay=1"
            title="PGmate Dashboard Tutorial Video"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export function DashboardVideoSection() {
  return (
    <section
      id="dashboard-video"
      style={{
        width: "100%",
        maxWidth: "1000px",
        margin: "4rem auto",
        padding: "0 1.5rem",
      }}
    >
      <div
        style={{
          borderRadius: "24px",
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))",
          border: "1px solid rgba(245, 158, 11, 0.25)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(245, 158, 11, 0.1)",
          padding: "2rem",
          overflow: "hidden",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "6px 14px",
              borderRadius: "20px",
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              color: "#fbbf24",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
              border: "1px solid rgba(245, 158, 11, 0.3)",
            }}
          >
            <span>▶️</span> Video Tutorial
          </div>
          <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 700, color: "#ffffff", margin: "0 0 0.5rem 0" }}>
            See How The PGmate Dashboard Works
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1rem", maxWidth: "650px", margin: "0 auto" }}>
            Watch our step-by-step video guide to discover how easy it is to manage rooms, collect rent, track expenses, and view analytics.
          </p>
        </div>

        {/* Embedded Responsive Player */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "#0d1117",
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/Gb4M-gGC1ok"
            title="PGmate Dashboard Video Guide"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

export function DashboardVideoBannerCard() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        style={{
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(234, 88, 12, 0.08))",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              flexShrink: 0,
            }}
          >
            🎬
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text-main, #f8fafc)" }}>
              Watch Dashboard Video Walkthrough
            </h4>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-muted, #94a3b8)" }}>
              New to PGmate? Learn how to manage rooms, rent collections & tenants in under 3 minutes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: "0.6rem 1.25rem",
            borderRadius: "10px",
            backgroundColor: "#ea580c",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "0.9rem",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c2410c")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ea580c")}
        >
          <span>▶️</span> Watch Video Guide
        </button>
      </div>

      <DashboardVideoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
