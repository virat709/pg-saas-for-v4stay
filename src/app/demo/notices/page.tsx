"use client";

import React from "react";
import { useDemoContext } from "../DemoLayoutClient";
import { DEMO_NOTICES } from "@/lib/demoData";

export default function DemoNoticesPage() {
  const { activePropertyId, triggerReadOnlyNotice } = useDemoContext();

  const filteredNotices = DEMO_NOTICES.filter((not) => {
    if (activePropertyId !== "all" && not.propertyId !== activePropertyId) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Digital Notice Board</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
            Publish announcements, rules, rent reminders, and event notices to residents.
          </p>
        </div>

        <button
          onClick={() => triggerReadOnlyNotice("+ Post New Notice")}
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
          📢 Post Notice
        </button>
      </div>

      {/* Notice Cards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "14px",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.6rem",
                  borderRadius: "12px",
                  backgroundColor:
                    notice.category === "Important"
                      ? "rgba(239, 68, 68, 0.15)"
                      : notice.category === "Maintenance"
                      ? "rgba(245, 158, 11, 0.15)"
                      : "rgba(59, 130, 246, 0.15)",
                  color:
                    notice.category === "Important"
                      ? "#ef4444"
                      : notice.category === "Maintenance"
                      ? "#d97706"
                      : "#3b82f6",
                }}
              >
                {notice.category}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>📅 {notice.date}</span>
            </div>

            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{notice.title}</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
              {notice.content}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button
                onClick={() => triggerReadOnlyNotice(`Edit Notice (${notice.title})`)}
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
                Edit Notice
              </button>
              <button
                onClick={() => triggerReadOnlyNotice(`Delete Notice (${notice.title})`)}
                style={{
                  padding: "0.25rem 0.6rem",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "rgba(239, 68, 68, 0.12)",
                  color: "#ef4444",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
