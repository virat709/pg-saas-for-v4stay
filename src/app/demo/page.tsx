"use client";

import React from "react";
import Link from "next/link";
import { useDemoContext } from "./DemoLayoutClient";
import { DEMO_PROPERTIES, DEMO_ROOMS, DEMO_TENANTS, DEMO_PAYMENTS, DEMO_EXPENSES } from "@/lib/demoData";

export default function DemoOverviewPage() {
  const { activePropertyId, triggerReadOnlyNotice } = useDemoContext();

  const filteredProperties = activePropertyId === "all"
    ? DEMO_PROPERTIES
    : DEMO_PROPERTIES.filter((p) => p.id === activePropertyId);

  const filteredRooms = activePropertyId === "all"
    ? DEMO_ROOMS
    : DEMO_ROOMS.filter((r) => r.propertyId === activePropertyId);

  const filteredTenants = activePropertyId === "all"
    ? DEMO_TENANTS
    : DEMO_TENANTS.filter((t) => t.propertyId === activePropertyId);

  const filteredPayments = activePropertyId === "all"
    ? DEMO_PAYMENTS
    : DEMO_PAYMENTS.filter((p) => p.propertyId === activePropertyId);

  const filteredExpenses = activePropertyId === "all"
    ? DEMO_EXPENSES
    : DEMO_EXPENSES.filter((e) => e.propertyId === activePropertyId);

  // Compute Stats
  let totalBeds = 0;
  let occupiedBeds = 0;
  filteredProperties.forEach((p) => {
    totalBeds += p.totalBeds;
    occupiedBeds += p.occupiedBeds;
  });
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const vacantBeds = totalBeds - occupiedBeds;

  const totalCollected = filteredPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalPending = filteredTenants.reduce((acc, t) => acc + t.dueAmount, 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netIncome = totalCollected - totalExpenses;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Quick Action Controls Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Dashboard Overview</h2>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.25rem 0.65rem",
                borderRadius: "20px",
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                fontSize: "0.78rem",
                fontWeight: 700,
                boxShadow: "0 0 10px rgba(245, 158, 11, 0.2)",
              }}
              title="Active Free Trial"
            >
              <span>🎁 Free Trial</span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>(30d left)</span>
            </span>
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
            Real-time business performance analytics for your PG accommodation.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => triggerReadOnlyNotice("+ Add Tenant")}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "8px",
              backgroundColor: "#ea580c",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.88rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            ➕ Add Tenant
          </button>
          <button
            onClick={() => triggerReadOnlyNotice("+ Add Room")}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "8px",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-main)",
              border: "1px solid var(--border-color)",
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            🏨 Add Room
          </button>
          <button
            onClick={() => triggerReadOnlyNotice("Record Payment")}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "8px",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-main)",
              border: "1px solid var(--border-color)",
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            💳 Record Payment
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Total Occupancy
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: "0.4rem", color: "#ea580c" }}>
            {occupiedBeds} / {totalBeds} <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-muted)" }}>beds</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "0.4rem", fontWeight: 600 }}>
            {occupancyRate}% Occupied ({vacantBeds} Vacant)
          </div>
        </div>

        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Total Rent Collected
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: "0.4rem", color: "#10b981" }}>
            ₹{totalCollected.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            Current Month Rent Revenue
          </div>
        </div>

        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Pending Rent Dues
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: "0.4rem", color: "#ef4444" }}>
            ₹{totalPending.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#ef4444", marginTop: "0.4rem", fontWeight: 600 }}>
            {filteredTenants.filter(t => t.dueAmount > 0).length} Tenants with pending dues
          </div>
        </div>

        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "1.25rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Net Operating Income
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: "0.4rem", color: "#3b82f6" }}>
            ₹{netIncome.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            After ₹{totalExpenses.toLocaleString()} expenses
          </div>
        </div>
      </div>

      {/* Main Content Split: Recent Activity & Quick Preview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* Recent Transactions */}
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "14px",
            padding: "1.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>Recent Rent Payments</h3>
            <Link href="/demo/payments" style={{ fontSize: "0.82rem", color: "#ea580c", fontWeight: 600, textDecoration: "none" }}>
              View All →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filteredPayments.slice(0, 5).map((pay) => (
              <div
                key={pay.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-color)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{pay.tenantName}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Room {pay.roomNumber} • {pay.method} • {pay.date}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#10b981" }}>+₹{pay.amount.toLocaleString()}</div>
                  <div style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 600 }}>{pay.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tenant Rent Status Summary */}
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "14px",
            padding: "1.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>Tenant Rent Status</h3>
            <Link href="/demo/tenants" style={{ fontSize: "0.82rem", color: "#ea580c", fontWeight: 600, textDecoration: "none" }}>
              Manage Tenants →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filteredTenants.slice(0, 5).map((tenant) => (
              <div
                key={tenant.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-color)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{tenant.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Room {tenant.roomNumber} ({tenant.bedNumber})
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.25rem 0.6rem",
                      borderRadius: "12px",
                      backgroundColor:
                        tenant.paymentStatus === "Paid"
                          ? "rgba(16, 185, 129, 0.15)"
                          : tenant.paymentStatus === "Pending"
                          ? "rgba(245, 158, 11, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                      color:
                        tenant.paymentStatus === "Paid"
                          ? "#10b981"
                          : tenant.paymentStatus === "Pending"
                          ? "#d97706"
                          : "#ef4444",
                    }}
                  >
                    {tenant.paymentStatus}
                  </span>
                  {tenant.dueAmount > 0 && (
                    <div style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: 600, marginTop: "0.2rem" }}>
                      Due: ₹{tenant.dueAmount.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
