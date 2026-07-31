"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SplineBackground from "@/components/SplineBackground";
import Logo, { LogoConcept } from "@/components/Logo";
import { HeroEntrance } from "@/components/animations/HeroEntrance";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { useScrollyNav } from "@/hooks/useScrollyNav";
import CrmSheet from "@/components/CrmSheet";
import { DashboardVideoSection, DashboardVideoModal } from "@/components/DashboardVideoModal";

export default function Home() {
  const { isScrolled } = useScrollyNav(40);
  const [propertyCount, setPropertyCount] = useState(1);
  const [crmOpen, setCrmOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<LogoConcept>(1);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0d1117",
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
            "radial-gradient(circle at 50% -20%, rgba(245, 158, 11, 0.15), transparent 60%), radial-gradient(circle at -20% 50%, rgba(234, 88, 12, 0.1), transparent 50%)",
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
            padding: "1.25rem 5%",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "rgba(13, 17, 23, 0.85)",
            backdropFilter: "blur(16px)",
            boxShadow: isScrolled
              ? "0 4px 24px rgba(0,0,0,0.5)"
              : "none",
            transition: "box-shadow 0.35s ease",
          }}
        >
          <Logo size={34} variant="light" concept={1} showTagline={false} />
          
          {/* Desktop Nav Items (Hidden on Mobile) */}
          <div className="desktop-nav" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <a
              href="#features"
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#cbd5e1",
                fontWeight: 500,
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
            >
              Features
            </a>
            <a
              href="#dashboard-video"
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#f59e0b",
                fontWeight: 600,
                fontSize: "0.9rem",
                transition: "color 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <span>▶️</span> Video Guide
            </a>
            <a
              href="#pricing"
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#cbd5e1",
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
                color: "#cbd5e1",
                fontWeight: 500,
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
            >
              Contact
            </a>
            <button
              onClick={() => setCrmOpen(true)}
              title="Open CRM Sheet"
              aria-label="Open CRM Sheet"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.6rem",
                color: "#cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>📌</span>
            </button>
            <Link
              href="/demo"
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#f59e0b",
                fontWeight: 600,
                border: "1px solid rgba(245, 158, 11, 0.4)",
                transition: "all 0.2s",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
              }}
            >
              Live Demo
            </Link>
            <Link
              href="/login"
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#f8fafc",
                fontWeight: 500,
                border: "1px solid rgba(255, 255, 255, 0.15)",
                transition: "all 0.2s",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
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
                color: "#ffffff",
                fontWeight: 600,
                backgroundColor: "#ea580c",
                boxShadow: "0 4px 14px rgba(234, 88, 12, 0.4)",
                transition: "all 0.2s",
              }}
            >
              Register PG
            </Link>
          </div>

          {/* Mobile Nav Button trigger (Visible on Mobile only) */}
          <div className="mobile-nav-btn" style={{ display: "none", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={() => setCrmOpen(true)}
              title="Open CRM Sheet"
              aria-label="Open CRM Sheet"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.5rem",
                color: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>📌</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.5rem",
                color: "#e2e8f0",
                fontSize: "1.4rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ☰
            </button>
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
              backgroundColor: "rgba(245, 158, 11, 0.14)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#fbbf24",
              borderRadius: "30px",
              fontSize: "0.875rem",
              fontWeight: 600,
              boxShadow: "0 0 20px rgba(245, 158, 11, 0.12)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#f59e0b",
                boxShadow: "0 0 8px #f59e0b",
              }}
            />
            Smart PG Management System
          </div>
        </HeroEntrance>

        {/* Headline — slides up slightly later */}
        <HeroEntrance index={1}>
          <h1
            style={{
              fontSize: "clamp(2.2rem, 6vw, 3.8rem)",
              fontWeight: 800,
              maxWidth: "950px",
              lineHeight: 1.15,
              marginBottom: "1.5rem",
              color: "#ffffff",
              letterSpacing: "-1px",
            }}
          >
            PGmate | #1 PG Management Software & Hostel App for{" "}
            <span
              style={{
                color: "transparent",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                backgroundImage: "linear-gradient(90deg, #fef08a, #f59e0b)",
              }}
            >
              PG Owners & Managers
            </span>
          </h1>
        </HeroEntrance>

        {/* Sub-headline */}
        <HeroEntrance index={2}>
          <p
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
              color: "#cbd5e1",
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
                backgroundColor: "#ea580c",
                color: "#ffffff",
                textDecoration: "none",
                boxShadow:
                  "0 10px 25px -5px rgba(234, 88, 12, 0.4), 0 8px 10px -6px rgba(234, 88, 12, 0.1)",
                transition: "transform 0.2s, background-color 0.2s",
              }}
            >
              Start Scaling Today
            </Link>
            <Link
              href="/demo"
              style={{
                padding: "1.25rem 2.5rem",
                fontSize: "1.125rem",
                fontWeight: 500,
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.15)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#f8fafc",
                textDecoration: "none",
                backdropFilter: "blur(10px)",
                transition: "background 0.2s",
              }}
            >
              View Demo Dashboard
            </Link>
            <button
              onClick={() => setVideoModalOpen(true)}
              style={{
                padding: "1.25rem 2rem",
                fontSize: "1.125rem",
                fontWeight: 600,
                borderRadius: "12px",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                backgroundColor: "rgba(245, 158, 11, 0.12)",
                color: "#fbbf24",
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(245, 158, 11, 0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(245, 158, 11, 0.12)")}
            >
              <span>▶️</span> Watch Video (2m)
            </button>
          </div>
        </HeroEntrance>

        {/* Executive Summary / Key Takeaways Box (AEO & GEO Signal) */}
        <HeroEntrance index={3}>
          <div
            style={{
              maxWidth: "950px",
              width: "100%",
              margin: "3rem auto 0 auto",
              padding: "1.5rem 2rem",
              borderRadius: "20px",
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              textAlign: "left",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "1.2rem" }}>💡</span>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fbbf24", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Key Takeaways & Executive Summary
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: "#ffffff", display: "block", marginBottom: "0.2rem" }}>Who It Is For:</strong>
                PG Owners, Hostel Managers, and Co-Living Property Operators across India.
              </div>
              <div>
                <strong style={{ color: "#ffffff", display: "block", marginBottom: "0.2rem" }}>Core Problem Solved:</strong>
                Eliminates spreadsheet errors, uncollected rent dues, manual paper receipts, and unorganized complaints.
              </div>
              <div>
                <strong style={{ color: "#ffffff", display: "block", marginBottom: "0.2rem" }}>Key Features & Impact:</strong>
                Automated WhatsApp rent reminders, instant digital receipts, live room vacancy tracking, and 98.4% on-time rent recovery.
              </div>
            </div>
          </div>
        </HeroEntrance>

        {/* ── Framer Motion Hero Interactive Motion Graphic Showcase ────── */}
        <HeroEntrance index={4}>
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            style={{
              position: "relative",
              maxWidth: "1000px",
              width: "100%",
              margin: "4.5rem auto 0 auto",
              padding: "2rem",
              borderRadius: "28px",
              background: "linear-gradient(135deg, rgba(22, 27, 34, 0.95), rgba(13, 17, 23, 0.98))",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(245, 158, 11, 0.15)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Top Bar Window Decorator */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ff5f56", display: "inline-block" }} />
                <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ffbd2e", display: "inline-block" }} />
                <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27c93f", display: "inline-block" }} />
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 500, letterSpacing: "0.05em" }}>
                HABITAT CO-LIVING DASHBOARD LIVE PREVIEW
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#f59e0b", background: "rgba(245,158,11,0.14)", padding: "4px 10px", borderRadius: "20px", fontWeight: 600 }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#f59e0b" }} /> Live Sync
              </div>
            </div>

            {/* Hero 3D Graphic + Metrics Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", alignItems: "center" }}>
              {/* 3D Smart Building Graphic (User's Habitat Co-Living Photo) */}
              <motion.div
                whileHover={{ scale: 1.03, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                style={{ overflow: "hidden", borderRadius: "20px", border: "1px solid rgba(245, 158, 11, 0.3)", boxShadow: "0 12px 30px rgba(245, 158, 11, 0.15)", backgroundColor: "#0d1117" }}
              >
                <img
                  src="/images/hero_3d_property.png"
                  alt="Habitat Co-Living HSR Layout"
                  style={{ width: "100%", height: "360px", objectFit: "contain", display: "block" }}
                />
              </motion.div>

              {/* Floating Framer Motion Metrics Pills */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
                <motion.div
                  whileHover={{ x: 6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{
                    padding: "1rem 1.25rem",
                    borderRadius: "16px",
                    background: "rgba(22, 27, 34, 0.7)",
                    border: "1px solid rgba(22, 163, 74, 0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Total Occupancy</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16a34a" }}>96.8%</div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#22c55e", background: "rgba(34, 197, 94, 0.12)", padding: "4px 8px", borderRadius: "12px", fontWeight: 600 }}>↑ +12%</div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{
                    padding: "1rem 1.25rem",
                    borderRadius: "16px",
                    background: "rgba(22, 27, 34, 0.7)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Monthly Rent Collected</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fbbf24" }}>₹4,85,000</div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#fbbf24", background: "rgba(245, 158, 11, 0.14)", padding: "4px 8px", borderRadius: "12px", fontWeight: 600 }}>Automated</div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{
                    padding: "1rem 1.25rem",
                    borderRadius: "16px",
                    background: "rgba(22, 27, 34, 0.7)",
                    border: "1px solid rgba(234, 88, 12, 0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 500 }}>Pending Reminders</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f97316" }}>0 Overdue</div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#f97316", background: "rgba(234, 88, 12, 0.14)", padding: "4px 8px", borderRadius: "12px", fontWeight: 600 }}>WhatsApp Sent</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </HeroEntrance>

        {/* ── Dashboard Video Walkthrough Section ──────────────────────── */}
        <DashboardVideoSection />

        {/* ── Feature Cards — scroll-revealed, staggered ────────────────── */}
        <section id="features" style={{ scrollMarginTop: "100px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "8rem" }}>
          <div style={{ display: "inline-block", padding: "0.35rem 1rem", borderRadius: "99px", backgroundColor: "rgba(254, 243, 199, 0.9)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#b45309", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.25rem", letterSpacing: "0.05em", textAlign: "center" }}>
            FEATURES
          </div>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: "#1e293b", marginBottom: "0.75rem", letterSpacing: "-0.5px", textAlign: "center" }}>
            Everything You Need to Manage Your PG
          </h2>
          <p style={{ color: "#475569", fontSize: "1.05rem", maxWidth: "550px", margin: "0 auto 3rem auto", lineHeight: 1.6, textAlign: "center" }}>
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
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                height: "100%",
                padding: "2rem",
                background: "#ffffff",
                borderRadius: "24px",
                border: "1px solid rgba(234, 88, 12, 0.15)",
                boxShadow: "0 10px 30px rgba(234, 88, 12, 0.06)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{ overflow: "hidden", borderRadius: "16px", marginBottom: "1.5rem", border: "1px solid rgba(22, 163, 74, 0.25)" }}>
                <img
                  src="/images/feature_3d_occupancy.png"
                  alt="3D Occupancy Illustration"
                  style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                />
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "rgba(22, 163, 74, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                  color: "#16a34a",
                  border: "1px solid rgba(22, 163, 74, 0.2)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.75rem" }}>
                Maximize Occupancy
              </h3>
              <p style={{ color: "#475569", lineHeight: 1.6, fontSize: "0.95rem" }}>
                Get a bird's-eye view of your property. Instantly identify vacant beds, optimize room
                allocations, and reduce revenue leakage.
              </p>
            </motion.div>
          </AnimatedSection>

          {/* Card 2 — Cash Flow */}
          <AnimatedSection delay={90}>
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                height: "100%",
                padding: "2rem",
                background: "#ffffff",
                borderRadius: "24px",
                border: "1px solid rgba(234, 88, 12, 0.15)",
                boxShadow: "0 10px 30px rgba(234, 88, 12, 0.06)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{ overflow: "hidden", borderRadius: "16px", marginBottom: "1.5rem", border: "1px solid rgba(245, 158, 11, 0.25)" }}>
                <img
                  src="/images/feature_3d_cashflow.png"
                  alt="3D Cash Flow Illustration"
                  style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                />
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "rgba(245, 158, 11, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                  color: "#d97706",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M6 6v12" />
                  <path d="M18 6v12" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.75rem" }}>
                Automated Cash Flow
              </h3>
              <p style={{ color: "#475569", lineHeight: 1.6, fontSize: "0.95rem" }}>
                Track dues with precision. Record partial payments, monitor expected monthly
                collections, and automatically generate digital receipts.
              </p>
            </motion.div>
          </AnimatedSection>

          {/* Card 3 — Tenant Portal */}
          <AnimatedSection delay={180}>
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                height: "100%",
                padding: "2rem",
                background: "#ffffff",
                borderRadius: "24px",
                border: "1px solid rgba(234, 88, 12, 0.15)",
                boxShadow: "0 10px 30px rgba(234, 88, 12, 0.06)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{ overflow: "hidden", borderRadius: "16px", marginBottom: "1.5rem", border: "1px solid rgba(234, 88, 12, 0.25)" }}>
                <img
                  src="/images/feature_3d_tenant_portal.png"
                  alt="3D Tenant Portal Illustration"
                  style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                />
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "rgba(234, 88, 12, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                  color: "#ea580c",
                  border: "1px solid rgba(234, 88, 12, 0.2)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.75rem" }}>
                Premium Tenant Portal
              </h3>
              <p style={{ color: "#475569", lineHeight: 1.6, fontSize: "0.95rem" }}>
                Provide a professional experience. Tenants get a secure magic link to view their
                rent status and instantly raise maintenance tickets.
              </p>
            </motion.div>
          </AnimatedSection>
        </div>
          
          {/* Features -> Pricing Link */}
          <div style={{ textAlign: "center", marginTop: "3.5rem" }}>
            <a
              href="#pricing"
              style={{
                color: "#ea580c",
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

        {/* ── Comprehensive AEO / GEO Question & Knowledge Base Sections ───── */}
        <section
          id="overview"
          style={{
            maxWidth: "1100px",
            width: "100%",
            marginTop: "6rem",
            display: "flex",
            flexDirection: "column",
            gap: "5rem",
            textAlign: "left",
          }}
        >
          {/* Question 1: What is PGmate? */}
          <AnimatedSection delay={50}>
            <div
              style={{
                background: "rgba(22, 27, 34, 0.8)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "24px",
                padding: "2.5rem",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "99px", background: "rgba(245, 158, 11, 0.12)", color: "#fbbf24", fontSize: "0.8rem", fontWeight: 700, marginBottom: "1rem" }}>
                CORE OVERVIEW
              </div>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, color: "#ffffff", marginBottom: "1.25rem", lineHeight: 1.25 }}>
                What is PGmate PG Management Software?
              </h2>
              {/* Direct Answer Paragraph for AI Extraction */}
              <div
                style={{
                  background: "rgba(245, 158, 11, 0.08)",
                  borderLeft: "4px solid #f59e0b",
                  padding: "1.25rem 1.5rem",
                  borderRadius: "0 12px 12px 0",
                  marginBottom: "1.5rem",
                  color: "#f8fafc",
                  fontSize: "1.05rem",
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                <strong>Direct Answer:</strong> PGmate is an all-in-one Paying Guest (PG) management software and mobile app engineered for PG owners, hostel managers, and co-living space operators across India. It automates rent collection tracking, room allocation, security deposit ledgers, WhatsApp tenant reminders, and instant digital payment receipt generation from a single unified dashboard.
              </div>
              <p style={{ color: "#cbd5e1", lineHeight: 1.7, fontSize: "1rem" }}>
                Managing a Paying Guest accommodation or hostel manually leads to delayed rent payments, lost deposit tracking, and chaotic tenant maintenance calls. PGmate brings structure to your accommodation business by digitizing every step of the tenant lifecycle. Whether you operate a 10-bed single property or manage a chain of 500+ student co-living spaces, PGmate gives you real-time visibility into bed vacancy, monthly cash flow, and tenant compliance.
              </p>
            </div>
          </AnimatedSection>

          {/* Question 2: How Does PGmate Automate Operations? */}
          <AnimatedSection delay={100}>
            <div>
              <div style={{ display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "99px", background: "rgba(234, 88, 12, 0.12)", color: "#ea580c", fontSize: "0.8rem", fontWeight: 700, marginBottom: "1rem" }}>
                HOW IT WORKS
              </div>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, color: "#ffffff", marginBottom: "1.25rem", lineHeight: 1.25 }}>
                How Does PGmate Automate Rent Collection & PG Operations?
              </h2>
              <div
                style={{
                  background: "rgba(234, 88, 12, 0.08)",
                  borderLeft: "4px solid #ea580c",
                  padding: "1.25rem 1.5rem",
                  borderRadius: "0 12px 12px 0",
                  marginBottom: "2rem",
                  color: "#f8fafc",
                  fontSize: "1.05rem",
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                <strong>Direct Answer:</strong> PGmate automates PG rent collection in 3 simple steps: First, configure your property floors, room numbers, and bed capacities. Second, onboard tenants with rental rates and automated due date rules. Third, the system sends automated WhatsApp payment reminders and generates instant digital PDF receipts upon payment logging, eliminating manual record keeping.
              </div>

              {/* 3-Step Visual Workflow Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                <div style={{ padding: "1.75rem", background: "rgba(22, 27, 34, 0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#ea580c", color: "#ffffff", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                    1
                  </div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem" }}>Register PG Property</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.5 }}>
                    Define floors, rooms (single, double, triple sharing), and total bed capacities to build a live visual map of your property.
                  </p>
                </div>

                <div style={{ padding: "1.75rem", background: "rgba(22, 27, 34, 0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f59e0b", color: "#ffffff", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                    2
                  </div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem" }}>Onboard & Assign Beds</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.5 }}>
                    Record tenant contact info, ID proof documents, security deposit collected, and recurring monthly rent due dates.
                  </p>
                </div>

                <div style={{ padding: "1.75rem", background: "rgba(22, 27, 34, 0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#16a34a", color: "#ffffff", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                    3
                  </div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem" }}>Automate Dues & Receipts</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.5 }}>
                    Send automated WhatsApp rent reminders, collect dues via UPI/Bank, and instantly generate digital payment receipts.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Question 3: Who is PGmate Built For? */}
          <AnimatedSection delay={150}>
            <div>
              <div style={{ display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "99px", background: "rgba(34, 197, 94, 0.12)", color: "#22c55e", fontSize: "0.8rem", fontWeight: 700, marginBottom: "1rem" }}>
                TARGET AUDIENCE & USE CASES
              </div>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, color: "#ffffff", marginBottom: "1.25rem", lineHeight: 1.25 }}>
                Who is PGmate Built For?
              </h2>
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.08)",
                  borderLeft: "4px solid #22c55e",
                  padding: "1.25rem 1.5rem",
                  borderRadius: "0 12px 12px 0",
                  marginBottom: "2rem",
                  color: "#f8fafc",
                  fontSize: "1.05rem",
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                <strong>Direct Answer:</strong> PGmate is tailored specifically for three key user segments in India's rental housing ecosystem: (1) Independent PG owners replacing paper register books, (2) Multi-property hostel chain managers seeking unified financial analytics, and (3) Student co-living operators requiring tenant magic-link self-service portals.
              </div>

              {/* Persona Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                <div style={{ padding: "1.75rem", background: "rgba(22, 27, 34, 0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fbbf24", marginBottom: "0.75rem" }}>
                    🏡 Independent PG Owners
                  </h3>
                  <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.6 }}>
                    Stop spending evenings tracking who paid rent and who owes money. Get automated mobile alerts, record partial payments, and issue professional WhatsApp receipts in seconds.
                  </p>
                </div>

                <div style={{ padding: "1.75rem", background: "rgba(22, 27, 34, 0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ea580c", marginBottom: "0.75rem" }}>
                    🏢 Multi-Branch Hostel Chains
                  </h3>
                  <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.6 }}>
                    Manage multiple buildings and properties under one login. Compare occupancy rates, total revenue collected, pending dues, and property maintenance expenses across all branches.
                  </p>
                </div>

                <div style={{ padding: "1.75rem", background: "rgba(22, 27, 34, 0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#22c55e", marginBottom: "0.75rem" }}>
                    🎓 Co-Living & Student Hostels
                  </h3>
                  <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.6 }}>
                    Provide modern tenants with passwordless Magic Links to check rent receipts, review meal menus, and log maintenance complaints without disturbing property wardens.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Section 4: Comparison Table */}
          <AnimatedSection delay={200}>
            <div>
              <div style={{ display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "99px", background: "rgba(245, 158, 11, 0.12)", color: "#fbbf24", fontSize: "0.8rem", fontWeight: 700, marginBottom: "1rem" }}>
                DECISION SUPPORT & COMPARISON
              </div>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, color: "#ffffff", marginBottom: "1.25rem", lineHeight: 1.25 }}>
                Manual Spreadsheets vs. PGmate Software
              </h2>
              <p style={{ color: "#cbd5e1", fontSize: "1rem", lineHeight: 1.6, marginBottom: "2rem" }}>
                See how switching from manual register books or Excel files to PGmate transforms your daily PG operations:
              </p>

              {/* Comparison Table */}
              <div style={{ overflowX: "auto", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(22, 27, 34, 0.9)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)" }}>
                      <th style={{ padding: "1.2rem 1.5rem", color: "#f8fafc", fontWeight: 700 }}>Operational Feature</th>
                      <th style={{ padding: "1.2rem 1.5rem", color: "#f87171", fontWeight: 700 }}>Manual Spreadsheets / Paper</th>
                      <th style={{ padding: "1.2rem 1.5rem", color: "#4ade80", fontWeight: 700 }}>PGmate Automated Software</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "1rem 1.5rem", color: "#ffffff", fontWeight: 600 }}>Rent Dues Tracking</td>
                      <td style={{ padding: "1rem 1.5rem", color: "#94a3b8" }}>Manual math, prone to missed dues</td>
                      <td style={{ padding: "1rem 1.5rem", color: "#4ade80", fontWeight: 600 }}>100% Automated dues ledger & alerts</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "1rem 1.5rem", color: "#ffffff", fontWeight: 600 }}>Payment Receipts</td>
                      <td style={{ padding: "1rem 1.5rem", color: "#94a3b8" }}>Manual paper receipt books</td>
                      <td style={{ padding: "1rem 1.5rem", color: "#4ade80", fontWeight: 600 }}>Instant WhatsApp & PDF Receipts</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "1rem 1.5rem", color: "#ffffff", fontWeight: 600 }}>Bed Availability Map</td>
                      <td style={{ padding: "1rem 1.5rem", color: "#94a3b8" }}>Scattered across WhatsApp chats</td>
                      <td style={{ padding: "1rem 1.5rem", color: "#4ade80", fontWeight: 600 }}>Live visual floor-by-floor bed grid</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "1rem 1.5rem", color: "#ffffff", fontWeight: 600 }}>Tenant Complaints</td>
                      <td style={{ padding: "1rem 1.5rem", color: "#94a3b8" }}>Untracked phone calls & messages</td>
                      <td style={{ padding: "1rem 1.5rem", color: "#4ade80", fontWeight: 600 }}>Structured ticket system with status</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "1rem 1.5rem", color: "#ffffff", fontWeight: 600 }}>Security Deposit Ledger</td>
                      <td style={{ padding: "1rem 1.5rem", color: "#94a3b8" }}>Frequent refund disputes</td>
                      <td style={{ padding: "1rem 1.5rem", color: "#4ade80", fontWeight: 600 }}>Transparent deposit tracking & receipts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedSection>

          {/* Section 5: Industry Benchmark & External Credible Citation */}
          <AnimatedSection delay={250}>
            <div
              style={{
                padding: "2rem 2.5rem",
                borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(245, 158, 11, 0.05))",
                border: "1px solid rgba(234, 88, 12, 0.25)",
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.75rem" }}>
                Industry Insights & Payment Compliance Standards
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.65, margin: 0 }}>
                According to official rental accommodation guidelines published by the{" "}
                <a
                  href="https://mohua.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#fbbf24", textDecoration: "underline", fontWeight: 600 }}
                >
                  Ministry of Housing and Urban Affairs (MoHUA)
                </a>
                , adopting transparent digital record-keeping and formal tenant payment receipts significantly reduces rental disputes and ensures compliance with urban rental housing standards in India. PGmate enforces strict data isolation and standard digital payment receipts for complete peace of mind.
              </p>
            </div>
          </AnimatedSection>
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
          <div style={{ display: "inline-block", padding: "0.35rem 1rem", borderRadius: "99px", backgroundColor: "rgba(254, 243, 199, 0.9)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#b45309", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.25rem", letterSpacing: "0.05em" }}>
            PRICING
          </div>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: "#1e293b", marginBottom: "0.75rem", letterSpacing: "-0.5px" }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{ color: "#475569", fontSize: "1.05rem", maxWidth: "480px", margin: "0 auto 3rem", lineHeight: 1.6 }}>
            One plan. Every feature included. No hidden fees, no per-tenant charges.
          </p>

          {/* Dynamic Property Count Selector */}
          <div
            style={{
              maxWidth: "400px",
              margin: "0 auto 3rem auto",
              padding: "1.5rem",
              background: "#ffffff",
              borderRadius: "20px",
              border: "1px dashed rgba(234, 88, 12, 0.4)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              textAlign: "center"
            }}
          >
            <label style={{ fontSize: "0.95rem", fontWeight: 600, display: "block", marginBottom: "0.75rem", color: "#1e293b" }}>
              How many properties do you want to manage?
            </label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
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
                  backgroundColor: "rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  color: "#1e293b",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                -
              </motion.button>
              <motion.span
                key={propertyCount}
                initial={{ scale: 1.3, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ea580c" }}
              >
                {propertyCount}
              </motion.span>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
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
                  backgroundColor: "rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  color: "#1e293b",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                +
              </motion.button>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.75rem", marginBottom: 0 }}>
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
                background: "#ffffff",
                borderRadius: "24px",
                border: "1px solid rgba(0,0,0,0.1)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                padding: "2.5rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h3 style={{ color: "#1e293b", fontSize: "1.3rem", marginBottom: "0.25rem" }}>PGmate Starter — 6 Months</h3>
              <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Up to {propertyCount} propert{propertyCount === 1 ? "y" : "ies"} limit
              </div>
              <div style={{ fontSize: "2.75rem", fontWeight: 900, color: "#1e293b", lineHeight: 1, margin: "1rem 0" }}>
                ₹{(6999 + (propertyCount - 1) * 4999).toLocaleString()}
              </div>
              {propertyCount > 1 && (
                <div style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "1.5rem", marginTop: "-0.5rem" }}>
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
                    <span style={{ color: "#ea580c", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>✓</span>
                    <span style={{ color: "#334155" }}>{f}</span>
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
                  backgroundColor: "rgba(0,0,0,0.04)",
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                  border: "1px solid rgba(0,0,0,0.1)",
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
                background: "linear-gradient(145deg, #ffffff, #fff7ed)",
                borderRadius: "24px",
                border: "2px solid #ea580c",
                boxShadow: "0 15px 40px rgba(234, 88, 12, 0.18)",
                padding: "2.5rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Popular badge */}
              <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg, #ea580c, #f59e0b)", color: "#ffffff", padding: "5px 20px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                BEST VALUE
              </div>

              <h3 style={{ color: "#1e293b", fontSize: "1.3rem", marginBottom: "0.25rem" }}>PGmate Premium — 1 Year</h3>
              <div style={{ color: "#ea580c", fontSize: "0.85rem", marginTop: "0.25rem", fontWeight: 600 }}>
                Up to {propertyCount} propert{propertyCount === 1 ? "y" : "ies"} limit
              </div>
              <div style={{ fontSize: "2.75rem", fontWeight: 900, color: "#ea580c", lineHeight: 1, margin: "1rem 0" }}>
                ₹{(11999 + (propertyCount - 1) * 6999).toLocaleString()}
              </div>
              {propertyCount > 1 ? (
                <div style={{ color: "#ea580c", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.5rem", marginTop: "-0.5rem" }}>
                  ₹11,999 base + {propertyCount - 1} × ₹6,999 addons
                </div>
              ) : (
                <div style={{ color: "#ea580c", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem" }}>Save ₹1,999 compared to 6-month plan</div>
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
                    <span style={{ color: "#ea580c", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>✓</span>
                    <span style={{ color: "#334155" }}>{f}</span>
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
                  backgroundColor: "#ea580c",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  boxShadow: "0 0 25px rgba(234,88,12,0.35)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                Start Now
              </Link>
            </div>
          </div>
          
          {/* Pricing -> Contact Link */}
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <span style={{ color: "#64748b", fontSize: "0.95rem" }}>
              Need a plan for more properties or custom enterprise setup?{" "}
              <a href="#contact" style={{ color: "#ea580c", textDecoration: "none", fontWeight: 600 }}>
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
            margin: "6rem auto 4rem auto",
            padding: "3rem",
            background: "#ffffff",
            borderRadius: "24px",
            border: "1px solid rgba(234, 88, 12, 0.15)",
            textAlign: "center",
            maxWidth: "800px",
            boxShadow: "0 15px 35px rgba(0,0,0,0.04)",
          }}
        >
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#1e293b", marginBottom: "1rem" }}>
            Get in Touch
          </h2>
          <p style={{ color: "#475569", fontSize: "1.125rem", marginBottom: "2rem" }}>
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
              backgroundColor: "rgba(234, 88, 12, 0.1)",
              color: "#ea580c",
              border: "1px solid rgba(234, 88, 12, 0.2)",
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

      {/* CRM Sheet sliding modal (only accessible to master admin) */}
      <CrmSheet isOpen={crmOpen} onClose={() => setCrmOpen(false)} />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.98)",
            backdropFilter: "blur(12px)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 5%", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <Logo size={30} variant="light" showTagline={false} />
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              style={{
                background: "none",
                border: "none",
                fontSize: "1.75rem",
                cursor: "pointer",
                color: "#e2e8f0",
              }}
            >
              ✕
            </button>
          </div>
          
          {/* Links list */}
          <div style={{ display: "flex", flexDirection: "column", padding: "1rem 0" }}>
            <a href="#features" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#dashboard-video" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>Video Guide</a>
            <a href="#pricing" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#contact" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "2rem 1.5rem" }}>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: "0.8rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#e2e8f0",
                  fontWeight: 500,
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  textAlign: "center",
                }}
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: "0.8rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#0f172a",
                  fontWeight: 600,
                  backgroundColor: "#00c49f",
                  textAlign: "center",
                  boxShadow: "0 0 15px rgba(0,196,159,0.4)",
                }}
              >
                Register PG
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Video Modal */}
      <DashboardVideoModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} />
    </div>
  );
}
