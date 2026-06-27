"use client";

import { useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("success");
      setMessage("Password reset email sent! Check your inbox (and spam folder).");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to send reset email. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center w-full" style={{ minHeight: "100vh", padding: "1rem" }}>
      <div className="card animate-fade-in" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="text-center mb-8" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <Logo size={42} variant="dark" showTagline={false} />
          <h1 style={{ fontSize: "1.5rem", marginBottom: 0 }}>Forgot Password?</h1>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {status === "success" ? (
          <div style={{
            textAlign: "center",
            padding: "1.5rem",
            backgroundColor: "rgba(0, 196, 159, 0.1)",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(0, 196, 159, 0.3)",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✅</div>
            <p style={{ color: "var(--success)", fontWeight: 600, marginBottom: "0.25rem" }}>Email Sent!</p>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>{message}</p>
            <Link
              href="/login"
              className="btn-primary"
              style={{ display: "inline-block", marginTop: "1.5rem", textDecoration: "none" }}
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            {status === "error" && (
              <div style={{
                color: "var(--danger)",
                marginBottom: "1rem",
                textAlign: "center",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-col flex">
              <div className="input-group">
                <label className="input-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="owner@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full mt-4"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="text-center mt-4 pt-4" style={{ borderTop: "1px solid var(--border-color)", marginTop: "1.5rem" }}>
              <p style={{ margin: 0, fontSize: "0.875rem" }}>
                Remember your password?{" "}
                <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
