"use client";

import React, { useState } from "react";
import { useDemoContext } from "../DemoLayoutClient";
import { DEMO_EXPENSES } from "@/lib/demoData";

export default function DemoExpensesPage() {
  const { activePropertyId, triggerReadOnlyNotice } = useDemoContext();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredExpenses = DEMO_EXPENSES.filter((exp) => {
    if (activePropertyId !== "all" && exp.propertyId !== activePropertyId) return false;
    if (categoryFilter !== "all" && exp.category !== categoryFilter) return false;
    return true;
  });

  const totalExpenseAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Property Expense Logs</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
            Track utility bills, WiFi subscriptions, grocery costs, maintenance, and cleaning expenses.
          </p>
        </div>

        <button
          onClick={() => triggerReadOnlyNotice("+ Add Expense Record")}
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
          ➕ Log Expense
        </button>
      </div>

      {/* Filter and Summary Bar */}
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
          <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-muted)" }}>Category Filter:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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
            <option value="all">All Categories</option>
            <option value="Electricity">Electricity</option>
            <option value="Internet">Internet</option>
            <option value="Water">Water</option>
            <option value="Groceries">Groceries</option>
            <option value="Cleaning">Cleaning</option>
          </select>
        </div>

        <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>
          Total Operational Expenses: <span style={{ color: "#ef4444" }}>₹{totalExpenseAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Expenses Table */}
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
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Expense Title</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Category</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Vendor / Paid To</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Payment Method</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Date</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Amount</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{exp.title}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.25rem 0.55rem",
                        borderRadius: "10px",
                        backgroundColor: "rgba(234, 88, 12, 0.12)",
                        color: "#ea580c",
                      }}
                    >
                      {exp.category}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>{exp.vendor}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>{exp.paymentMethod}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>{exp.date}</td>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#ef4444" }}>
                    -₹{exp.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                    <button
                      onClick={() => triggerReadOnlyNotice(`Edit Expense (${exp.title})`)}
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
