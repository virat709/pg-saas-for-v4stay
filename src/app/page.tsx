"use client";

import Link from "next/link";
import SplineBackground from "@/components/SplineBackground";
import { HeroEntrance } from "@/components/animations/HeroEntrance";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { useScrollyNav } from "@/hooks/useScrollyNav";

export default function Home() {
  const { isScrolled } = useScrollyNav(40);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── Static Background Gradient ─────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% -20%, rgba(16, 185, 129, 0.15), transparent 60%), radial-gradient(circle at -20% 50%, rgba(56, 189, 248, 0.1), transparent 50%)",
        }}
      />

      {/* ── Spline 3D Background (lazy, browser-only) ─────────────────── */}
      <SplineBackground />

      {/* ── Navbar — fades in last (index 5), gains shadow on scroll ───── */}
      <HeroEntrance index={5} style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem 5%",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(16px)",
            // Scroll-aware shadow — transitions smoothly via CSS
            boxShadow: isScrolled
              ? "0 4px 24px rgba(0,0,0,0.35)"
              : "none",
            transition: "box-shadow 0.35s ease",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#fff",
              display: "flex",
              alignItems: "baseline",
              gap: "6px",
              letterSpacing: "-0.5px",
            }}
          >
            v4stay{" "}
            <span
              style={{
                fontSize: "0.875rem",
                color: "#10b981",
                fontWeight: 700,
                padding: "2px 6px",
                background: "rgba(16,185,129,0.1)",
                borderRadius: "4px",
              }}
            >
              PG
            </span>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link
              href="/login"
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#e2e8f0",
                fontWeight: 500,
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.2s",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              Login
            </Link>
            <Link
              href="/register"
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#0f172a",
                fontWeight: 600,
                backgroundColor: "#10b981",
                boxShadow: "0 0 15px rgba(16,185,129,0.4)",
                transition: "all 0.2s",
              }}
            >
              Register PG
            </Link>
          </div>
        </nav>
      </HeroEntrance>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "6rem 2rem 4rem",
          textAlign: "center",
        }}
      >
        {/* Badge — arrives first */}
        <HeroEntrance index={0}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "2rem",
              padding: "8px 16px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              color: "#10b981",
              borderRadius: "30px",
              fontSize: "0.875rem",
              fontWeight: 600,
              boxShadow: "0 0 20px rgba(16,185,129,0.1)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                boxShadow: "0 0 8px #10b981",
              }}
            />
            Smart PG Management System
          </div>
        </HeroEntrance>

        {/* Headline — slides up slightly later */}
        <HeroEntrance index={1}>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
              fontWeight: 800,
              maxWidth: "900px",
              lineHeight: 1.1,
              marginBottom: "1.5rem",
              color: "#fff",
              letterSpacing: "-1px",
            }}
          >
            Monetize and Scale Your PG with{" "}
            <span
              style={{
                color: "transparent",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                backgroundImage: "linear-gradient(90deg, #34d399, #10b981)",
              }}
            >
              Smart Automation
            </span>
          </h1>
        </HeroEntrance>

        {/* Sub-headline */}
        <HeroEntrance index={2}>
          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              color: "#94a3b8",
              maxWidth: "700px",
              marginBottom: "3.5rem",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Maximize occupancy, automate rent collection, and deliver a premium
            tenant experience. Stop managing spreadsheets and start scaling your
            real estate revenue.
          </p>
        </HeroEntrance>

        {/* CTA buttons */}
        <HeroEntrance index={3}>
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link
              href="/register"
              style={{
                padding: "1.25rem 2.5rem",
                fontSize: "1.125rem",
                fontWeight: 600,
                borderRadius: "12px",
                backgroundColor: "#10b981",
                color: "#0f172a",
                textDecoration: "none",
                boxShadow:
                  "0 10px 25px -5px rgba(16, 185, 129, 0.4), 0 8px 10px -6px rgba(16, 185, 129, 0.1)",
                transition: "transform 0.2s",
              }}
            >
              Start Scaling Today
            </Link>
            <Link
              href="/login"
              style={{
                padding: "1.25rem 2.5rem",
                fontSize: "1.125rem",
                fontWeight: 500,
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.03)",
                color: "#f8fafc",
                textDecoration: "none",
                backdropFilter: "blur(10px)",
                transition: "background 0.2s",
              }}
            >
              View Demo Dashboard
            </Link>
          </div>
        </HeroEntrance>

        {/* ── Feature Cards — scroll-revealed, staggered ────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            marginTop: "8rem",
            maxWidth: "1100px",
            width: "100%",
            textAlign: "left",
          }}
        >
          {/* Card 1 — Occupancy */}
          <AnimatedSection delay={0}>
            <div
              style={{
                height: "100%",
                padding: "2.5rem",
                background:
                  "linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "rgba(16, 185, 129, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  color: "#10b981",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.75rem" }}>
                Maximize Occupancy
              </h3>
              <p style={{ color: "#94a3b8", lineHeight: 1.6, fontSize: "0.95rem" }}>
                Get a bird's-eye view of your property. Instantly identify vacant beds, optimize room
                allocations, and reduce revenue leakage.
              </p>
            </div>
          </AnimatedSection>

          {/* Card 2 — Cash Flow */}
          <AnimatedSection delay={90}>
            <div
              style={{
                height: "100%",
                padding: "2.5rem",
                background:
                  "linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "rgba(56, 189, 248, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  color: "#38bdf8",
                  border: "1px solid rgba(56,189,248,0.2)",
                }}
              >
                {/* Banknote / cash diagram icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Outer banknote rectangle */}
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  {/* Centre denomination circle */}
                  <circle cx="12" cy="12" r="2" />
                  {/* Left inner column — decorative bill detail */}
                  <path d="M6 6v12" />
                  {/* Right inner column */}
                  <path d="M18 6v12" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.75rem" }}>
                Automated Cash Flow
              </h3>
              <p style={{ color: "#94a3b8", lineHeight: 1.6, fontSize: "0.95rem" }}>
                Track dues with precision. Record partial payments, monitor expected monthly
                collections, and automatically generate digital receipts.
              </p>
            </div>
          </AnimatedSection>

          {/* Card 3 — Tenant Portal */}
          <AnimatedSection delay={180}>
            <div
              style={{
                height: "100%",
                padding: "2.5rem",
                background:
                  "linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "rgba(168, 85, 247, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  color: "#a855f7",
                  border: "1px solid rgba(168,85,247,0.2)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.75rem" }}>
                Premium Tenant Portal
              </h3>
              <p style={{ color: "#94a3b8", lineHeight: 1.6, fontSize: "0.95rem" }}>
                Provide a professional experience. Tenants get a secure magic link to view their
                rent status and instantly raise maintenance tickets.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <AnimatedSection>
        <footer
          style={{
            position: "relative",
            zIndex: 10,
            padding: "2rem",
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            color: "#64748b",
            fontSize: "0.875rem",
          }}
        >
          © {new Date().getFullYear()} v4stay PG Management. Elevating the standard of living.
        </footer>
      </AnimatedSection>
    </div>
  );
}
