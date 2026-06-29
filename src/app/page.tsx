"use client";

import { useState } from "react";
import Link from "next/link";
import SplineBackground from "@/components/SplineBackground";
import Logo from "@/components/Logo";
import { HeroEntrance } from "@/components/animations/HeroEntrance";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { useScrollyNav } from "@/hooks/useScrollyNav";

export default function Home() {
  const { isScrolled } = useScrollyNav(40);
  const [propertyCount, setPropertyCount] = useState(1);

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
          <Logo size={30} variant="light" showTagline={false} />
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <a
              href="#features"
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#e2e8f0",
                fontWeight: 500,
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
            >
              Features
            </a>
            <a
              href="#pricing"
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#e2e8f0",
                fontWeight: 500,
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
            >
              Pricing
            </a>
            <a
              href="#contact"
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#e2e8f0",
                fontWeight: 500,
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
            >
              Contact
            </a>
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
                backgroundColor: "#00c49f",
                boxShadow: "0 0 15px rgba(0,196,159,0.4)",
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
              backgroundColor: "rgba(0, 196, 159, 0.1)",
              border: "1px solid rgba(0, 196, 159, 0.2)",
              color: "#00c49f",
              borderRadius: "30px",
              fontSize: "0.875rem",
              fontWeight: 600,
              boxShadow: "0 0 20px rgba(0,196,159,0.1)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#00c49f",
                boxShadow: "0 0 8px #00c49f",
              }}
            />
            Smart PG Management System
          </div>
        </HeroEntrance>

        {/* Headline — slides up slightly later */}
        <HeroEntrance index={1}>
          <h1
            style={{
              fontSize: "clamp(2.2rem, 6vw, 4rem)",
              fontWeight: 800,
              maxWidth: "950px",
              lineHeight: 1.15,
              marginBottom: "1.5rem",
              color: "#fff",
              letterSpacing: "-1px",
            }}
          >
            PGmate: The Smart PG Management System to{" "}
            <span
              style={{
                color: "transparent",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                backgroundImage: "linear-gradient(90deg, #1e6091, #00c49f)",
              }}
            >
              Scale Your Property Business
            </span>
          </h1>
        </HeroEntrance>

        {/* Sub-headline */}
        <HeroEntrance index={2}>
          <p
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
              color: "#94a3b8",
              maxWidth: "800px",
              marginBottom: "3.5rem",
              lineHeight: 1.65,
              fontWeight: 400,
            }}
          >
            PGmate is an automated Paying Guest (PG) management software built for PG owners, hostel managers, and co-living operators. We solve the chaos of manual tracking by automating rent collections, room allocations, security deposits, and tenant complaints—replacing messy spreadsheets and WhatsApp messages with a unified, professional dashboard that maximizes occupancy.
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
                backgroundColor: "#00c49f",
                color: "#0f172a",
                textDecoration: "none",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 196, 159, 0.4), 0 8px 10px -6px rgba(0, 196, 159, 0.1)",
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
        <section id="features" style={{ scrollMarginTop: "100px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "8rem" }}>
          <div style={{ display: "inline-block", padding: "0.35rem 1rem", borderRadius: "99px", backgroundColor: "rgba(0,196,159,0.12)", border: "1px solid rgba(0,196,159,0.25)", color: "#00c49f", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.25rem", letterSpacing: "0.05em", textAlign: "center" }}>
            FEATURES
          </div>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem", letterSpacing: "-0.5px", textAlign: "center" }}>
            Everything You Need to Manage Your PG
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "550px", margin: "0 auto 3rem auto", lineHeight: 1.6, textAlign: "center" }}>
            Ditch the spreadsheets. Automate collections, track room availability, and support tenants in one platform.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
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
                  background: "rgba(0, 196, 159, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  color: "#00c49f",
                  border: "1px solid rgba(0,196,159,0.2)",
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
          
          {/* Features -> Pricing Link */}
          <div style={{ textAlign: "center", marginTop: "3.5rem" }}>
            <a
              href="#pricing"
              style={{
                color: "#00c49f",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "1.05rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "transform 0.2s",
              }}
            >
              Explore our subscription pricing plans ➔
            </a>
          </div>
        </section>
      </main>

      {/* ── Pricing Section ─────────────────────────────────────────────── */}
      <AnimatedSection delay={150}>
        <div
          id="pricing"
          style={{
            marginTop: "7rem",
            textAlign: "center",
          }}
        >
          <div style={{ display: "inline-block", padding: "0.35rem 1rem", borderRadius: "99px", backgroundColor: "rgba(0,196,159,0.12)", border: "1px solid rgba(0,196,159,0.25)", color: "#00c49f", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.25rem", letterSpacing: "0.05em" }}>
            PRICING
          </div>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem", letterSpacing: "-0.5px" }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "480px", margin: "0 auto 3rem", lineHeight: 1.6 }}>
            One plan. Every feature included. No hidden fees, no per-tenant charges.
          </p>

          {/* Dynamic Property Count Selector */}
          <div
            style={{
              maxWidth: "400px",
              margin: "0 auto 3rem auto",
              padding: "1.5rem",
              background: "rgba(30, 41, 59, 0.5)",
              borderRadius: "20px",
              border: "1px dashed rgba(0, 196, 159, 0.4)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              backdropFilter: "blur(8px)",
              textAlign: "center"
            }}
          >
            <label style={{ fontSize: "0.95rem", fontWeight: 600, display: "block", marginBottom: "0.75rem", color: "#f8fafc" }}>
              How many properties do you want to manage?
            </label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
              <button
                type="button"
                onClick={() => setPropertyCount(prev => Math.max(1, prev - 1))}
                style={{
                  padding: "0.25rem",
                  fontSize: "1.25rem",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                -
              </button>
              <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#00c49f" }}>{propertyCount}</span>
              <button
                type="button"
                onClick={() => setPropertyCount(prev => prev + 1)}
                style={{
                  padding: "0.25rem",
                  fontSize: "1.25rem",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                +
              </button>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.75rem", marginBottom: 0 }}>
              {propertyCount === 1 ? "Standard Single Property Plan" : `Enterprise Option: 1 Base PG + ${propertyCount - 1} Additional PG Addon(s)`}
            </p>
          </div>

          {/* Pricing cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", maxWidth: "800px", margin: "0 auto", textAlign: "left" }}>
            
            {/* 6 Month Plan */}
            <div
              style={{
                position: "relative",
                width: "100%",
                background: "rgba(30,41,59,0.6)",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "2.5rem",
                backdropFilter: "blur(12px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h3 style={{ color: "#f8fafc", fontSize: "1.3rem", marginBottom: "0.25rem" }}>PGmate Starter — 6 Months</h3>
              <div style={{ color: "#cbd5e1", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Up to {propertyCount} propert{propertyCount === 1 ? "y" : "ies"} limit
              </div>
              <div style={{ fontSize: "2.75rem", fontWeight: 900, color: "#f8fafc", lineHeight: 1, margin: "1rem 0" }}>
                ₹{(6999 + (propertyCount - 1) * 4999).toLocaleString()}
              </div>
              {propertyCount > 1 && (
                <div style={{ color: "#cbd5e1", fontSize: "0.8rem", marginBottom: "1.5rem", marginTop: "-0.5rem" }}>
                  ₹6,999 base + {propertyCount - 1} × ₹4,999 addons
                </div>
              )}
              
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1 }}>
                {[
                  "Unlimited Tenants & Rooms",
                  "Payment Tracking & Receipts",
                  "Tenant Portal (Magic Link)",
                  "Complaints & Notice Board",
                  "Priority Support",
                ].map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.9rem" }}>
                    <span style={{ color: "#cbd5e1", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>✓</span>
                    <span style={{ color: "#cbd5e1" }}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "center",
                  padding: "0.9rem",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#f8fafc",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.2)",
                  transition: "background 0.2s",
                }}
              >
                Start Now
              </Link>
            </div>

            {/* 1 Year Plan (Highlighted) */}
            <div
              style={{
                position: "relative",
                width: "100%",
                background: "linear-gradient(145deg, rgba(30,41,59,0.85), rgba(15,23,42,0.95))",
                borderRadius: "24px",
                border: "2px solid #00c49f",
                boxShadow: "0 0 60px rgba(0,196,159,0.12), 0 20px 40px rgba(0,0,0,0.4)",
                padding: "2.5rem",
                backdropFilter: "blur(12px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Popular badge */}
              <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg, #00c49f, #38bdf8)", color: "#0f172a", padding: "5px 20px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                BEST VALUE
              </div>

              <h3 style={{ color: "#f8fafc", fontSize: "1.3rem", marginBottom: "0.25rem" }}>PGmate Premium — 1 Year</h3>
              <div style={{ color: "#00c49f", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Up to {propertyCount} propert{propertyCount === 1 ? "y" : "ies"} limit
              </div>
              <div style={{ fontSize: "2.75rem", fontWeight: 900, color: "#00c49f", lineHeight: 1, margin: "1rem 0" }}>
                ₹{(11999 + (propertyCount - 1) * 6999).toLocaleString()}
              </div>
              {propertyCount > 1 ? (
                <div style={{ color: "#00c49f", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.5rem", marginTop: "-0.5rem" }}>
                  ₹11,999 base + {propertyCount - 1} × ₹6,999 addons
                </div>
              ) : (
                <div style={{ color: "#00c49f", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem" }}>Save ₹1,999 compared to 6-month plan</div>
              )}

              <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1 }}>
                {[
                  "Unlimited Tenants & Rooms",
                  "Payment Tracking & Receipts",
                  "Tenant Portal (Magic Link)",
                  "Complaints & Notice Board",
                  "Meal Menu Management",
                  "Rent Reminder Emails",
                  "Revenue Analytics",
                  "CSV Export",
                  "Priority Support",
                ].map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.9rem" }}>
                    <span style={{ color: "#00c49f", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>✓</span>
                    <span style={{ color: "#cbd5e1" }}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "center",
                  padding: "0.9rem",
                  borderRadius: "12px",
                  backgroundColor: "#00c49f",
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  boxShadow: "0 0 25px rgba(0,196,159,0.35)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                Start Now
              </Link>
            </div>
          </div>
          
          {/* Pricing -> Contact Link */}
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
              Need a plan for more properties or custom enterprise setup?{" "}
              <a href="#contact" style={{ color: "#00c49f", textDecoration: "none", fontWeight: 600 }}>
                Contact our sales team
              </a>
            </span>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Contact Us Section ─────────────────────────────────────────── */}
      <AnimatedSection delay={200}>
        <div
          id="contact"
          style={{
            scrollMarginTop: "100px",
            marginTop: "6rem",

            marginBottom: "4rem",
            padding: "3rem",
            background: "rgba(15, 23, 42, 0.6)",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.05)",
            textAlign: "center",
            maxWidth: "800px",
            margin: "6rem auto 4rem auto",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#f8fafc", marginBottom: "1rem" }}>
            Get in Touch
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.125rem", marginBottom: "2rem" }}>
            Have questions or need help setting up your PG? We're here to help.
          </p>
          <a
            href="mailto:v4services.in@gmail.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem 2rem",
              fontSize: "1.125rem",
              fontWeight: 600,
              borderRadius: "12px",
              backgroundColor: "rgba(0, 196, 159, 0.1)",
              color: "#00c49f",
              border: "1px solid rgba(0, 196, 159, 0.2)",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            v4services.in@gmail.com
          </a>
        </div>
      </AnimatedSection>

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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>© {new Date().getFullYear()} PGmate. Manage. Simplify. Grow.</span>
          <span>Contact us: <a href="mailto:v4services.in@gmail.com" style={{ color: "#00c49f", textDecoration: "none" }}>v4services.in@gmail.com</a></span>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/about" style={{ color: "#64748b", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#00c49f"} onMouseOut={(e) => e.currentTarget.style.color = "#64748b"}>About Us</Link>
            <span>|</span>
            <Link href="/privacy-policy" style={{ color: "#64748b", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#00c49f"} onMouseOut={(e) => e.currentTarget.style.color = "#64748b"}>Privacy Policy</Link>
            <span>|</span>
            <Link href="/terms-and-conditions" style={{ color: "#64748b", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#00c49f"} onMouseOut={(e) => e.currentTarget.style.color = "#64748b"}>Terms & Conditions</Link>
            <span>|</span>
            <Link href="/refund-policy" style={{ color: "#64748b", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#00c49f"} onMouseOut={(e) => e.currentTarget.style.color = "#64748b"}>Refund Policy</Link>
            <span>|</span>
            <Link href="/contact-us" style={{ color: "#64748b", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#00c49f"} onMouseOut={(e) => e.currentTarget.style.color = "#64748b"}>Contact Us</Link>
          </div>
        </footer>
      </AnimatedSection>
    </div>
  );
}
