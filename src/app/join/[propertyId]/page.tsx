"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Logo from "@/components/Logo";

export default function TenantJoinPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [property, setProperty] = useState<{ name: string; address?: string; city?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [idProofUrl, setIdProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!propertyId) return;
    fetch(`/api/join/${propertyId}`)
      .then((r) => {
        if (!r.ok) throw new Error("PG Property not found or inactive.");
        return r.json();
      })
      .then(setProperty)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [propertyId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setIdProofUrl(data.url);
    } catch (err: any) {
      alert(err.message || "Error uploading ID proof");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/join/${propertyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          emergency_contact: emergencyContact,
          id_proof_url: idProofUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");
      setSuccessMsg(data.message);
    } catch (err: any) {
      setError(err.message || "Error submitting application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        Loading PG Registration details...
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Registration Unavailable</h2>
        <p style={{ color: "#94a3b8", maxWidth: "400px" }}>{error || "This PG self-registration link is invalid or inactive."}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", padding: "2rem 1rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        {/* Header Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Logo size={32} variant="light" showTagline={false} />
        </div>

        {/* Card Container */}
        <div style={{ backgroundColor: "#1e293b", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", padding: "2rem", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#00c49f" }}>Tenant Self-Registration</span>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", marginTop: "0.25rem", margin: 0 }}>{property.name}</h1>
            {property.address && <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{property.address}, {property.city}</p>}
          </div>

          {successMsg ? (
            <div style={{ backgroundColor: "rgba(0,196,159,0.12)", border: "1px solid #00c49f", borderRadius: "14px", padding: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✅</div>
              <h3 style={{ color: "#00c49f", fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Application Submitted!</h3>
              <p style={{ color: "#e2e8f0", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                Thank you, <strong>{name}</strong>! Your details have been sent to the PG management team. They will assign your room and confirm your stay shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {error && (
                <div style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "0.75rem", borderRadius: "10px", fontSize: "0.85rem" }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.4rem" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "0.95rem", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.4rem" }}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "0.95rem", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.4rem" }}>Emergency Contact Number</label>
                <input
                  type="tel"
                  placeholder="Parent / Guardian Phone"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "0.95rem", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.4rem" }}>Government ID Proof (Aadhaar / Passport / DL)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "10px", backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", fontSize: "0.85rem" }}
                />
                {uploading && <p style={{ fontSize: "0.8rem", color: "#00c49f", marginTop: "0.3rem" }}>Uploading document...</p>}
                {idProofUrl && <p style={{ fontSize: "0.8rem", color: "#00c49f", marginTop: "0.3rem" }}>✓ ID document uploaded!</p>}
              </div>

              <button
                type="submit"
                disabled={submitting || uploading}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  borderRadius: "12px",
                  backgroundColor: "#00c49f",
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "1rem",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                  boxShadow: "0 0 20px rgba(0,196,159,0.3)",
                }}
              >
                {submitting ? "Submitting Application..." : "Submit Join Request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
