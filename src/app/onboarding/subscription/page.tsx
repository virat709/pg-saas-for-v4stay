"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);

  // Check if owner already has an active subscription on mount
  useEffect(() => {
    fetch("/api/payments/status")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to check status");
      })
      .then((data) => {
        if (data.activated === true) {
          // If already active, trigger session refresh to update Next-Auth cookie, then redirect to dashboard
          fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }).finally(() => {
            router.push("/dashboard");
          });
        }
      })
      .catch((err) => console.error("Mount status check failed:", err));
  }, [router]);

  const handleSelectPlan = async (name: string, price: number) => {
    setLoading(true);
    setSelectedPlan({ name, price });
    
    try {
      const res = await fetch("/api/payments/phonepe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: name, price }),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (res.status === 409) {
        alert("You already have an active subscription! Redirecting to your dashboard...");
        // Refresh session
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }).catch(() => {});
        router.push("/dashboard");
        return;
      }
      
      if (!res.ok) {
        throw new Error(data.message || "Payment initiation failed");
      }
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No redirect URL returned");
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error initiating payment. Please try again.");
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  if (selectedPlan && loading) {
    return (
      <div className="flex items-center justify-center w-full" style={{ minHeight: '100vh', padding: '1rem', backgroundColor: 'var(--bg-color)' }}>
        <div className="card animate-fade-in text-center" style={{ maxWidth: '400px', width: '100%', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "4px solid var(--border-color)",
            borderTop: "4px solid var(--primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "1.5rem"
          }} />
          <h2>Redirecting to PhonePe</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Connecting to secure checkout for the <strong>{selectedPlan.name}</strong> plan (₹{selectedPlan.price.toLocaleString()})...
          </p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full" style={{ minHeight: '100vh', padding: '1rem', backgroundColor: 'var(--bg-color)' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '800px', width: '100%', padding: '2.5rem' }}>
        <div className="text-center mb-8">
          <h2 style={{ fontSize: '1.75rem' }}>Activate Your Plan</h2>
          <p style={{ marginBottom: 0 }}>Choose the plan that fits your PG.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", textAlign: "left" }}>
          
          {/* 6 Month Plan */}
          <div
            className="card"
            style={{
              position: "relative",
              width: "100%",
              background: "var(--surface-color)",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>PGmate Starter — 6 Months</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1, margin: "1rem 0" }}>₹6,999</div>
            
            <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1 }}>
              {[
                "Unlimited Tenants & Rooms",
                "Payment Tracking & Receipts",
                "Tenant Portal (Magic Link)",
                "Complaints & Notice Board",
                "Priority Support",
              ].map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.9rem", color: "var(--text-main)" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className="btn-secondary w-full"
              style={{ fontSize: '1.05rem', padding: '0.875rem' }}
              onClick={() => handleSelectPlan('PGmate Starter 6 Months', 6999)}
              disabled={loading}
            >
              Get Started
            </button>
          </div>

          {/* 1 Year Plan (Highlighted) */}
          <div
            className="card"
            style={{
              position: "relative",
              width: "100%",
              border: "2px solid var(--success)",
              boxShadow: "0 0 40px rgba(16, 185, 129, 0.1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Popular badge */}
            <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", background: "var(--success)", color: "#0f172a", padding: "4px 16px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
              BEST VALUE
            </div>

            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>PGmate Premium — 1 Year</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--success)", lineHeight: 1, margin: "1rem 0" }}>₹11,999</div>
            <div style={{ color: "var(--success)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem" }}>Save ₹1,999 compared to 6-month plan</div>

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
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.9rem", color: "var(--text-main)" }}>
                  <span style={{ color: "var(--success)", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className="btn-primary w-full"
              style={{ fontSize: '1.05rem', padding: '0.875rem', backgroundColor: 'var(--success)', color: '#0f172a' }}
              onClick={() => handleSelectPlan('PGmate Premium 1 Year', 11999)}
              disabled={loading}
            >
              Get Started — ₹11,999
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem', marginBottom: 0 }}>
          Questions? <a href="mailto:v4services.in@gmail.com" style={{ color: 'var(--primary)', fontWeight: 500 }}>Contact us</a>
        </p>
      </div>
    </div>
  );
}
