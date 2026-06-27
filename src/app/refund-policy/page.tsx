"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function RefundPolicy() {
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
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "#00c49f" }}>Refund & Cancellation Policy</h1>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: "1.6", color: "#94a3b8" }}>
          <p><strong>Last updated: {new Date().toLocaleDateString()}</strong></p>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>1. SaaS Subscription Cancellations</h2>
            <p>You may cancel your PGmate subscription at any time. If you cancel your subscription before the end of your current paid up month or year, your cancellation will take effect immediately and you will not be charged again. However, we do not provide prorated refunds for partially used billing periods.</p>
          </section>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>2. Refunds for Subscriptions</h2>
            <p>All subscription charges are non-refundable unless otherwise required by law. In case of accidental double billing, please contact our support team within 7 days of the charge, and we will issue a full refund for the duplicate charge after verification.</p>
          </section>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>3. Tenant Payments & Rent Transactions</h2>
            <p>PGmate serves as a technology platform connecting PG owners and their tenants. For any payments made by tenants to PG owners (such as rent, security deposits, etc.) using our integrated payment gateway, PGmate is not responsible for issuing refunds.</p>
            <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Any disputes regarding rent, deposits, or other PG-related fees must be resolved directly between the tenant and the PG owner.</li>
              <li>PG owners dictate their own specific refund and cancellation policies regarding their accommodation services.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1rem" }}>4. How to Request a Refund</h2>
            <p>If you believe you are entitled to a refund due to a billing error on our SaaS platform, please contact us with your account details and proof of payment.</p>
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
