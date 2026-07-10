"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AnimatedSection } from "@/components/animations/AnimatedSection";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [ownerData, setOwnerData] = useState<any>(null);
  const [propertyCount, setPropertyCount] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);



  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/properties").then((r) => r.json()),
    ])
      .then(([settingsData, propertiesData]) => {
        setOwnerData(settingsData);
        setProfile({ name: settingsData.name || "", email: settingsData.email || "", phone: settingsData.phone || "" });
        setPropertyCount(Array.isArray(propertiesData) ? propertiesData.length : 0);
      })
      .catch(console.error)
      .finally(() => setProfileLoading(false));
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, phone: profile.phone }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  };



  if (profileLoading) {
    return (
      <div>
        <h1>Account Settings</h1>
        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: "48px", borderRadius: "var(--radius-md)", background: "var(--border-color)", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "640px" }}>
      <AnimatedSection delay={0}>
        <h1 className="mb-8">Account Settings</h1>
      </AnimatedSection>

      {/* ── Profile Section ─────────────────────── */}
      <AnimatedSection delay={80}>
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Profile Information</h2>

          {profileMsg && (
            <div style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
              backgroundColor: profileMsg.type === "success" ? "rgba(0,196,159,0.1)" : "rgba(239,68,68,0.1)",
              color: profileMsg.type === "success" ? "var(--success)" : "var(--danger)",
              border: `1px solid ${profileMsg.type === "success" ? "rgba(0,196,159,0.3)" : "rgba(239,68,68,0.3)"}`,
              fontSize: "0.875rem",
            }}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSave}>
            <div className="input-group">
              <label className="input-label" htmlFor="settings-name">Full Name</label>
              <input
                id="settings-name"
                type="text"
                className="input-field"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="settings-email">Email Address</label>
              <input
                id="settings-email"
                type="email"
                className="input-field"
                value={profile.email}
                disabled
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
              <p style={{ fontSize: "0.75rem", margin: "0.25rem 0 0", color: "var(--text-muted)" }}>
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="settings-phone">Phone Number</label>
              <input
                id="settings-phone"
                type="tel"
                className="input-field"
                placeholder="+91 98765 43210"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={profileSaving}>
              {profileSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </AnimatedSection>

      {/* ── Subscription Section ────────────────── */}
      <AnimatedSection delay={120}>
        <div
          className="card"
          style={{
            marginBottom: "1.5rem",
            borderLeft: `4px solid ${ownerData?.subscription_status === "active" ? "var(--success)" : "var(--warning)"}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <h2 style={{ marginBottom: "0.25rem" }}>Subscription Details</h2>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>
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
                backgroundColor: ownerData?.subscription_status === "active" ? "rgba(0,196,159,0.15)" : "rgba(245,158,11,0.15)",
                color: ownerData?.subscription_status === "active" ? "var(--success)" : "var(--warning)",
                border: `1px solid ${ownerData?.subscription_status === "active" ? "rgba(0,196,159,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}
            >
              {ownerData?.subscription_status === "active" ? "● Active" : "● Inactive"}
            </span>
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem"
            }}
          >
            <div>
              <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem", color: "var(--text-muted)" }}>Plan</p>
              <p style={{ fontWeight: 600, color: "var(--text-main)", margin: 0 }}>
                {ownerData?.plan_tier || ownerData?.subscription_plan || "—"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem", color: "var(--text-muted)" }}>PG limit</p>
              <p style={{ fontWeight: 600, color: "var(--text-main)", margin: 0 }}>
                {ownerData?.property_limit || 1} Property(ies)
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem", color: "var(--text-muted)" }}>Member Since</p>
              <p style={{ fontWeight: 600, color: "var(--text-main)", margin: 0 }}>
                {ownerData?.subscription_activated_at ? (
                  new Date(typeof ownerData.subscription_activated_at === "object" && ownerData.subscription_activated_at.seconds ? ownerData.subscription_activated_at.seconds * 1000 : ownerData.subscription_activated_at).toLocaleDateString("en-IN")
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
            <a
              href="mailto:v4services.in@gmail.com?subject=Subscription Help - PGmate"
              className="btn-primary"
              style={{ textDecoration: "none", fontSize: "0.85rem", padding: "0.5rem 1rem" }}
            >
              Support Help
            </a>
            {ownerData?.subscription_status !== "active" && (
              <Link href="/onboarding/subscription" className="btn-primary" style={{ textDecoration: "none", backgroundColor: "var(--success)", color: "#0f172a", fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                Activate Subscription
              </Link>
            )}
            {ownerData?.subscription_status === "active" && propertyCount < (ownerData?.property_limit || 1) && (
              <button
                onClick={() => router.push("/onboarding/property")}
                className="btn-primary"
                style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", backgroundColor: "var(--primary)", border: "none", cursor: "pointer" }}
              >
                + Add Another PG ({propertyCount}/{ownerData?.property_limit || 1} used)
              </button>
            )}
            {ownerData?.subscription_status === "active" && propertyCount >= (ownerData?.property_limit || 1) && (
              <button
                onClick={() => router.push("/onboarding/subscription?upgrade=true")}
                className="btn-primary"
                style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", backgroundColor: "var(--success)", color: "#0f172a", border: "none", cursor: "pointer" }}
              >
                Upgrade Plan ({propertyCount}/{ownerData?.property_limit || 1} used)
              </button>
            )}
          </div>
        </div>
      </AnimatedSection>



      {/* ── Danger Zone ─────────────────────────── */}
      <AnimatedSection delay={240}>
        <div className="card" style={{ borderLeft: "4px solid var(--danger)" }}>
          <h2 style={{ color: "var(--danger)", marginBottom: "0.5rem" }}>Danger Zone</h2>
          <p style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
            To delete your account and all associated data, please contact our support team.
            This action is permanent and cannot be undone.
          </p>
          <a
            href="mailto:v4services.in@gmail.com?subject=Account Deletion Request"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--danger)",
              color: "var(--danger)",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
              transition: "var(--transition)",
            }}
          >
            Request Account Deletion
          </a>
        </div>
      </AnimatedSection>
    </div>
  );
}
