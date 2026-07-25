"use client";

import React, { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { DEMO_PROPERTIES } from "@/lib/demoData";

// Demo Context for Active Property Selection & Modal Prompting
interface DemoContextType {
  activePropertyId: string;
  setActivePropertyId: (id: string) => void;
  triggerReadOnlyNotice: (actionName?: string) => void;
}

const DemoContext = createContext<DemoContextType>({
  activePropertyId: "all",
  setActivePropertyId: () => {},
  triggerReadOnlyNotice: () => {},
});

export const useDemoContext = () => useContext(DemoContext);

export default function DemoLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activePropertyId, setActivePropertyId] = useState<string>("all");
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [attemptedAction, setAttemptedAction] = useState<string>("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const triggerReadOnlyNotice = (actionName?: string) => {
    setAttemptedAction(actionName || "Data modification");
    setNoticeModalOpen(true);
  };

  const navItems = [
    { name: "Overview", path: "/demo" },
    { name: "Rooms & Beds", path: "/demo/rooms" },
    { name: "Tenants", path: "/demo/tenants" },
    { name: "Payments", path: "/demo/payments" },
    { name: "Expenses", path: "/demo/expenses" },
    { name: "Complaints", path: "/demo/complaints" },
    { name: "Food Menu", path: "/demo/menu" },
    { name: "Notices", path: "/demo/notices" },
  ];

  const activeProperty = DEMO_PROPERTIES.find((p) => p.id === activePropertyId);
  const currentDisplayName = activePropertyId === "all" ? "All Properties" : activeProperty?.name || "Sunrise Luxury PG";

  return (
    <DemoContext.Provider value={{ activePropertyId, setActivePropertyId, triggerReadOnlyNotice }}>
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)", color: "var(--text-main)" }}>
        {/* ── DEMO NOTICE BANNER ──────────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "linear-gradient(90deg, #ea580c, #f59e0b)",
            background: "linear-gradient(90deg, #c2410c 0%, #ea580c 50%, #f59e0b 100%)",
            color: "#ffffff",
            padding: "0.55rem 1.5rem",
            fontSize: "0.88rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            boxShadow: "0 2px 10px rgba(234, 88, 12, 0.3)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.1rem" }}>⚡</span>
            <span>
              <strong>Live Interactive Demo</strong> — You are viewing PGmate with realistic sample PG data (Read-Only Mode)
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
            <Link
              href="/register"
              style={{
                backgroundColor: "#ffffff",
                color: "#c2410c",
                padding: "0.35rem 0.9rem",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "0.82rem",
                textDecoration: "none",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                transition: "transform 0.15s ease",
              }}
            >
              🚀 Create Account
            </Link>
            <Link
              href="/login"
              style={{
                color: "#ffffff",
                textDecoration: "underline",
                fontSize: "0.82rem",
                fontWeight: 500,
              }}
            >
              Sign In
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", minHeight: "calc(100vh - 42px)" }}>
          {/* ── SIDEBAR (DESKTOP) ───────────────────────────────────────────── */}
          <aside
            style={{
              width: "250px",
              backgroundColor: "var(--card-bg)",
              borderRight: "1px solid var(--border-color)",
              padding: "1.5rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              flexShrink: 0,
            }}
            className="desktop-sidebar"
          >
            <div>
              <Link href="/" style={{ textDecoration: "none" }}>
                <Logo size={28} />
              </Link>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "#ea580c",
                  fontWeight: 700,
                  marginTop: "0.25rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Interactive Preview
              </div>
            </div>

            {/* Active Property Switcher */}
            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Active Property
              </label>
              <select
                value={activePropertyId}
                onChange={(e) => setActivePropertyId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.55rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-main)",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="all">🏢 All Properties (Combined)</option>
                {DEMO_PROPERTIES.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    📍 {prop.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation Links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {navItems.map((item) => {
                const isActive =
                  item.path === "/demo"
                    ? pathname === item.path
                    : pathname === item.path || pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    style={{
                      padding: "0.65rem 0.9rem",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: isActive ? "rgba(234, 88, 12, 0.15)" : "transparent",
                      color: isActive ? "#ea580c" : "var(--text-main)",
                      fontWeight: isActive ? 600 : 400,
                      textDecoration: "none",
                      fontSize: "0.92rem",
                      transition: "all 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
              <div
                style={{
                  padding: "0.85rem",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(234, 88, 12, 0.08))",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>Ready to switch?</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
                  Get complete PG management features with 1-click setup.
                </div>
                <Link
                  href="/register"
                  style={{
                    display: "block",
                    backgroundColor: "#ea580c",
                    color: "#ffffff",
                    padding: "0.45rem",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    textDecoration: "none",
                  }}
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT AREA ────────────────────────────────────────────── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* Topbar Header */}
            <header
              style={{
                height: "60px",
                padding: "0 1.5rem",
                borderBottom: "1px solid var(--border-color)",
                backgroundColor: "var(--card-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <h1 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                  {currentDisplayName}
                </h1>
                <span
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    color: "#d97706",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  DEMO MODE
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <ThemeToggle />
                <button
                  onClick={() => triggerReadOnlyNotice("Account Settings")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.35rem 0.75rem",
                    borderRadius: "20px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-color)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#ea580c", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem" }}>
                    D
                  </span>
                  <span>Demo Admin</span>
                </button>
              </div>
            </header>

            {/* Page Children Container */}
            <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
              {children}
            </main>
          </div>
        </div>

        {/* ── READ ONLY NOTICE MODAL ────────────────────────────────────────── */}
        {noticeModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setNoticeModalOpen(false)}
          >
            <div
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "16px",
                padding: "2rem",
                maxWidth: "460px",
                width: "100%",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                textAlign: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔒</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Disabled in Demo Mode
              </h3>
              <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                <strong>&quot;{attemptedAction}&quot;</strong> is locked because this is a read-only live preview. Create a PGmate account to manage real rooms, tenants, payments, and settings!
              </p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <button
                  onClick={() => setNoticeModalOpen(false)}
                  style={{
                    padding: "0.6rem 1.2rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "transparent",
                    color: "var(--text-main)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Continue Browsing
                </button>
                <Link
                  href="/register"
                  style={{
                    padding: "0.6rem 1.2rem",
                    borderRadius: "8px",
                    backgroundColor: "#ea580c",
                    color: "#ffffff",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DemoContext.Provider>
  );
}
