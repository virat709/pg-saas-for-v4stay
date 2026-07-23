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
import ThemeToggle from "@/components/ThemeToggle";

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

  // Subscription information state
  const [subInfo, setSubInfo] = useState<{ planTier: string; daysLeft: number | null; expiresAt: string | null } | null>(null);
  const [userRole, setUserRole] = useState<string>("owner");

  useEffect(() => {
    fetch("/api/payments/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSubInfo({
            planTier: data.planTier,
            daysLeft: data.daysLeft,
            expiresAt: data.expiresAt,
          });
          if (data.role) {
            setUserRole(data.role);
          }
        }
      })
      .catch((err) => console.error("Error fetching subscription status:", err));
  }, []);

  // Redirect to dashboard if active property is "all" and we are on a property-specific subpage
  useEffect(() => {
    if (activePropertyId === "all") {
      const pgSpecificPaths = [
        "/dashboard/rooms",
        "/dashboard/tenants",
        "/dashboard/payments",
        "/dashboard/expenses",
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
    { name: "Expenses", path: "/dashboard/expenses" },
    { name: "Updates", path: "/dashboard/complaints" },
    { name: "Menu", path: "/dashboard/menu" },
    { name: "Settings", path: "/dashboard/settings" },
  ];

  const NavItems = ({
    pathname,
    activePropertyId,
    navItems,
    subInfo,
    isStaff,
  }: {
    pathname: string;
    activePropertyId: string;
    navItems: { name: string; path: string }[];
    subInfo: { planTier: string; daysLeft: number | null; expiresAt: string | null } | null;
    isStaff: boolean;
  }) => {
    const { unreadByType } = useAdminNotifications();

    const filtered = navItems.filter((item) => {
      if (isStaff && item.name === "Settings") return false;
      if (activePropertyId === "all") {
        return ["Overview", "Expenses", "Settings"].includes(item.name);
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

          const isOverview = item.name === "Overview";
          const showExpiryDot = isOverview && subInfo && subInfo.daysLeft !== null && subInfo.daysLeft <= 30;

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
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {item.name}
                {showExpiryDot && (
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                      display: "inline-block",
                      boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.4)",
                      animation: "dot-pulse 1.5s infinite",
                    }}
                    title={`Expiring in ${subInfo.daysLeft} days`}
                  />
                )}
              </span>
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
              <Logo size={20} variant="auto" showTagline={false} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <ThemeToggle />
              <NotificationBell role="admin" />
            </div>
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
            subInfo={subInfo}
            isStaff={userRole === "staff"}
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
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        /* Last 10 Days Expiry Alert Red Theme */
        .dashboard-root.alert-red {
          --bg-color: #450a0a !important;
          --surface-color: #7f1d1d !important;
          --border-color: #991b1b !important;
          --primary: #f87171 !important;
          --text-main: #fecdd3 !important;
          --text-muted: #fda4af !important;
        }
        [data-theme='light'] .dashboard-root.alert-red {
          --bg-color: #fef2f2 !important;
          --surface-color: #ffe4e6 !important;
          --border-color: #fecdd3 !important;
          --primary: #e11d48 !important;
          --text-main: #4c0519 !important;
          --text-muted: #881337 !important;
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
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          height: 100vh;
          z-index: 30;
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
          margin-left: 250px;
          min-width: 0;
          padding: 2rem;
          overflow-x: hidden;
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

        @keyframes dot-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }

        @keyframes pulse-banner {
          from { opacity: 0.93; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .dashboard-root {
            flex-direction: column;
          }
          .dashboard-sidebar { display: none; }
          .dashboard-topbar { display: flex; }
          .drawer-overlay { display: block; }
          .dashboard-main { margin-left: 0; padding: 1rem; }
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

      <div className={`dashboard-root ${subInfo && subInfo.daysLeft !== null && subInfo.daysLeft <= 10 ? "alert-red" : ""}`}>
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ThemeToggle />
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
                marginLeft: "0.5rem",
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
          {/* Expiry Banner */}
          {subInfo && subInfo.daysLeft !== null && subInfo.daysLeft <= 30 && (
            <div
              style={{
                padding: "0.8rem 1.2rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: subInfo.daysLeft <= 10 ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                border: `1px solid ${subInfo.daysLeft <= 10 ? "#ef4444" : "#f59e0b"}`,
                color: subInfo.daysLeft <= 10 ? "var(--danger, #ef4444)" : "var(--warning, #f59e0b)",
                fontSize: "0.88rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                marginBottom: "1.5rem",
                animation: "pulse-banner 2s infinite alternate",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {subInfo.daysLeft <= 10 ? "🚨" : "⚠️"} <strong>Subscription Expiring:</strong> Your plan ({subInfo.planTier}) has only {subInfo.daysLeft} days remaining. Renew now to avoid lockouts.
              </span>
              <Link
                href="/onboarding/subscription?upgrade=true"
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  backgroundColor: subInfo.daysLeft <= 10 ? "#ef4444" : "#f59e0b",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
              >
                Renew Now
              </Link>
            </div>
          )}
          {children}
        </main>
      </div>
    </>
  );
}
