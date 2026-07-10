"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPropertyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, city }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to add property");
      }

      // Redirect to subscription step
      router.push("/onboarding/subscription");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full" style={{ minHeight: '100vh', padding: '1rem' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center mb-8">
          <h2>Add Your First PG</h2>
          <p>Let's set up your property details to get started.</p>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: 'var(--danger)', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', lineHeight: 1.4 }}>
              {error}
            </div>
            {(error.toLowerCase().includes("limit") || error.toLowerCase().includes("upgrade")) && (
              <button
                type="button"
                onClick={() => router.push("/onboarding/subscription?upgrade=true")}
                className="btn-primary w-full mt-3"
                style={{ backgroundColor: "var(--success)", color: "#0f172a" }}
              >
                Upgrade Subscription Plan
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col flex">
          <div className="input-group">
            <label className="input-label" htmlFor="name">PG Name</label>
            <input 
              id="name" 
              type="text" 
              className="input-field" 
              placeholder="E.g. Sunshine PG"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="address">Address</label>
            <input 
              id="address" 
              type="text" 
              className="input-field" 
              placeholder="123 Street Name, Landmark"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="city">City</label>
            <input 
              id="city" 
              type="text" 
              className="input-field" 
              placeholder="E.g. Ahmedabad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
