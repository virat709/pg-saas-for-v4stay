"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProperties } from "@/context/PropertyContext";
import { useToast } from "@/context/ToastContext";

type Bed = {
  id: string;
  bed_label: string;
  status: string;
  tenant?: any;
};

type Room = {
  id: string;
  room_number: string;
  floor: string;
  sharing_type: number;
  beds: Bed[];
  rent?: number;
  propertyId?: string;
  propertyName?: string;
};

export default function RoomsPage() {
  const { activePropertyId, properties } = useProperties();
  const { toast } = useToast();
  const [selectedFormPropertyId, setSelectedFormPropertyId] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>("all");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editRoomData, setEditRoomData] = useState<Room | null>(null);
  const [editRoomNumber, setEditRoomNumber] = useState("");
  const [editFloor, setEditFloor] = useState("");
  const [editCustomFloor, setEditCustomFloor] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState("1st Floor");
  const [sharingType, setSharingType] = useState("2");

  const [customFloor, setCustomFloor] = useState("");
  const [customSharing, setCustomSharing] = useState("");

  useEffect(() => {
    if (activePropertyId && activePropertyId !== "all") {
      setSelectedFormPropertyId(activePropertyId);
    } else if (properties.length > 0) {
      setSelectedFormPropertyId(properties[0].id);
    }
  }, [activePropertyId, properties]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const queryParam = activePropertyId ? `?propertyId=${activePropertyId}` : "";
      const res = await fetch(`/api/rooms${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [activePropertyId]);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalFloor = floor === "custom" ? customFloor.trim() : floor;
      const finalSharing = sharingType === "custom" ? customSharing.trim() : sharingType;

      if (!finalFloor) { toast("Please enter a custom floor name.", "warning"); return; }
      if (!finalSharing || isNaN(parseInt(finalSharing)) || parseInt(finalSharing) < 1) {
        toast("Please enter a valid sharing count (minimum 1).", "warning"); return;
      }

      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_number: roomNumber,
          floor: finalFloor,
          sharing_type: finalSharing,
          propertyId: selectedFormPropertyId
        })
      });
      if (res.ok) {
        setShowAddForm(false);
        setRoomNumber("");
        setFloor("1st Floor");
        setSharingType("2");
        setCustomFloor("");
        setCustomSharing("");
        toast("Room created successfully!", "success");
        fetchRooms();
      } else {
        toast("Failed to add room. Please try again.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoomData) return;

    try {
      const finalFloor = editFloor === "custom" ? editCustomFloor.trim() : editFloor;
      if (!finalFloor) { toast("Please enter a custom floor name.", "warning"); return; }

      const res = await fetch(`/api/rooms/${editRoomData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_number: editRoomNumber, floor: finalFloor })
      });
      if (res.ok) {
        setEditRoomData(null);
        toast("Room updated.", "success");
        fetchRooms();
      } else {
        toast("Failed to update room.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room? All beds will be removed.")) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: "DELETE" });
      if (res.ok) {
        toast("Room deleted.", "info");
        fetchRooms();
      } else {
        const data = await res.json();
        toast(data.message || "Failed to delete room.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Extract unique floor names for the filter dropdown
  const uniqueFloors = Array.from(new Set(rooms.map((r) => r.floor))).filter(Boolean);

  // Filter rooms based on floor filter
  const filteredRooms = rooms.filter((r) => {
    if (selectedFloorFilter !== "all" && r.floor !== selectedFloorFilter) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Rooms & Bed Allocations</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
            Manage room status, occupancy rates, and bed assignments.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {/* Floor Filter */}
          <select
            value={selectedFloorFilter}
            onChange={(e) => setSelectedFloorFilter(e.target.value)}
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
            {uniqueFloors.map((fl) => (
              <option key={fl} value={fl}>
                {fl}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "8px",
              backgroundColor: showAddForm ? "var(--bg-color)" : "#ea580c",
              color: showAddForm ? "var(--text-main)" : "#ffffff",
              border: showAddForm ? "1px solid var(--border-color)" : "none",
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            {showAddForm ? "Cancel" : "➕ Add Room"}
          </button>
        </div>
      </div>

      {/* Add Room Form */}
      {showAddForm && (
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "14px",
            padding: "1.5rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem 0" }}>Add New Room</h3>
          <form onSubmit={handleAddRoom} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            {activePropertyId === "all" && (
              <div style={{ flex: "1 1 200px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                  Select Property
                </label>
                <select
                  value={selectedFormPropertyId}
                  onChange={(e) => setSelectedFormPropertyId(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-main)",
                    fontSize: "0.88rem",
                  }}
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ flex: "1 1 150px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                Room Number
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
                placeholder="e.g. 101"
                style={{
                  width: "100%",
                  padding: "0.55rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-main)",
                  fontSize: "0.88rem",
                }}
              />
            </div>

            <div style={{ flex: "1 1 150px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                Floor
              </label>
              {floor === "custom" ? (
                <input
                  type="text"
                  value={customFloor}
                  onChange={(e) => setCustomFloor(e.target.value)}
                  required
                  placeholder="e.g. 4th Floor"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-main)",
                    fontSize: "0.88rem",
                  }}
                />
              ) : (
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-main)",
                    fontSize: "0.88rem",
                  }}
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                  <option value="custom">+ Custom Floor...</option>
                </select>
              )}
            </div>

            <div style={{ flex: "1 1 150px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                Sharing Type
              </label>
              {sharingType === "custom" ? (
                <input
                  type="number"
                  value={customSharing}
                  onChange={(e) => setCustomSharing(e.target.value)}
                  required
                  min="1"
                  placeholder="e.g. 5"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-main)",
                    fontSize: "0.88rem",
                  }}
                />
              ) : (
                <select
                  value={sharingType}
                  onChange={(e) => setSharingType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-main)",
                    fontSize: "0.88rem",
                  }}
                >
                  <option value="1">Single (1 Bed)</option>
                  <option value="2">Double (2 Beds)</option>
                  <option value="3">Triple (3 Beds)</option>
                  <option value="4">Four Sharing (4 Beds)</option>
                  <option value="custom">+ Custom Sharing...</option>
                </select>
              )}
            </div>

            <button
              type="submit"
              style={{
                padding: "0.55rem 1.25rem",
                borderRadius: "8px",
                backgroundColor: "#ea580c",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.88rem",
                border: "none",
                cursor: "pointer",
                height: "38px",
              }}
            >
              Save Room
            </button>
          </form>
        </div>
      )}

      {/* Edit Room Form */}
      {editRoomData && (
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "2px solid #ea580c",
            borderRadius: "14px",
            padding: "1.5rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Edit Room {editRoomData.room_number}</h3>
            <button
              onClick={() => setEditRoomData(null)}
              style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-muted)" }}
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleEditRoomSubmit} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 150px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                Room Number
              </label>
              <input
                type="text"
                value={editRoomNumber}
                onChange={(e) => setEditRoomNumber(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.55rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-main)",
                  fontSize: "0.88rem",
                }}
              />
            </div>
            <div style={{ flex: "1 1 150px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                Floor
              </label>
              {editFloor === "custom" ? (
                <input
                  type="text"
                  value={editCustomFloor}
                  onChange={(e) => setEditCustomFloor(e.target.value)}
                  required
                  placeholder="e.g. 4th Floor"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-main)",
                    fontSize: "0.88rem",
                  }}
                />
              ) : (
                <select
                  value={editFloor}
                  onChange={(e) => setEditFloor(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-main)",
                    fontSize: "0.88rem",
                  }}
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                  <option value="custom">+ Custom Floor...</option>
                </select>
              )}
            </div>

            <button
              type="submit"
              style={{
                padding: "0.55rem 1.25rem",
                borderRadius: "8px",
                backgroundColor: "#ea580c",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.88rem",
                border: "none",
                cursor: "pointer",
                height: "38px",
              }}
            >
              Update Room
            </button>
          </form>
        </div>
      )}

      {/* Main Rooms Grid */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          Loading rooms & bed allocations...
        </div>
      ) : filteredRooms.length === 0 ? (
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "14px",
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏨</div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}>No Rooms Found</h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0 0 1.25rem 0" }}>
            {selectedFloorFilter !== "all"
              ? `No rooms added on ${selectedFloorFilter}.`
              : "No rooms have been added to this property yet."}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: "0.55rem 1.2rem",
              borderRadius: "8px",
              backgroundColor: "#ea580c",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.88rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            ➕ Add Your First Room
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {filteredRooms.map((room) => {
            const occupiedCount = room.beds.filter((b) => b.status === "occupied").length;
            const isFullyOccupied = room.beds.length > 0 && occupiedCount === room.beds.length;

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
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                {/* Room Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>Room {room.room_number}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                      {room.floor} • {room.sharing_type} Sharing
                      {activePropertyId === "all" && room.propertyName && ` • ${room.propertyName}`}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
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

                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <button
                        onClick={() => {
                          setEditRoomData(room);
                          setEditRoomNumber(room.room_number);
                          setEditFloor(
                            ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"].includes(room.floor)
                              ? room.floor
                              : "custom"
                          );
                          setEditCustomFloor(
                            ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"].includes(room.floor)
                              ? ""
                              : room.floor
                          );
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ea580c",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          padding: "0.15rem 0.35rem",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          padding: "0.15rem 0.35rem",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Beds Allocation Section */}
                <div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--text-muted)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Beds Allocation
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {room.beds.map((bed) => {
                      const isOccupied = bed.status === "occupied";
                      return (
                        <div
                          key={bed.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "8px",
                            border: "1px solid var(--border-color)",
                            backgroundColor: isOccupied ? "rgba(16, 185, 129, 0.05)" : "rgba(245, 158, 11, 0.05)",
                            fontSize: "0.85rem",
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{bed.bed_label}</span>
                          {isOccupied ? (
                            <span style={{ color: "#10b981", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              👤 {bed.tenant?.name || "Occupied"}
                            </span>
                          ) : (
                            <Link
                              href="/dashboard/tenants"
                              style={{
                                color: "#d97706",
                                textDecoration: "none",
                                padding: "0.2rem 0.55rem",
                                borderRadius: "6px",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                border: "1px dashed rgba(217, 119, 6, 0.5)",
                                backgroundColor: "rgba(245, 158, 11, 0.1)",
                              }}
                            >
                              + Assign Bed
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
