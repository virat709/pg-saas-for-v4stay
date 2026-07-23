"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);
  const [propertyCount, setPropertyCount] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(0);
  const [isUpgrade, setIsUpgrade] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => { if (res.ok) return res.json(); throw new Error(); })
      .then((data) => {
        const limit = data.property_limit || 1;
        setCurrentLimit(limit);
        const active = data.subscription_status === "active";
        setIsUpgrade(active);
        if (active) setPropertyCount(limit + 1);

        const params = new URLSearchParams(window.location.search);
        if (params.get("upgrade") === "true") {
          setIsUpgrade(true);
          setPropertyCount(limit + 1);
          return;
        }
        if (active) router.push("/dashboard");
      })
      .catch((err) => console.error("Mount status check failed:", err));
  }, [router]);

  const loadRazorpay = (): Promise<boolean> => new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleSelectPlan = async (name: string, price: number, quantity: number) => {
    setLoading(true);
    setSelectedPlan({ name, price });

    try {
      const res = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: name, price, propertyCount: quantity }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        alert("You already have an active subscription! Redirecting to your dashboard...");
        router.push("/dashboard");
        return;
      }

      if (!res.ok) throw new Error(data.message || "Payment initiation failed");

      const rzpLoaded = await loadRazorpay();
      if (!rzpLoaded) throw new Error("Razorpay SDK failed to load. Please check your internet connection.");

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        name: "PGmate",
        description: name,
        image: "/icon.svg",
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/razorpay-callback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              const transId = response.razorpay_subscription_id || response.razorpay_order_id;
              router.push("/payments/status?transactionId=" + transId);
            } else {
              alert(verifyData.message || "Payment verification failed. Please contact support.");
              setLoading(false);
              setSelectedPlan(null);
            }
          } catch {
            alert("Error verifying payment. Please contact support.");
            setLoading(false);
            setSelectedPlan(null);
          }
        },
        prefill: { name: "PG Owner" },
        theme: { color: "#10b981" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setSelectedPlan(null);
          },
        },
      };

      if (data.subscription_id) {
        options.subscription_id = data.subscription_id;
      } else {
        options.order_id = data.id;
        options.amount = data.amount;
        options.currency = data.currency;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        alert(`Payment Failed: ${response.error.description}`);
        setLoading(false);
        setSelectedPlan(null);
      });
      rzp.open();

    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error initiating payment. Please try again.");
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const starterPrice = isUpgrade
    ? (propertyCount - currentLimit) * 4999
    : 6999 + (propertyCount - 1) * 4999;
  const premiumPrice = isUpgrade
    ? (propertyCount - currentLimit) * 6999
    : 11999 + (propertyCount - 1) * 6999;
  // GST @ 18% — charged in Razorpay, not shown on page
  const starterTotal = Math.floor(starterPrice * 1.18);
  const premiumTotal = Math.floor(premiumPrice * 1.18);

  if (selectedPlan && loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-color)", padding: "1rem" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{
            width: "56px", height: "56px", border: "4px solid var(--border-color)",
            borderTop: "4px solid #10b981", borderRadius: "50%",
            animation: "spin 1s linear infinite", margin: "0 auto 1.5rem"
          }} />
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Opening Secure Checkout</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Preparing payment for <strong>{selectedPlan.name}</strong> — ₹{selectedPlan.price.toLocaleString()}
            {selectedPlan.name === "30 Days Free Trial" ? " (auto-refunded)" : " (incl. 18% GST)"}
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)", padding: "1rem 1rem 4rem" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", padding: "2rem 0 1.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏠</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            {isUpgrade ? "Upgrade Your Plan" : "Activate Your Plan"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
            {isUpgrade
              ? "Add more PG properties to your existing plan."
              : "One-time setup. Full access. Manage all your PGs from one dashboard."}
          </p>
        </div>

        {/* Property Count Selector */}
        <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem", border: "1px dashed var(--primary)" }}>
          <label style={{ fontSize: "0.875rem", fontWeight: 600, display: "block", marginBottom: "0.875rem", textAlign: "center" }}>
            How many PG properties to manage?
          </label>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
            <button
              className="btn-secondary"
              onClick={() => setPropertyCount(p => Math.max(isUpgrade ? currentLimit + 1 : 1, p - 1))}
              disabled={isUpgrade ? propertyCount <= currentLimit + 1 : propertyCount <= 1}
              style={{ width: "44px", height: "44px", borderRadius: "50%", fontSize: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >−</button>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)", minWidth: "2rem", textAlign: "center" }}>
              {propertyCount}
            </span>
            <button
              className="btn-secondary"
              onClick={() => setPropertyCount(p => p + 1)}
              style={{ width: "44px", height: "44px", borderRadius: "50%", fontSize: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >+</button>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", marginTop: "0.75rem", marginBottom: 0 }}>
            {isUpgrade
              ? `Upgrading from current ${currentLimit} PG limit`
              : propertyCount === 1
              ? "Base plan — 1 PG property"
              : `1 Base PG + ${propertyCount - 1} Additional PG(s)`}
          </p>
        </div>

        {/* Plan Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>

          {/* Premium Plan — 1 Year */}
          <div className="card" style={{ border: "2px solid var(--success)", position: "relative", overflow: "visible" }}>
            <div style={{
              position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)",
              background: "var(--success)", color: "#0f172a", padding: "3px 14px",
              borderRadius: "99px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap"
            }}>
              {!isUpgrade ? "30-DAY FREE TRIAL INCLUDED" : "BEST VALUE"}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.05rem", marginBottom: "0.25rem" }}>
                  {isUpgrade ? "Upgrade — 1 Year" : "PGmate Premium — 1 Year"}
                </h3>
                {!isUpgrade ? (
                  <span style={{ fontSize: "0.78rem", color: "var(--success)", fontWeight: 600 }}>
                    🎁 First 30 Days Free • Auto-bills ₹{premiumPrice.toLocaleString()} + GST on Day 30
                  </span>
                ) : (
                  propertyCount > 1 && (
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      ₹11,999 base + {propertyCount - 1} × ₹6,999 addons
                    </span>
                  )
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "1rem" }}>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--success)", lineHeight: 1 }}>
                  {!isUpgrade ? "₹5" : `₹${premiumPrice.toLocaleString()}`}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--success)", fontWeight: 500 }}>
                  {!isUpgrade ? "Refunded in 24h" : "+ 18% GST"}
                </div>
                {!isUpgrade && <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>Save ₹1,999 vs 6-mo</div>}
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {["30 Days Full Access Included", "Unlimited Tenants & Rooms", "Payment Tracking & Receipts", "Tenant Portal (Magic Link)", "Complaints & Notice Board", "Meal Menu Management", "Rent Reminder Emails", "Revenue Analytics", "CSV Export", "Priority Support"].map(f => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--success)", flexShrink: 0, fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>

            <button
              className="btn-primary w-full"
              style={{ fontSize: "1rem", padding: "0.875rem", backgroundColor: "var(--success)", color: "#0f172a", fontWeight: 700 }}
              onClick={() => handleSelectPlan("PGmate Premium 1 Year", premiumTotal, propertyCount)}
              disabled={loading}
            >
              {loading && selectedPlan?.name.includes("Premium")
                ? "Opening..."
                : !isUpgrade
                ? "Start 30-Day Free Trial →"
                : `Pay ₹${premiumPrice.toLocaleString()} + GST →`}
            </button>
          </div>

          {/* Starter Plan — 6 Months */}
          <div className="card" style={{ border: "1px solid var(--border-color)", position: "relative", overflow: "visible" }}>
            {!isUpgrade && (
              <div style={{
                position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)",
                background: "var(--primary)", color: "#ffffff", padding: "3px 14px",
                borderRadius: "99px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap"
              }}>30-DAY FREE TRIAL INCLUDED</div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.05rem", marginBottom: "0.25rem" }}>
                  {isUpgrade ? "Upgrade — 6 Months" : "PGmate Starter — 6 Months"}
                </h3>
                {!isUpgrade ? (
                  <span style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: 600 }}>
                    🎁 First 30 Days Free • Auto-bills ₹{starterPrice.toLocaleString()} + GST on Day 30
                  </span>
                ) : (
                  propertyCount > 1 && (
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      ₹6,999 base + {propertyCount - 1} × ₹4,999 addons
                    </span>
                  )
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "1rem" }}>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1 }}>
                  {!isUpgrade ? "₹5" : `₹${starterPrice.toLocaleString()}`}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {!isUpgrade ? "Refunded in 24h" : "+ 18% GST · 6 months"}
                </div>
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {["30 Days Full Access Included", "Unlimited Tenants & Rooms", "Payment Tracking & Receipts", "Tenant Portal (Magic Link)", "Complaints & Notice Board", "Priority Support"].map(f => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--text-muted)", flexShrink: 0, fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>

            <button
              className="btn-secondary w-full"
              style={{ fontSize: "1rem", padding: "0.875rem" }}
              onClick={() => handleSelectPlan("PGmate Starter 6 Months", starterTotal, propertyCount)}
              disabled={loading}
            >
              {loading && selectedPlan?.name.includes("Starter")
                ? "Opening..."
                : !isUpgrade
                ? "Start 30-Day Free Trial →"
                : `Pay ₹${starterPrice.toLocaleString()} + GST →`}
            </button>
          </div>
        </div>

        {/* Payment methods badge */}
        <div style={{ textAlign: "center", padding: "0.75rem", backgroundColor: "var(--surface-color)", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          🔒 Secured by Razorpay &nbsp;•&nbsp; UPI · Cards · Netbanking · Wallets
        </div>

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
          * Prices shown are excluding GST. 18% GST will be added at checkout.
        </p>
        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Questions? <a href="mailto:v4services.in@gmail.com" style={{ color: "var(--primary)", fontWeight: 500 }}>Contact us</a>
        </p>
      </div>
    </div>
  );
}
