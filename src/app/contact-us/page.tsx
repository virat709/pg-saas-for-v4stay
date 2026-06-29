"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

export default function ContactUs() {
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
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.5rem 5%",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo size={30} variant="light" showTagline={false} />
        </Link>
      </nav>

      <main style={{ padding: "4rem 5%", maxWidth: "800px", margin: "0 auto", flex: 1, width: "100%" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "#00c49f", textAlign: "center" }}>Contact Us</h1>
        
        <AnimatedSection>
          <div
            style={{
              padding: "3rem",
              background: "rgba(15, 23, 42, 0.6)",
              borderRadius: "24px",
              border: "1px solid rgba(255,255,255,0.05)",
              textAlign: "center",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
              backdropFilter: "blur(10px)",
            }}
          >
            <p style={{ color: "#94a3b8", fontSize: "1.125rem", marginBottom: "2rem" }}>
              Have questions, need support, or want to give feedback? We&apos;d love to hear from you.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ color: "#f8fafc", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Email Support</h2>
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
              
              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <h3 style={{ color: "#f8fafc", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Operating Address</h3>
                <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>
                  v4stay (PGmate)<br />
                  India
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </main>

      <footer
        style={{
          padding: "2rem",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          color: "#64748b",
          fontSize: "0.875rem",
        }}
      >
        <p>© {new Date().getFullYear()} PGmate (v4stay). All rights reserved.</p>
      </footer>
    </div>
  );
}
