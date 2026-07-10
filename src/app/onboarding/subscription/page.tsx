"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);
  const [propertyCount, setPropertyCount] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(0);

  // Check if owner already has an active subscription on mount
  useEffect(() => {
    // Fetch settings to check current limit and active status
    fetch("/api/settings")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to check status");
      })
      .then((data) => {
        const limit = data.property_limit || 1;
        setCurrentLimit(limit);
        
        const params = new URLSearchParams(window.location.search);
        if (params.get("upgrade") === "true") {
          setPropertyCount(limit + 1);
          return;
        }

        if (data.subscription_status === "active") {
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

  const handleSelectPlan = async (name: string, price: number, quantity: number) => {
    setLoading(true);
    setSelectedPlan({ name, price });
    
    try {
      const res = await fetch("/api/payments/phonepe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: name, price, propertyCount: quantity }),
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
          <p style={{ marginBottom: '1.5rem' }}>Choose the plan that fits your PG chain size.</p>
          
          {/* Property Count Selector Card */}
          <div className="card mb-8 text-center" style={{ maxWidth: '400px', margin: '0 auto 2rem auto', padding: '1.25rem', border: '1px dashed var(--primary)' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>
              How many properties do you want to manage?
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setPropertyCount(prev => Math.max(currentLimit > 0 ? currentLimit + 1 : 1, prev - 1))}
                style={{ padding: '0.25rem', fontSize: '1.25rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                disabled={currentLimit > 0 && propertyCount <= currentLimit + 1}
              >
                -
              </button>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{propertyCount}</span>
              <button 
                className="btn-secondary" 
                onClick={() => setPropertyCount(prev => prev + 1)}
                style={{ padding: '0.25rem', fontSize: '1.25rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
              >
                +
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
              {currentLimit > 0 
                ? `Upgrading from your current limit of ${currentLimit} PG(s).` 
                : propertyCount === 1 
                ? "Standard base plan configuration." 
                : `Includes 1 Base PG + ${propertyCount - 1} Additional PG Addon(s)`}
            </p>
          </div>
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
            <div style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1, margin: "1rem 0" }}>
              ₹{(6999 + (propertyCount - 1) * 4999).toLocaleString()}
            </div>
            {propertyCount > 1 && (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
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
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.9rem", color: "var(--text-main)" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className="btn-secondary w-full"
              style={{ fontSize: '1.05rem', padding: '0.875rem' }}
              onClick={() => handleSelectPlan('PGmate Starter 6 Months', 6999 + (propertyCount - 1) * 4999, propertyCount)}
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
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--success)", lineHeight: 1, margin: "1rem 0" }}>
              ₹{(11999 + (propertyCount - 1) * 6999).toLocaleString()}
            </div>
            {propertyCount > 1 ? (
              <div style={{ color: "var(--success)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                ₹11,999 base + {propertyCount - 1} × ₹6,999 addons
              </div>
            ) : (
              <div style={{ color: "var(--success)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                Save ₹1,999 compared to 6-month plan
              </div>
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
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.9rem", color: "var(--text-main)" }}>
                  <span style={{ color: "var(--success)", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className="btn-primary w-full"
              style={{ fontSize: '1.05rem', padding: '0.875rem', backgroundColor: 'var(--success)', color: '#0f172a' }}
              onClick={() => handleSelectPlan('PGmate Premium 1 Year', 11999 + (propertyCount - 1) * 6999, propertyCount)}
              disabled={loading}
            >
              Get Started
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
