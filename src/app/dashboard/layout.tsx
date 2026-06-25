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

  // Returning-user detection — WelcomeBack animation
  const { isReturning, firstName, welcomeShownThisSession, markWelcomeShown } =
    useIsReturningUser();
  // Show overlay only: returning user + hasn't been shown yet this session
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

  const navItems = [
    { name: "Overview", path: "/dashboard" },
    { name: "Rooms & Beds", path: "/dashboard/rooms" },
    { name: "Tenants", path: "/dashboard/tenants" },
    { name: "Payments", path: "/dashboard/payments" },
    { name: "Complaints", path: "/dashboard/complaints" },
    { name: "Menu", path: "/dashboard/menu" },
  ];

  return (
    <div className="flex" style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      {/* ── Welcome Back overlay — renders above everything, fades out after ~2.3s ── */}
      {showWelcome && (
        <WelcomeBack
          name={firstName}
          onDone={() => {
            setShowWelcome(false);
            markWelcomeShown(); // Prevent replaying on next navigation this session
          }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "var(--surface-color)",
          borderRight: "1px solid var(--border-color)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
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
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
