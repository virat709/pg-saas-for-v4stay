"use client";

import { useState, useEffect } from "react";

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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState("1st Floor");
  const [sharingType, setSharingType] = useState("2");
  
  const [customFloor, setCustomFloor] = useState("");
  const [customSharing, setCustomSharing] = useState("");
  
  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms");
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
  }, []);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalFloor = floor === "custom" ? customFloor.trim() : floor;
      const finalSharing = sharingType === "custom" ? customSharing.trim() : sharingType;

      if (!finalFloor) { alert("Please enter a custom floor name."); return; }
      if (!finalSharing || isNaN(parseInt(finalSharing)) || parseInt(finalSharing) < 1) {
        alert("Please enter a valid sharing count (minimum 1)."); return;
      }

      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_number: roomNumber, floor: finalFloor, sharing_type: finalSharing })
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
        alert("Failed to add room. Please try again.");
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
                  <option value="Ground Floor" style={{ color: '#000' }}>Ground Floor</option>
                  <option value="1st Floor" style={{ color: '#000' }}>1st Floor</option>
                  <option value="2nd Floor" style={{ color: '#000' }}>2nd Floor</option>
                  <option value="3rd Floor" style={{ color: '#000' }}>3rd Floor</option>
                  <option value="custom" style={{ color: '#000' }}>+ Custom Floor...</option>
                </select>
              )}
            </div>
            <div className="input-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
              <label className="input-label">Sharing Type</label>
              {sharingType === "custom" ? (
                <input type="number" className="input-field" value={customSharing} onChange={e => setCustomSharing(e.target.value)} required min="1" placeholder="e.g. 5" autoFocus />
              ) : (
                <select className="input-field" value={sharingType} onChange={e => setSharingType(e.target.value)}>
                  <option value="1" style={{ color: '#000' }}>Single (1 Bed)</option>
                  <option value="2" style={{ color: '#000' }}>Double (2 Beds)</option>
                  <option value="3" style={{ color: '#000' }}>Triple (3 Beds)</option>
                  <option value="4" style={{ color: '#000' }}>Four Sharing (4 Beds)</option>
                  <option value="custom" style={{ color: '#000' }}>+ Custom Sharing...</option>
                </select>
              )}
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ height: '46px' }}>Save Room</button>
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
                      <h3 style={{ margin: 0 }}>Room {room.room_number}</h3>
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-color)', padding: '2px 8px', borderRadius: '12px' }}>
                        {room.sharing_type} Sharing
                      </span>
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
