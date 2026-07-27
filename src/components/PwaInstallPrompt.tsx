"use client";

import { useState, useEffect } from "react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if user hasn't dismissed it previously
      const isDismissed = localStorage.getItem("pgmate_pwa_dismissed");
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pgmate_pwa_dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "90%",
        maxWidth: "450px",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        border: "1px solid rgba(0, 196, 159, 0.4)",
        borderRadius: "16px",
        padding: "1rem 1.25rem",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            backgroundColor: "#ea580c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          📱
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#ffffff" }}>
            Install PGmate App
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            Add to home screen for 1-tap offline access
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button
          onClick={handleInstallClick}
          style={{
            padding: "0.45rem 0.9rem",
            backgroundColor: "#00c49f",
            color: "#0f172a",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.8rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            fontSize: "1.1rem",
            cursor: "pointer",
            padding: "0.2rem",
          }}
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
