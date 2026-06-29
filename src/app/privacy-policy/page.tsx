"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function PrivacyPolicy() {
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

      <main style={{ padding: "4rem 5%", maxWidth: "800px", margin: "0 auto", flex: 1 }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "#00c49f" }}>Privacy Policy</h1>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: "1.6", color: "#94a3b8" }}>
          <p><strong>Last updated: June 29, 2026</strong></p>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>1. Introduction</h2>
            <p>Welcome to PGmate (by v4stay). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or use our SaaS platform for PG management.</p>
          </section>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
              <li><strong>Financial Data</strong> includes payment processing details required for subscription and tenant payments.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., providing the PG management services).</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>4. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
          </section>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>5. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
            <p style={{ marginTop: "0.5rem" }}>Email: <a href="mailto:v4services.in@gmail.com" style={{ color: "#00c49f", textDecoration: "none" }}>v4services.in@gmail.com</a></p>
          </section>
        </div>
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
