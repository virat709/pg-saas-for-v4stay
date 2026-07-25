"use client";

import React, { useState } from "react";
import { useDemoContext } from "../DemoLayoutClient";
import { DEMO_PAYMENTS } from "@/lib/demoData";

export default function DemoPaymentsPage() {
  const { activePropertyId, triggerReadOnlyNotice } = useDemoContext();
  const [methodFilter, setMethodFilter] = useState<string>("all");

  const filteredPayments = DEMO_PAYMENTS.filter((payment) => {
    if (activePropertyId !== "all" && payment.propertyId !== activePropertyId) return false;
    if (methodFilter !== "all" && payment.method.toLowerCase() !== methodFilter.toLowerCase()) return false;
    return true;
  });

  const totalCollected = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Rent & Payment Logs</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
            Track rent collections, payment receipts, payment modes (UPI, Cash, Bank Transfer), and receipts.
          </p>
        </div>

        <button
          onClick={() => triggerReadOnlyNotice("Record Manual Payment")}
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
          💳 Record Payment
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          backgroundColor: "var(--card-bg)",
          padding: "1rem 1.25rem",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-muted)" }}>Filter by Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            style={{
              padding: "0.45rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-color)",
              color: "var(--text-main)",
              fontSize: "0.88rem",
              outline: "none",
            }}
          >
            <option value="all">All Methods (UPI, Cash, Bank)</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="bank transfer">Bank Transfer</option>
          </select>
        </div>

        <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>
          Total Filtered Revenue: <span style={{ color: "#10b981" }}>₹{totalCollected.toLocaleString()}</span>
        </div>
      </div>

      {/* Payments Table */}
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
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Receipt No</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Tenant Name</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Room</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Payment Method</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Payment Date</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Amount</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, textAlign: "right" }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((pay) => (
                <tr key={pay.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "#ea580c" }}>{pay.receiptNo}</td>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{pay.tenantName}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>Room {pay.roomNumber}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "6px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--border-color)",
                        fontSize: "0.78rem",
                      }}
                    >
                      {pay.method}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>{pay.date}</td>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#10b981" }}>
                    +₹{pay.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.15)", padding: "0.2rem 0.5rem", borderRadius: "10px" }}>
                      {pay.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                    <button
                      onClick={() => triggerReadOnlyNotice(`Download Receipt (${pay.receiptNo})`)}
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: "4px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "transparent",
                        color: "var(--text-main)",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                      }}
                    >
                      📄 Download
                    </button>
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
