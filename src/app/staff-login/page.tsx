"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function StaffLoginPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [propertyId, setPropertyId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    fetch("/api/payments/status")
      .then((res) => {
        if (res.ok) {
          router.push("/dashboard");
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        setCheckingAuth(false);
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        staffEmail: email.trim(),
        staffPassword: password,
        staffPropertyId: propertyId.trim(),
      });

      if (res?.ok) {
        router.push("/dashboard");
      } else {
        setError("Invalid credentials or Property ID. Please check and try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) return null;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--bg-color)",
      padding: "1rem",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Logo />
          <div style={{
            marginTop: "1rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.35rem 0.85rem",
            borderRadius: "99px",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            color: "#8b5cf6",
            fontSize: "0.8rem",
            fontWeight: 600,
            border: "1px solid rgba(139, 92, 246, 0.3)"
          }}>
            👷 Staff Login
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: "0.5rem" }}>Staff Access</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Enter your credentials provided by the PG owner.
          </p>

          {error && (
            <div style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(239,68,68,0.1)",
              color: "var(--danger)",
              border: "1px solid rgba(239,68,68,0.3)",
              fontSize: "0.875rem",
              marginBottom: "1rem"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="staff-prop-id">Property ID</label>
              <input
                id="staff-prop-id"
                type="text"
                className="input-field"
                placeholder="Provided by your PG owner"
                value={propertyId}
                onChange={e => setPropertyId(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="staff-email">Email</label>
              <input
                id="staff-email"
                type="email"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="staff-password">Password</label>
              <input
                id="staff-password"
                type="password"
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading} style={{ marginTop: "0.5rem" }}>
              {loading ? "Signing in..." : "Sign In as Staff"}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Owner?{" "}
            <a href="/login" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
              Sign in here →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
