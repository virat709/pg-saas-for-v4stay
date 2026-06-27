"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setProfile({ name: data.name || "", email: data.email || "", phone: data.phone || "" });
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Not authenticated. Please log out and log back in.");
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err.code === "auth/wrong-password"
        ? "Current password is incorrect."
        : err.code === "auth/too-many-requests"
        ? "Too many attempts. Please try again later."
        : err.message || "Failed to change password.";
      setPasswordMsg({ type: "error", text: msg });
    } finally {
      setPasswordSaving(false);
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

      {/* ── Change Password Section ──────────────── */}
      <AnimatedSection delay={160}>
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ marginBottom: "0.5rem" }}>Change Password</h2>
          <p style={{ marginBottom: "1.5rem", fontSize: "0.875rem" }}>
            Only applies to email/password accounts. Google sign-in accounts cannot set a password here.
          </p>

          {passwordMsg && (
            <div style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
              backgroundColor: passwordMsg.type === "success" ? "rgba(0,196,159,0.1)" : "rgba(239,68,68,0.1)",
              color: passwordMsg.type === "success" ? "var(--success)" : "var(--danger)",
              border: `1px solid ${passwordMsg.type === "success" ? "rgba(0,196,159,0.3)" : "rgba(239,68,68,0.3)"}`,
              fontSize: "0.875rem",
            }}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div className="input-group">
              <label className="input-label" htmlFor="current-password">Current Password</label>
              <input
                id="current-password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                className="input-field"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={passwordSaving}>
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
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
