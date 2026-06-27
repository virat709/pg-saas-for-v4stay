"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function AboutPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Background glow */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", background: "radial-gradient(circle at 60% 20%, rgba(0,196,159,0.07), transparent 55%), radial-gradient(circle at 20% 70%, rgba(56,189,248,0.06), transparent 50%)" }} />

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 5%", borderBottom: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(15,23,42,0.85)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo size={30} variant="light" showTagline={false} />
        </Link>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/login" style={{ padding: "0.5rem 1rem", borderRadius: "8px", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none", fontSize: "0.9rem" }}>Login</Link>
          <Link href="/register" style={{ padding: "0.5rem 1rem", borderRadius: "8px", backgroundColor: "#00c49f", color: "#0f172a", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>Register PG</Link>
        </div>
      </nav>

      <main style={{ position: "relative", zIndex: 1, flex: 1 }}>
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "6rem 5% 4rem" }}>
          <div style={{ display: "inline-block", padding: "0.35rem 1rem", borderRadius: "99px", backgroundColor: "rgba(0,196,159,0.12)", border: "1px solid rgba(0,196,159,0.25)", color: "#00c49f", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.5rem", letterSpacing: "0.05em" }}>
            ABOUT US
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.15, maxWidth: "700px", margin: "0 auto 1.5rem" }}>
            Built for <span style={{ background: "linear-gradient(90deg, #00c49f, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PG Owners</span>, by People Who Understand the Chaos
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.15rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
            PGmate was born out of a simple frustration — managing a PG property shouldn&apos;t require spreadsheets, WhatsApp broadcasts, and sleepless nights. We set out to fix that.
          </p>
        </div>

        {/* Mission */}
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 5% 5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: "4rem" }}>
            {[
              { icon: "🏠", title: "Our Mission", text: "To give every PG and hostel owner a modern, effortless management platform that saves time, reduces errors, and keeps both owners and tenants happy." },
              { icon: "⚡", title: "Our Approach", text: "We built fast, focused, and simple. No bloated features — just the core tools PG owners need every single day. Rooms, tenants, payments, complaints — all in one place." },
              { icon: "🤝", title: "Our Promise", text: "We are committed to your success. Every feature we build is driven by real feedback from real PG owners across India. You grow, we grow." },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  padding: "2rem",
                  background: "rgba(14,30,56,0.6)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{item.icon}</div>
                <h3 style={{ color: "#f8fafc", fontSize: "1.15rem", marginBottom: "0.75rem" }}>{item.title}</h3>
                <p style={{ color: "#94a3b8", lineHeight: 1.7, margin: 0, fontSize: "0.95rem" }}>{item.text}</p>
              </div>
            ))}
          </div>

          {/* Story */}
          <div style={{ padding: "3rem", background: "rgba(14,30,56,0.5)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "4rem" }}>
            <h2 style={{ color: "#f8fafc", fontSize: "1.75rem", marginBottom: "1.5rem" }}>Our Story</h2>
            <div style={{ color: "#94a3b8", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.975rem" }}>
              <p style={{ margin: 0 }}>
                v4stay started as a small team passionate about solving real-world property management problems in India. We saw PG owners struggling with pen-and-paper registers, missed rent reminders, and no way to give tenants a professional experience.
              </p>
              <p style={{ margin: 0 }}>
                We built PGmate as a SaaS platform that treats every PG owner like a professional — giving them the same tools that large property management companies use, at a fraction of the cost.
              </p>
              <p style={{ margin: 0 }}>
                Today, PGmate powers PG properties across India, helping owners collect rent faster, manage tenants effortlessly, and resolve complaints before they become problems.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.5rem", marginBottom: "4rem" }}>
            {[
              { value: "500+", label: "Properties Managed" },
              { value: "5,000+", label: "Tenants Served" },
              { value: "₹2Cr+", label: "Rent Processed" },
              { value: "98%", label: "Owner Satisfaction" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  textAlign: "center",
                  padding: "2rem 1rem",
                  background: "rgba(14,30,56,0.5)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ fontSize: "2rem", fontWeight: 900, background: "linear-gradient(135deg, #00c49f, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat.value}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", padding: "3rem", background: "rgba(0,196,159,0.06)", borderRadius: "20px", border: "1px solid rgba(0,196,159,0.15)" }}>
            <h2 style={{ color: "#f8fafc", fontSize: "1.75rem", marginBottom: "1rem" }}>Ready to simplify your PG?</h2>
            <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>Join hundreds of PG owners who have made the switch to PGmate.</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" style={{ padding: "0.85rem 2rem", borderRadius: "10px", backgroundColor: "#00c49f", color: "#0f172a", fontWeight: 700, textDecoration: "none", boxShadow: "0 0 20px rgba(0,196,159,0.3)" }}>
                Start Free Today
              </Link>
              <Link href="/contact-us" style={{ padding: "0.85rem 2rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0", fontWeight: 600, textDecoration: "none" }}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", color: "#64748b", fontSize: "0.875rem", position: "relative", zIndex: 1 }}>
        <p>© {new Date().getFullYear()} PGmate (v4stay). All rights reserved.</p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/privacy-policy" style={{ color: "#64748b", textDecoration: "none" }}>Privacy Policy</Link>
          <span>|</span>
          <Link href="/terms-and-conditions" style={{ color: "#64748b", textDecoration: "none" }}>Terms & Conditions</Link>
          <span>|</span>
          <Link href="/refund-policy" style={{ color: "#64748b", textDecoration: "none" }}>Refund Policy</Link>
          <span>|</span>
          <Link href="/contact-us" style={{ color: "#64748b", textDecoration: "none" }}>Contact Us</Link>
        </div>
      </footer>
    </div>
  );
}
