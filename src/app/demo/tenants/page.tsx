"use client";

import React, { useState } from "react";
import { useDemoContext } from "../DemoLayoutClient";
import { DEMO_TENANTS } from "@/lib/demoData";

export default function DemoTenantsPage() {
  const { activePropertyId, triggerReadOnlyNotice } = useDemoContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTenants = DEMO_TENANTS.filter((tenant) => {
    if (activePropertyId !== "all" && tenant.propertyId !== activePropertyId) return false;
    if (statusFilter !== "all" && tenant.paymentStatus.toLowerCase() !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return tenant.name.toLowerCase().includes(q) || tenant.roomNumber.includes(q) || tenant.phone.includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Tenants Directory</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
            Manage resident profiles, room assignments, deposits, and rent payment statuses.
          </p>
        </div>

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
          }}
        >
          ➕ Add New Tenant
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          backgroundColor: "var(--card-bg)",
          padding: "1rem",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
        }}
      >
        <input
          type="text"
          placeholder="Search by tenant name, room number, phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: "220px",
            padding: "0.55rem 0.85rem",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-color)",
            color: "var(--text-main)",
            fontSize: "0.88rem",
            outline: "none",
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "0.55rem 0.85rem",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-color)",
            color: "var(--text-main)",
            fontSize: "0.88rem",
            outline: "none",
          }}
        >
          <option value="all">All Payment Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Tenants Table */}
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-color)", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Tenant Name</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Room & Bed</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Contact Phone</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Monthly Rent</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Deposit</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Move-in Date</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{tenant.name}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    Room {tenant.roomNumber} ({tenant.bedNumber})
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>{tenant.phone}</td>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>₹{tenant.rentAmount.toLocaleString()}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>₹{tenant.depositAmount.toLocaleString()}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>{tenant.joinDate}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
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
                  </td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => triggerReadOnlyNotice(`Edit Tenant (${tenant.name})`)}
                        style={{
                          padding: "0.25rem 0.55rem",
                          borderRadius: "4px",
                          border: "1px solid var(--border-color)",
                          backgroundColor: "transparent",
                          color: "var(--text-main)",
                          fontSize: "0.78rem",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => triggerReadOnlyNotice(`Collect Rent (${tenant.name})`)}
                        style={{
                          padding: "0.25rem 0.55rem",
                          borderRadius: "4px",
                          border: "none",
                          backgroundColor: "rgba(234, 88, 12, 0.15)",
                          color: "#ea580c",
                          fontWeight: 600,
                          fontSize: "0.78rem",
                          cursor: "pointer",
                        }}
                      >
                        Collect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
