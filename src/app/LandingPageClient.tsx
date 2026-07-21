"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import CrmSheet from "@/components/CrmSheet";
import { useScrollyNav } from "@/hooks/useScrollyNav";

// ── Sticky navbar with scroll-aware shadow ──────────────────────────────────
export function LandingNav() {
  const { isScrolled } = useScrollyNav(40);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [crmOpen, setCrmOpen] = useState(false);

  return (
    <>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.5rem 5%",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(16px)",
          boxShadow: isScrolled ? "0 4px 24px rgba(0,0,0,0.35)" : "none",
          transition: "box-shadow 0.35s ease",
        }}
      >
        <Logo size={30} variant="light" showTagline={false} />

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {[
            { href: "#features", label: "Features" },
            { href: "#pricing", label: "Pricing" },
            { href: "#contact", label: "Contact" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
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
              {label}
            </a>
          ))}
          <button
            onClick={() => setCrmOpen(true)}
            title="Open CRM Sheet"
            aria-label="Open CRM Sheet"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.6rem",
              color: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <span style={{ fontSize: "1.1rem" }}>📌</span>
          </button>
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

        {/* Mobile trigger buttons */}
        <div className="mobile-nav-btn" style={{ display: "none", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={() => setCrmOpen(true)}
            title="Open CRM Sheet"
            aria-label="Open CRM Sheet"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem", color: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <span style={{ fontSize: "1.1rem" }}>📌</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem", color: "#e2e8f0", fontSize: "1.4rem", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* CRM Sheet */}
      <CrmSheet isOpen={crmOpen} onClose={() => setCrmOpen(false)} />

      {/* Mobile Drawer */}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 5%", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <Logo size={30} variant="light" showTagline={false} />
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              style={{ background: "none", border: "none", fontSize: "1.75rem", cursor: "pointer", color: "#e2e8f0" }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", padding: "1rem 0" }}>
            <a href="#features" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#contact" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "2rem 1.5rem" }}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ padding: "0.8rem", borderRadius: "8px", textDecoration: "none", color: "#e2e8f0", fontWeight: 500, border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.03)", textAlign: "center" }}>Login</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} style={{ padding: "0.8rem", borderRadius: "8px", textDecoration: "none", color: "#0f172a", fontWeight: 600, backgroundColor: "#00c49f", textAlign: "center", boxShadow: "0 0 15px rgba(0,196,159,0.4)" }}>Register PG</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Dynamic pricing calculator (property count selector + cards) ────────────
const STARTER_FEATURES = ["Unlimited Tenants & Rooms", "Payment Tracking & Receipts", "Tenant Portal (Magic Link)", "Complaints & Notice Board", "Priority Support"];
const PREMIUM_FEATURES = ["Unlimited Tenants & Rooms", "Payment Tracking & Receipts", "Tenant Portal (Magic Link)", "Complaints & Notice Board", "Meal Menu Management", "Rent Reminder Emails", "Revenue Analytics", "CSV Export", "Priority Support"];

export function PricingSection() {
  const [propertyCount, setPropertyCount] = useState(1);

  const starterPrice = 6999 + (propertyCount - 1) * 4999;
  const premiumPrice = 11999 + (propertyCount - 1) * 6999;

  return (
    <div id="pricing" style={{ marginTop: "7rem", textAlign: "center" }}>
      <div style={{ display: "inline-block", padding: "0.35rem 1rem", borderRadius: "99px", backgroundColor: "rgba(0,196,159,0.12)", border: "1px solid rgba(0,196,159,0.25)", color: "#00c49f", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.25rem", letterSpacing: "0.05em" }}>
        PRICING
      </div>
      <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem", letterSpacing: "-0.5px" }}>
        Simple, Transparent Pricing
      </h2>
      <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "480px", margin: "0 auto 3rem", lineHeight: 1.6 }}>
        One plan. Every feature included. No hidden fees, no per-tenant charges.
      </p>

      {/* Property Count Selector */}
      <div style={{ maxWidth: "400px", margin: "0 auto 3rem auto", padding: "1.5rem", background: "rgba(30, 41, 59, 0.5)", borderRadius: "20px", border: "1px dashed rgba(0, 196, 159, 0.4)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", textAlign: "center" }}>
        <label style={{ fontSize: "0.95rem", fontWeight: 600, display: "block", marginBottom: "0.75rem", color: "#f8fafc" }}>
          How many properties do you want to manage?
        </label>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
          <button
            type="button"
            onClick={() => setPropertyCount(prev => Math.max(1, prev - 1))}
            style={{ padding: "0.25rem", fontSize: "1.25rem", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", cursor: "pointer", transition: "all 0.2s" }}
          >
            -
          </button>
          <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#00c49f" }}>{propertyCount}</span>
          <button
            type="button"
            onClick={() => setPropertyCount(prev => prev + 1)}
            style={{ padding: "0.25rem", fontSize: "1.25rem", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", cursor: "pointer", transition: "all 0.2s" }}
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
        <div style={{ position: "relative", width: "100%", background: "rgba(30,41,59,0.6)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", padding: "2.5rem", display: "flex", flexDirection: "column" }}>
          <h3 style={{ color: "#f8fafc", fontSize: "1.3rem", marginBottom: "0.25rem" }}>PGmate Starter — 6 Months</h3>
          <div style={{ color: "#cbd5e1", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Up to {propertyCount} propert{propertyCount === 1 ? "y" : "ies"} limit
          </div>
          <div style={{ fontSize: "2.75rem", fontWeight: 900, color: "#f8fafc", lineHeight: 1, margin: "1rem 0" }}>
            ₹{starterPrice.toLocaleString()}
          </div>
          {propertyCount > 1 && (
            <div style={{ color: "#cbd5e1", fontSize: "0.8rem", marginBottom: "1.5rem", marginTop: "-0.5rem" }}>
              ₹6,999 base + {propertyCount - 1} × ₹4,999 addons
            </div>
          )}
          <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1 }}>
            {STARTER_FEATURES.map((f) => (
              <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.9rem" }}>
                <span style={{ color: "#cbd5e1", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>✓</span>
                <span style={{ color: "#cbd5e1" }}>{f}</span>
              </li>
            ))}
          </ul>
          <Link href="/register" style={{ display: "block", width: "100%", textAlign: "center", padding: "0.9rem", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.1)", color: "#f8fafc", fontWeight: 600, fontSize: "1rem", textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)", transition: "background 0.2s" }}>
            Start Now
          </Link>
        </div>

        {/* 1 Year Plan */}
        <div style={{ position: "relative", width: "100%", background: "linear-gradient(145deg, rgba(30,41,59,0.85), rgba(15,23,42,0.95))", borderRadius: "24px", border: "2px solid #00c49f", boxShadow: "0 0 60px rgba(0,196,159,0.12), 0 20px 40px rgba(0,0,0,0.4)", padding: "2.5rem", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg, #00c49f, #38bdf8)", color: "#0f172a", padding: "5px 20px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            BEST VALUE
          </div>
          <h3 style={{ color: "#f8fafc", fontSize: "1.3rem", marginBottom: "0.25rem" }}>PGmate Premium — 1 Year</h3>
          <div style={{ color: "#00c49f", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Up to {propertyCount} propert{propertyCount === 1 ? "y" : "ies"} limit
          </div>
          <div style={{ fontSize: "2.75rem", fontWeight: 900, color: "#00c49f", lineHeight: 1, margin: "1rem 0" }}>
            ₹{premiumPrice.toLocaleString()}
          </div>
          {propertyCount > 1 ? (
            <div style={{ color: "#00c49f", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.5rem", marginTop: "-0.5rem" }}>
              ₹11,999 base + {propertyCount - 1} × ₹6,999 addons
            </div>
          ) : (
            <div style={{ color: "#00c49f", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem" }}>Save ₹1,999 compared to 6-month plan</div>
          )}
          <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1 }}>
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.9rem" }}>
                <span style={{ color: "#00c49f", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>✓</span>
                <span style={{ color: "#cbd5e1" }}>{f}</span>
              </li>
            ))}
          </ul>
          <Link href="/register" style={{ display: "block", width: "100%", textAlign: "center", padding: "0.9rem", borderRadius: "12px", backgroundColor: "#00c49f", color: "#0f172a", fontWeight: 700, fontSize: "1rem", textDecoration: "none", boxShadow: "0 0 25px rgba(0,196,159,0.35)", transition: "transform 0.2s, box-shadow 0.2s" }}>
            Start Now
          </Link>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
        <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
          Need a plan for more properties or custom enterprise setup?{" "}
          <a href="#contact" style={{ color: "#00c49f", textDecoration: "none", fontWeight: 600 }}>
            Contact our sales team
          </a>
        </span>
      </div>
    </div>
  );
}
