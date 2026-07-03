"use client";

import { useState, useEffect } from "react";
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
};

export default function RoomsPage() {
  const { activePropertyId, properties } = useProperties();
  const { toast } = useToast();
  const [selectedFormPropertyId, setSelectedFormPropertyId] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
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
        fetchRooms();
      } else {
        toast("Failed to update room.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
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

  const groupedByFloor = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Rooms & Beds</h1>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Add Room"}
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-8 animate-fade-in">
          <h3>Add New Room</h3>
          <form onSubmit={handleAddRoom} className="flex gap-4 items-center mt-4" style={{ flexWrap: 'wrap' }}>
            {activePropertyId === "all" && (
              <div className="input-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                <label className="input-label">Select Property</label>
                <select className="input-field" value={selectedFormPropertyId} onChange={e => setSelectedFormPropertyId(e.target.value)} required>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="input-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
              <label className="input-label">Room Number</label>
              <input type="text" className="input-field" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required placeholder="e.g. 101" />
            </div>
            <div className="input-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
              <label className="input-label">Floor</label>
              {floor === "custom" ? (
                <input type="text" className="input-field" value={customFloor} onChange={e => setCustomFloor(e.target.value)} required placeholder="e.g. 4th Floor" autoFocus />
              ) : (
                <select className="input-field" value={floor} onChange={e => setFloor(e.target.value)}>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                  <option value="custom">+ Custom Floor...</option>
                </select>
              )}
            </div>
            <div className="input-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
              <label className="input-label">Sharing Type</label>
              {sharingType === "custom" ? (
                <input type="number" className="input-field" value={customSharing} onChange={e => setCustomSharing(e.target.value)} required min="1" placeholder="e.g. 5" autoFocus />
              ) : (
                <select className="input-field" value={sharingType} onChange={e => setSharingType(e.target.value)}>
                  <option value="1">Single (1 Bed)</option>
                  <option value="2">Double (2 Beds)</option>
                  <option value="3">Triple (3 Beds)</option>
                  <option value="4">Four Sharing (4 Beds)</option>
                  <option value="custom">+ Custom Sharing...</option>
                </select>
              )}
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ height: '46px' }}>Save Room</button>
            </div>
          </form>
        </div>
      )}

      {editRoomData && (
        <div className="card mb-8 animate-fade-in" style={{ border: '2px solid var(--primary)' }}>
          <div className="flex justify-between items-center">
            <h3>Edit Room</h3>
            <button onClick={() => setEditRoomData(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
          </div>
          <form onSubmit={handleEditRoomSubmit} className="flex gap-4 items-center mt-4" style={{ flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
              <label className="input-label">Room Number</label>
              <input type="text" className="input-field" value={editRoomNumber} onChange={e => setEditRoomNumber(e.target.value)} required />
            </div>
            <div className="input-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
              <label className="input-label">Floor</label>
              {editFloor === "custom" ? (
                <input type="text" className="input-field" value={editCustomFloor} onChange={e => setEditCustomFloor(e.target.value)} required placeholder="e.g. 4th Floor" autoFocus />
              ) : (
                <select className="input-field" value={editFloor} onChange={e => setEditFloor(e.target.value)}>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                  <option value="custom">+ Custom Floor...</option>
                </select>
              )}
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ height: '46px' }}>Update Room</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading rooms...</p>
      ) : Object.keys(groupedByFloor).length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p>No rooms added yet. Click "+ Add Room" to get started.</p>
        </div>
      ) : (
        <div>
          {Object.entries(groupedByFloor).map(([floorName, floorRooms]) => (
            <div key={floorName} className="mb-8">
              <h2 style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>{floorName}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                {floorRooms.map(room => (
                  <div key={room.id} className="card" style={{ padding: '1rem' }}>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 style={{ margin: 0, display: 'inline-block', marginRight: '8px' }}>Room {room.room_number}</h3>
                        <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-color)', padding: '2px 8px', borderRadius: '12px' }}>
                          {room.sharing_type} Sharing
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setEditRoomData(room); setEditRoomNumber(room.room_number); setEditFloor(["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"].includes(room.floor) ? room.floor : "custom"); setEditCustomFloor(["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"].includes(room.floor) ? "" : room.floor); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', padding: '4px' }}>Edit</button>
                        <button onClick={() => handleDeleteRoom(room.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem', padding: '4px' }}>Delete</button>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {room.beds.map(bed => (
                        <div 
                          key={bed.id} 
                          style={{ 
                            padding: '0.5rem', 
                            borderRadius: 'var(--radius-md)', 
                            fontSize: '0.8rem',
                            textAlign: 'center',
                            backgroundColor: bed.status === 'occupied' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-color)',
                            color: bed.status === 'occupied' ? 'var(--primary-hover)' : 'var(--text-muted)',
                            border: `1px solid ${bed.status === 'occupied' ? 'var(--primary)' : 'var(--border-color)'}`
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{bed.bed_label}</div>
                          <div>{bed.status === 'occupied' ? bed.tenant?.name || 'Occupied' : 'Vacant'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
