"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

interface SubscriptionData {
  subscription_status: string;
  subscription_plan: string | null;
  subscription_start: any;
  name: string;
  email: string;
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (val: any): string => {
    if (!val) return "—";
    if (typeof val === "object" && val.seconds) return new Date(val.seconds * 1000).toLocaleDateString("en-IN");
    return new Date(val).toLocaleDateString("en-IN");
  };

  const isActive = data?.subscription_status === "active";

  if (loading) {
    return (
      <div>
        <h1>Subscription</h1>
        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ height: "120px", borderRadius: "var(--radius-md)", background: "var(--border-color)", animation: "pulse 1.5s infinite" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "640px" }}>
      <AnimatedSection delay={0}>
        <h1 className="mb-8">Subscription</h1>
      </AnimatedSection>

      {/* ── Status Card ──────────────────────────── */}
      <AnimatedSection delay={80}>
        <div
          className="card"
          style={{
            marginBottom: "1.5rem",
            borderLeft: `4px solid ${isActive ? "var(--success)" : "var(--warning)"}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ marginBottom: "0.25rem" }}>
                {data?.subscription_plan || "PGmate Premium 1 Year"}
              </h2>
              <p style={{ margin: 0, fontSize: "0.875rem" }}>
                Manage your PGmate subscription and billing.
              </p>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.35rem 0.85rem",
                borderRadius: "99px",
                fontSize: "0.8rem",
                fontWeight: 700,
                backgroundColor: isActive ? "rgba(0,196,159,0.15)" : "rgba(245,158,11,0.15)",
                color: isActive ? "var(--success)" : "var(--warning)",
                border: `1px solid ${isActive ? "rgba(0,196,159,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}
            >
              {isActive ? "● Active" : "● Inactive"}
            </span>
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "1rem",
            }}
          >
            <div>
              <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem" }}>Status</p>
              <p style={{ fontWeight: 600, color: "var(--text-main)", margin: 0 }}>
                {isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem" }}>Plan</p>
              <p style={{ fontWeight: 600, color: "var(--text-main)", margin: 0 }}>
                {data?.subscription_plan || "—"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem" }}>Member Since</p>
              <p style={{ fontWeight: 600, color: "var(--text-main)", margin: 0 }}>
                {formatDate(data?.subscription_start)}
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── What's Included ──────────────────────── */}
      <AnimatedSection delay={160}>
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>What's Included</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              "Unlimited Tenant Management",
              "Room & Bed Tracking",
              "Payment Recording & Receipts",
              "Complaints & Notice Board",
              "Meal Menu Management",
              "Secure Tenant Portal (Magic Link)",
              "Automated Rent Reminders",
              "Email Notifications",
              "Priority Support",
            ].map((feature) => (
              <li key={feature} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--success)", flexShrink: 0, fontSize: "1rem" }}>✓</span>
                <span style={{ color: "var(--text-main)" }}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </AnimatedSection>

      {/* ── Actions ──────────────────────────────── */}
      <AnimatedSection delay={240}>
        <div className="card">
          <h2 style={{ marginBottom: "0.5rem" }}>Need Help?</h2>
          <p style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            To upgrade, change, or cancel your subscription, please contact our support team and we'll assist you within 24 hours.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a
              href="mailto:v4services.in@gmail.com?subject=Subscription Help - PGmate"
              className="btn-primary"
              style={{ textDecoration: "none" }}
            >
              Contact Support
            </a>
            {!isActive && (
              <Link href="/onboarding/subscription" className="btn-primary" style={{ textDecoration: "none", backgroundColor: "var(--success)" }}>
                Activate Subscription
              </Link>
            )}
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
