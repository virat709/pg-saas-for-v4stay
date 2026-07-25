"use client";

import React, { useState } from "react";
import { useDemoContext } from "../DemoLayoutClient";
import { DEMO_FOOD_MENU } from "@/lib/demoData";

export default function DemoMenuPage() {
  const { triggerReadOnlyNotice } = useDemoContext();
  const [selectedDay, setSelectedDay] = useState<string>("Monday");

  const activeMenu = DEMO_FOOD_MENU.find((m) => m.day === selectedDay) || DEMO_FOOD_MENU[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Weekly PG Food Menu Schedule</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
            Preview breakfast, lunch, evening snacks, and dinner schedules served to tenants.
          </p>
        </div>

        <button
          onClick={() => triggerReadOnlyNotice("Edit Food Menu")}
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
          ✏️ Edit Menu Schedule
        </button>
      </div>

      {/* Day Selector Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {DEMO_FOOD_MENU.map((item) => {
          const isActive = item.day === selectedDay;
          return (
            <button
              key={item.day}
              onClick={() => setSelectedDay(item.day)}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: "8px",
                backgroundColor: isActive ? "#ea580c" : "var(--card-bg)",
                color: isActive ? "#ffffff" : "var(--text-main)",
                border: "1px solid var(--border-color)",
                fontWeight: isActive ? 700 : 500,
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {item.day}
            </button>
          );
        })}
      </div>

      {/* Menu Meals Card Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "14px",
            padding: "1.25rem",
          }}
        >
          <div style={{ fontSize: "1.2rem", marginBottom: "0.4rem" }}>🍳 Breakfast</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>7:30 AM - 9:30 AM</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.5 }}>{activeMenu.breakfast}</div>
        </div>

        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "14px",
            padding: "1.25rem",
          }}
        >
          <div style={{ fontSize: "1.2rem", marginBottom: "0.4rem" }}>🍲 Lunch</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>12:30 PM - 2:30 PM</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.5 }}>{activeMenu.lunch}</div>
        </div>

        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "14px",
            padding: "1.25rem",
          }}
        >
          <div style={{ fontSize: "1.2rem", marginBottom: "0.4rem" }}>☕ Evening Tea & Snacks</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>5:00 PM - 6:00 PM</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.5 }}>{activeMenu.snacks}</div>
        </div>

        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "14px",
            padding: "1.25rem",
          }}
        >
          <div style={{ fontSize: "1.2rem", marginBottom: "0.4rem" }}>🍛 Dinner</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>8:00 PM - 10:00 PM</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.5 }}>{activeMenu.dinner}</div>
        </div>
      </div>
    </div>
  );
}
