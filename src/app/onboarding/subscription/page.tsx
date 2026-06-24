"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);

  const handleSelectPlan = async (name: string, price: number) => {
    setLoading(true);
    setSelectedPlan({ name, price });
    
    try {
      const res = await fetch("/api/payments/phonepe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: name, price }),
      });
      
      if (!res.ok) throw new Error("Payment initiation failed");
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No redirect URL returned");
      }
    } catch (e) {
      console.error(e);
      alert("Error initiating payment. Please try again.");
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
      <div className="card animate-fade-in" style={{ maxWidth: '800px', width: '100%', padding: '2rem' }}>
        <div className="text-center mb-8">
          <h2>Choose Your Plan</h2>
          <p>Select a subscription plan for your PG.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          
          <div className="card text-center" style={{ border: '2px solid transparent', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3>6 Months</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, margin: '1rem 0', color: 'var(--primary)' }}>
              ₹6,999<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/6 mo</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left', flex: 1 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>Full Feature Access</li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>Tenant Portal Links</li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>Complaints Management</li>
            </ul>
            <button className="btn-primary w-full" onClick={() => handleSelectPlan('6 Months', 6999)} disabled={loading}>
              Select Plan
            </button>
          </div>

          <div className="card text-center" style={{ border: '2px solid var(--primary)', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>RECOMMENDED</div>
            <h3>1 Year</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, margin: '1rem 0', color: 'var(--primary)' }}>
              ₹9,999<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/yr</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left', flex: 1 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>Full Feature Access</li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>Tenant Portal Links</li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>Complaints Management</li>
              <li style={{ padding: '0.5rem 0', color: 'var(--success)', fontWeight: 500 }}>Save ₹3,999 vs 6-mo plan</li>
            </ul>
            <button className="btn-primary w-full" onClick={() => handleSelectPlan('1 Year', 9999)} disabled={loading}>
              Select Plan
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
