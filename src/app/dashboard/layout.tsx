"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { WelcomeBack } from "@/components/animations/WelcomeBack";
import { useIsReturningUser } from "@/hooks/useIsReturningUser";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [pgName, setPgName] = useState("Loading...");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Returning-user detection — WelcomeBack animation
  const { isReturning, firstName, welcomeShownThisSession, markWelcomeShown } =
    useIsReturningUser();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (isReturning && !welcomeShownThisSession) {
      setShowWelcome(true);
    }
  }, [isReturning, welcomeShownThisSession]);

  useEffect(() => {
    fetch("/api/property")
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setPgName(data.name);
      })
      .catch((e) => console.error(e));
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Overview", path: "/dashboard" },
    { name: "Rooms & Beds", path: "/dashboard/rooms" },
    { name: "Tenants", path: "/dashboard/tenants" },
    { name: "Payments", path: "/dashboard/payments" },
    { name: "Complaints", path: "/dashboard/complaints" },
    { name: "Menu", path: "/dashboard/menu" },
  ];

  const SidebarContent = () => (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            color: "var(--text-main)",
            fontSize: "1.25rem",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {pgName}
        </h2>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--primary)",
            marginTop: "0.25rem",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          v4stay <span style={{ opacity: 0.7 }}>PG</span>
        </div>
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          flex: 1,
        }}
      >
        {navItems.map((item) => {
          const isActive =
            item.path === "/dashboard"
              ? pathname === item.path
              : pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: isActive
                  ? "rgba(16, 185, 129, 0.1)"
                  : "transparent",
                color: isActive ? "var(--primary)" : "var(--text-main)",
                fontWeight: isActive ? 600 : 400,
                transition: "var(--transition)",
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          borderTop: "1px solid var(--border-color)",
          paddingTop: "1rem",
          marginTop: "auto",
        }}
      >
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%",
            padding: "0.75rem",
            textAlign: "left",
            color: "var(--danger)",
            fontWeight: 500,
          }}
        >
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Global responsive styles ──────────────────────────────────────── */}
      <style>{`
        .dashboard-root {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-color);
          overflow-x: hidden;
        }
        /* Desktop sidebar */
        .dashboard-sidebar {
          width: 250px;
          flex-shrink: 0;
          background-color: var(--surface-color);
          border-right: 1px solid var(--border-color);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }
        /* Mobile top bar */
        .dashboard-topbar {
          display: none;
          position: sticky;
          top: 0;
          z-index: 40;
          background-color: var(--surface-color);
          border-bottom: 1px solid var(--border-color);
          padding: 0.75rem 1rem;
          align-items: center;
          justify-content: space-between;
        }
        /* Mobile drawer overlay */
        .drawer-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 50;
        }
        .drawer-panel {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background-color: var(--surface-color);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          z-index: 51;
          overflow-y: auto;
          transform: translateX(-100%);
          transition: transform 0.25s ease;
        }
        .drawer-panel.open {
          transform: translateX(0);
        }
        .dashboard-main {
          flex: 1;
          min-width: 0;
          padding: 2rem;
          overflow-x: hidden;
          overflow-y: auto;
        }
        /* Hamburger button */
        .hamburger-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          color: var(--text-main);
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .hamburger-btn span {
          display: block;
          width: 22px;
          height: 2px;
          background: currentColor;
          border-radius: 2px;
          transition: 0.2s;
        }

        @media (max-width: 768px) {
          .dashboard-sidebar { display: none; }
          .dashboard-topbar { display: flex; }
          .drawer-overlay { display: block; }
          .dashboard-main { padding: 1rem; }
        }
      `}</style>

      {/* ── Welcome Back overlay ── */}
      {showWelcome && (
        <WelcomeBack
          name={firstName}
          onDone={() => {
            setShowWelcome(false);
            markWelcomeShown();
          }}
        />
      )}

      <div className="dashboard-root">
        {/* ── Desktop sidebar ───────────────────────────────────────────── */}
        <aside className="dashboard-sidebar">
          <SidebarContent />
        </aside>

        {/* ── Mobile: top bar + drawer ──────────────────────────────────── */}
        <div className="dashboard-topbar">
          <button
            className="hamburger-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <span />
            <span />
            <span />
          </button>
          <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.95rem" }}>
            {pgName}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              background: "none",
              border: "none",
              color: "var(--danger)",
              fontWeight: 500,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Sign Out
          </button>
        </div>

        {/* Drawer overlay — closes on backdrop click */}
        {drawerOpen && (
          <div
            className="drawer-overlay"
            onClick={() => setDrawerOpen(false)}
          >
            <div
              className={`drawer-panel ${drawerOpen ? "open" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  alignSelf: "flex-end",
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  marginBottom: "1rem",
                }}
                aria-label="Close navigation"
              >
                ✕
              </button>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* ── Main content ──────────────────────────────────────────────── */}
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </>
  );
}
