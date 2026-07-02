"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { WelcomeBack } from "@/components/animations/WelcomeBack";
import { useIsReturningUser } from "@/hooks/useIsReturningUser";
import Logo from "@/components/Logo";

import { PropertyProvider, useProperties } from "@/context/PropertyContext";
import NotificationBell from "@/components/NotificationBell";
import { AdminNotificationProvider, useAdminNotifications } from "@/context/AdminNotificationContext";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminNotificationProvider>
      <PropertyProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </PropertyProvider>
    </AdminNotificationProvider>
  );
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { properties, activePropertyId, setActivePropertyId } = useProperties();

  // Redirect to dashboard if active property is "all" and we are on a property-specific subpage
  useEffect(() => {
    if (activePropertyId === "all") {
      const pgSpecificPaths = [
        "/dashboard/rooms",
        "/dashboard/tenants",
        "/dashboard/payments",
        "/dashboard/complaints",
        "/dashboard/notices",
        "/dashboard/menu"
      ];
      if (pgSpecificPaths.some(path => pathname === path || pathname.startsWith(path + "/"))) {
        router.push("/dashboard");
      }
    }
  }, [activePropertyId, pathname, router]);

  // Returning-user detection — WelcomeBack animation
  const { isReturning, firstName, welcomeShownThisSession, markWelcomeShown } =
    useIsReturningUser();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (isReturning && !welcomeShownThisSession) {
      setShowWelcome(true);
    }
  }, [isReturning, welcomeShownThisSession]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const activeProperty = properties.find(p => p.id === activePropertyId);
  const currentDisplayName = activePropertyId === "all" ? "All Properties" : (activeProperty?.name || "Loading...");

  const navItems = [
    { name: "Overview", path: "/dashboard" },
    { name: "Rooms & Beds", path: "/dashboard/rooms" },
    { name: "Tenants", path: "/dashboard/tenants" },
    { name: "Payments", path: "/dashboard/payments" },
    { name: "Complaints", path: "/dashboard/complaints" },
    { name: "Notice Board", path: "/dashboard/notices" },
    { name: "Menu", path: "/dashboard/menu" },
    { name: "Settings", path: "/dashboard/settings" },
  ];

  // ── NavItems: separate component so useAdminNotifications is called at top level ──
  const NavItems = ({
    pathname,
    activePropertyId,
    navItems,
  }: {
    pathname: string;
    activePropertyId: string;
    navItems: { name: string; path: string }[];
  }) => {
    const { unreadByType } = useAdminNotifications();

    const filtered = navItems.filter((item) => {
      if (activePropertyId === "all") {
        return ["Overview", "Settings"].includes(item.name);
      }
      return true;
    });

    return (
      <>
        {filtered.map((item) => {
          const isActive =
            item.path === "/dashboard"
              ? pathname === item.path
              : pathname === item.path || pathname.startsWith(item.path + "/");

          const dotType =
            item.name === "Complaints"
              ? "complaint"
              : item.name === "Payments"
              ? "payment"
              : null;
          const dotCount = dotType ? (unreadByType[dotType] || 0) : 0;

          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: isActive ? "rgba(30, 96, 145, 0.1)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--text-main)",
                fontWeight: isActive ? 600 : 400,
                transition: "var(--transition)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{item.name}</span>
              {dotCount > 0 && (
                <span
                  style={{
                    backgroundColor: "#10b981",
                    color: "#fff",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    borderRadius: "50%",
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 3px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 0 0 3px rgba(16,185,129,0.2)",
                    animation: "dot-pulse 2s infinite",
                  }}
                >
                  {dotCount > 9 ? "9+" : dotCount}
                </span>
              )}
            </Link>
          );
        })}
      </>
    );
  };

  const SidebarContent = ({ pathname }: { pathname: string }) => {
    const { properties, activePropertyId, setActivePropertyId } = useProperties();

    return (
      <>
        <div style={{ marginBottom: "2rem" }}>
          {/* Active Property Switcher Dropdown */}
          <div style={{ position: "relative", marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>
              Active Property
            </label>
            {properties.length <= 1 ? (
              <div
                style={{
                  padding: "0.55rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-main)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                🏢 {properties[0]?.name || "My PG"}
              </div>
            ) : (
              <select
                value={activePropertyId}
                onChange={(e) => setActivePropertyId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <option value="all">All Properties (Overview)</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Logo size={20} variant="dark" showTagline={false} />
            </div>
            <NotificationBell role="admin" />
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
          <NavItems
            pathname={pathname}
            activePropertyId={activePropertyId}
            navItems={navItems}
          />
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
  };

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
          .dashboard-root {
            flex-direction: column;
          }
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
          <SidebarContent pathname={pathname} />
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
            {currentDisplayName}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <NotificationBell role="admin" />
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
              <SidebarContent pathname={pathname} />
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
