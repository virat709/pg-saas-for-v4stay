"use client";

import React, { useState } from "react";
import { useDemoContext } from "../DemoLayoutClient";
import { DEMO_COMPLAINTS } from "@/lib/demoData";

export default function DemoComplaintsPage() {
  const { activePropertyId, triggerReadOnlyNotice } = useDemoContext();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredComplaints = DEMO_COMPLAINTS.filter((cmp) => {
    if (activePropertyId !== "all" && cmp.propertyId !== activePropertyId) return false;
    if (statusFilter !== "all" && cmp.status.toLowerCase().replace(" ", "-") !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Tenant Complaints & Maintenance Tickets</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
            Monitor resident complaints, plumbing/WiFi/AC maintenance tickets, and resolution progress.
          </p>
        </div>

        <button
          onClick={() => triggerReadOnlyNotice("+ Create Maintenance Ticket")}
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
          ➕ New Ticket
        </button>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          backgroundColor: "var(--card-bg)",
          padding: "1rem",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
        }}
      >
        <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-muted)" }}>Filter by Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
          <option value="all">All Ticket Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Ticket Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {filteredComplaints.map((ticket) => (
          <div
            key={ticket.id}
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "14px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ea580c" }}>{ticket.ticketId}</span>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.55rem",
                  borderRadius: "10px",
                  backgroundColor:
                    ticket.status === "Resolved"
                      ? "rgba(16, 185, 129, 0.15)"
                      : ticket.status === "In Progress"
                      ? "rgba(245, 158, 11, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                  color:
                    ticket.status === "Resolved"
                      ? "#10b981"
                      : ticket.status === "In Progress"
                      ? "#d97706"
                      : "#ef4444",
                }}
              >
                {ticket.status}
              </span>
            </div>

            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>{ticket.title}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
              {ticket.description}
            </p>

            <div style={{ fontSize: "0.8rem", display: "flex", justifyContent: "space-between", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "0.65rem" }}>
              <span>👤 {ticket.tenantName} (Rm {ticket.roomNumber})</span>
              <span>📅 {ticket.date}</span>
            </div>

            <button
              onClick={() => triggerReadOnlyNotice(`Update Ticket (${ticket.ticketId})`)}
              style={{
                padding: "0.45rem",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-color)",
                color: "var(--text-main)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Update Ticket Status
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
