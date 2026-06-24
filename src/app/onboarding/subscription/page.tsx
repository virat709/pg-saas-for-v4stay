"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      await fetch("/api/auth/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedPlan?.name || "1 Year", status: "active" }),
      });
      
      router.push("/dashboard");
    } catch (e) {
      setLoading(false);
    }
  };

  if (selectedPlan) {
    // Payment Gateway view
    return (
      <div className="flex items-center justify-center w-full" style={{ minHeight: '100vh', padding: '1rem', backgroundColor: 'var(--bg-color)' }}>
        <div className="card animate-fade-in text-center" style={{ maxWidth: '400px', width: '100%', padding: '3rem' }}>
          <h2>Complete Payment</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Pay <strong>₹{selectedPlan.price.toLocaleString()}</strong> for the <strong>{selectedPlan.name}</strong> plan.
          </p>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#000', marginBottom: '0.5rem' }}>Scan or Pay via UPI</h3>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
              9652172595@axl
            </p>
            {/* Generate a QR code using an open API for UPI string */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=9652172595@axl&pn=PG%20V4Stay&am=${selectedPlan.price}&cu=INR`} 
              alt="UPI QR Code" 
              style={{ width: '200px', height: '200px', margin: '0 auto', display: 'block' }} 
            />
          </div>

          <div className="flex flex-col gap-4">
            <button className="btn-primary w-full" onClick={handleSubscribe} disabled={loading}>
              {loading ? 'Processing...' : 'I Have Paid'}
            </button>
            <button className="btn-secondary w-full" onClick={() => setSelectedPlan(null)} disabled={loading} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
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
            <button className="btn-primary w-full" onClick={() => setSelectedPlan({ name: '6 Months', price: 6999 })}>
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
            <button className="btn-primary w-full" onClick={() => setSelectedPlan({ name: '1 Year', price: 9999 })}>
              Select Plan
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
