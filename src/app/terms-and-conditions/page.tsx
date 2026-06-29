"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function TermsAndConditions() {
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
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "#00c49f" }}>Terms and Conditions</h1>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: "1.6", color: "#94a3b8" }}>
          <p><strong>Last updated: June 29, 2026</strong></p>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>1. Acceptance of Terms</h2>
            <p>By accessing or using the PGmate platform (provided by v4stay), you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, then you may not access the service.</p>
          </section>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>2. Description of Service</h2>
            <p>PGmate provides a SaaS platform for PG (Paying Guest) and hostel owners to manage their tenants, properties, payments, and complaints. The service is provided &quot;as is&quot; and &quot;as available&quot;.</p>
          </section>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>3. User Accounts</h2>
            <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.</p>
          </section>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>4. Subscription and Payments</h2>
            <p>Certain parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (such as monthly or annually), depending on the type of subscription plan you select. Payment processing is subject to our integrated payment gateway providers.</p>
          </section>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>5. Limitation of Liability</h2>
            <p>In no event shall PGmate, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </section>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>6. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
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
