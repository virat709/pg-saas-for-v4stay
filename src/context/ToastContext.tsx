"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++counter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) =>
    setToasts(prev => prev.filter(t => t.id !== id));

  const icon = (type: ToastType) => {
    if (type === "success") return "✓";
    if (type === "error") return "✕";
    if (type === "warning") return "⚠";
    return "ℹ";
  };

  const colors: Record<ToastType, { bg: string; border: string; color: string }> = {
    success: { bg: "rgba(16,185,129,0.12)", border: "#10b981", color: "#10b981" },
    error:   { bg: "rgba(239,68,68,0.12)",  border: "#ef4444", color: "#ef4444" },
    warning: { bg: "rgba(245,158,11,0.12)", border: "#f59e0b", color: "#f59e0b" },
    info:    { bg: "rgba(59,130,246,0.12)", border: "#3b82f6", color: "#3b82f6" },
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          pointerEvents: "none",
        }}
      >
        {toasts.map(t => {
          const c = colors[t.type];
          return (
            <div
              key={t.id}
              onClick={() => dismiss(t.id)}
              style={{
                pointerEvents: "all",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.8rem 1.1rem",
                backgroundColor: "var(--surface-color, #1e293b)",
                border: `1px solid ${c.border}`,
                borderLeft: `4px solid ${c.border}`,
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                minWidth: "260px",
                maxWidth: "380px",
                animation: "toast-in 0.3s ease",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: c.bg,
                  border: `1px solid ${c.border}`,
                  color: c.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {icon(t.type)}
              </span>
              <span style={{ fontSize: "0.88rem", color: "var(--text-main, #e2e8f0)", lineHeight: 1.4 }}>
                {t.message}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
