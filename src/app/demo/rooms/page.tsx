"use client";

import React, { useState } from "react";
import { useDemoContext } from "../DemoLayoutClient";
import { DEMO_ROOMS } from "@/lib/demoData";

export default function DemoRoomsPage() {
  const { activePropertyId, triggerReadOnlyNotice } = useDemoContext();
  const [selectedFloor, setSelectedFloor] = useState<number | "all">("all");

  const filteredRooms = DEMO_ROOMS.filter((room) => {
    if (activePropertyId !== "all" && room.propertyId !== activePropertyId) return false;
    if (selectedFloor !== "all" && room.floor !== selectedFloor) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Rooms & Bed Allocations</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
            Preview room status, occupancy rates, and bed assignments.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {/* Floor Filter */}
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value === "all" ? "all" : Number(e.target.value))}
            style={{
              padding: "0.55rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-main)",
              fontSize: "0.88rem",
              outline: "none",
            }}
          >
            <option value="all">🏢 All Floors</option>
            <option value={1}>Floor 1</option>
            <option value={2}>Floor 2</option>
            <option value={3}>Floor 3</option>
          </select>

          <button
            onClick={() => triggerReadOnlyNotice("+ Add New Room")}
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
            ➕ Add Room
          </button>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {filteredRooms.map((room) => {
          const occupiedCount = room.beds.filter((b) => b.status === "occupied").length;
          const isFullyOccupied = occupiedCount === room.beds.length;

          return (
            <div
              key={room.id}
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* Card Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>Room {room.roomNumber}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Floor {room.floor} • {room.type}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.6rem",
                    borderRadius: "12px",
                    backgroundColor: isFullyOccupied ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                    color: isFullyOccupied ? "#ef4444" : "#10b981",
                  }}
                >
                  {occupiedCount} / {room.beds.length} Occupied
                </span>
              </div>

              {/* Rent Details */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  backgroundColor: "var(--bg-color)",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Monthly Rent:</span>
                <strong style={{ color: "#ea580c" }}>₹{room.rent.toLocaleString()} / bed</strong>
              </div>

              {/* Bed List */}
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  Beds Allocation
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {room.beds.map((bed) => (
                    <div
                      key={bed.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.45rem 0.75rem",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: bed.status === "occupied" ? "rgba(16, 185, 129, 0.05)" : "rgba(245, 158, 11, 0.05)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{bed.bedNumber}</span>
                      {bed.status === "occupied" ? (
                        <span style={{ color: "#10b981", fontWeight: 600 }}>👤 {bed.tenantName}</span>
                      ) : (
                        <button
                          onClick={() => triggerReadOnlyNotice(`Assign Bed (${bed.bedNumber})`)}
                          style={{
                            backgroundColor: "transparent",
                            color: "#d97706",
                            border: "1px border dashed #d97706",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          + Assign Bed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "auto" }}>
                {room.amenities.map((am, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: "0.7rem",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid var(--border-color)",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "4px",
                      color: "var(--text-muted)",
                    }}
                  >
                    {am}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
