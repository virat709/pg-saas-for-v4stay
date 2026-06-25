"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const POLL_INTERVAL_MS = 2500;
const TIMEOUT_MS = 60_000; // 60 seconds before showing "taking longer" message

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId") || "";

  const [state, setState] = useState<"verifying" | "success" | "failed" | "timeout">("verifying");
  const [message, setMessage] = useState("Verifying your payment with our server…");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const startedAt = useRef(Date.now());

  const cleanup = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (pollRef.current) clearTimeout(pollRef.current);
  };

  const poll = async () => {
    try {
      const elapsed = Date.now() - startedAt.current;

      if (elapsed >= TIMEOUT_MS) {
        setState("timeout");
        setMessage("Payment is taking longer than expected. We'll keep checking in the background.");
        cleanup();
        return;
      }

      const url = transactionId
        ? `/api/payments/status?transactionId=${transactionId}`
        : `/api/payments/status`;

      const res = await fetch(url, { cache: "no-store" });

      if (res.status === 401) {
        // Session expired — send to login
        router.push("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();

        if (data.activated === true) {
          setState("success");
          setMessage("Payment confirmed! Updating session and taking you to your dashboard…");
          cleanup();
          
          // Trigger a session refresh so Next-Auth updates the JWT cookie with active status.
          // This allows the middleware to instantly fast-path on subsequent dashboard route requests.
          fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          })
            .catch((err) => console.error("[status page] Session update failed:", err))
            .finally(() => {
              setTimeout(() => router.push("/dashboard"), 1500);
            });
          return;
        }

        if (data.transactionStatus === "failed") {
          setState("failed");
          setMessage("Payment was not completed. Please try again.");
          cleanup();
          return;
        }
      }

      // Not confirmed yet — poll again
      pollRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    } catch (err) {
      console.error("[status page] Poll error:", err);
      // Network hiccup — retry
      pollRef.current = setTimeout(poll, POLL_INTERVAL_MS * 2);
    }
  };

  useEffect(() => {
    poll();
    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconMap: Record<typeof state, { emoji: string; color: string }> = {
    verifying: { emoji: "⏳", color: "#5f259f" },
    success: { emoji: "✓", color: "#00c853" },
    failed: { emoji: "✗", color: "#e53e3e" },
    timeout: { emoji: "⌛", color: "#d69e2e" },
  };

  const icon = iconMap[state];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f3f8",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "3rem 2rem",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        {/* Status icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: state === "verifying" ? "transparent" : icon.color + "22",
            border: state === "verifying" ? `4px solid #e2e8f0` : `3px solid ${icon.color}`,
            borderTopColor: state === "verifying" ? icon.color : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: "2rem",
            color: icon.color,
            animation: state === "verifying" ? "spin 1s linear infinite" : undefined,
            transition: "all 0.3s",
          }}
        >
          {state !== "verifying" && icon.emoji}
        </div>

        <h2
          style={{
            color: "#1a202c",
            margin: "0 0 0.75rem",
            fontSize: "1.4rem",
          }}
        >
          {state === "verifying" && "Verifying Payment"}
          {state === "success" && "Payment Confirmed!"}
          {state === "failed" && "Payment Failed"}
          {state === "timeout" && "Still Verifying…"}
        </h2>

        <p style={{ color: "#718096", margin: "0 0 2rem", fontSize: "0.95rem", lineHeight: 1.6 }}>
          {message}
        </p>

        {/* Action buttons based on state */}
        {state === "verifying" && (
          <p style={{ color: "#a0aec0", fontSize: "0.8rem", margin: 0 }}>
            Please do not close or refresh this page.
          </p>
        )}

        {state === "failed" && (
          <button
            onClick={() => router.push("/onboarding/subscription")}
            style={{
              backgroundColor: "#5f259f",
              color: "white",
              padding: "0.875rem 2rem",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        )}

        {state === "timeout" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p style={{ color: "#718096", fontSize: "0.8rem", margin: 0 }}>
              Payment gateways can occasionally take a few minutes. Your payment is being verified
              in the background. You can check back later or contact support.
            </p>
            <button
              onClick={() => {
                startedAt.current = Date.now();
                setState("verifying");
                setMessage("Verifying your payment with our server…");
                poll();
              }}
              style={{
                backgroundColor: "#5f259f",
                color: "white",
                padding: "0.875rem 2rem",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Check Again
            </button>
            <button
              onClick={() => router.push("/onboarding/subscription")}
              style={{
                backgroundColor: "transparent",
                color: "#718096",
                padding: "0.75rem 2rem",
                border: "1px solid #cbd5e0",
                borderRadius: "8px",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Back to Plans
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f4f3f8",
            color: "#5f259f",
            fontWeight: 600,
          }}
        >
          Loading…
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
