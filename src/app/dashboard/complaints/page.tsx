"use client";

import { useState, useEffect } from "react";
import { useProperties } from "@/context/PropertyContext";
import { useToast } from "@/context/ToastContext";

type Notice = { id: string; title: string; content: string; priority: string; created_at: any; };

const formatDate = (dateVal: any) => {
  if (!dateVal) return "-";
  if (typeof dateVal === "object") {
    if (typeof dateVal.seconds === "number") return new Date(dateVal.seconds * 1000).toLocaleDateString();
    if (typeof dateVal._seconds === "number") return new Date(dateVal._seconds * 1000).toLocaleDateString();
  }
  return new Date(dateVal).toLocaleDateString();
};

export default function UpdatesPage() {
  const { activePropertyId, properties } = useProperties();
  const { toast } = useToast();
  const [tab, setTab] = useState<"complaints" | "notices">("complaints");

  // --- Complaints state ---
  const [complaints, setComplaints] = useState<any[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);

  // --- Notices state ---
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFormPropertyId, setSelectedFormPropertyId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");

  useEffect(() => {
    if (activePropertyId && activePropertyId !== "all") setSelectedFormPropertyId(activePropertyId);
    else if (properties.length > 0) setSelectedFormPropertyId(properties[0].id);
  }, [activePropertyId, properties]);

  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const res = await fetch(`/api/complaints${activePropertyId ? `?propertyId=${activePropertyId}` : ""}`);
      if (res.ok) setComplaints(await res.json());
    } catch (e) { console.error(e); }
    finally { setComplaintsLoading(false); }
  };

  const fetchNotices = async () => {
    setNoticesLoading(true);
    try {
      const res = await fetch(`/api/notices${activePropertyId ? `?propertyId=${activePropertyId}` : ""}`);
      if (res.ok) setNotices(await res.json());
    } catch (e) { console.error(e); }
    finally { setNoticesLoading(false); }
  };

  useEffect(() => { fetchComplaints(); fetchNotices(); }, [activePropertyId]);

  const handleResolve = async (id: string) => {
    const res = await fetch("/api/complaints", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "resolved" }) });
    if (res.ok) { toast("Complaint marked as resolved!", "success"); fetchComplaints(); }
    else toast("Failed to resolve complaint.", "error");
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/notices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content, priority, propertyId: selectedFormPropertyId }) });
      if (res.ok) { setTitle(""); setContent(""); setPriority("normal"); setShowAddForm(false); toast("Notice posted!", "success"); fetchNotices(); }
      else toast("Failed to create notice.", "error");
    } finally { setSubmitting(false); }
  };

  const handleDeleteNotice = async (id: string) => {
    const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Notice deleted.", "info"); fetchNotices(); }
    else toast("Failed to delete notice.", "error");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Updates</h1>
        {tab === "notices" && (
          <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "+ New Notice"}
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "0" }}>
        {(["complaints", "notices"] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setShowAddForm(false); }}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "0.75rem 1.25rem",
              fontWeight: tab === t ? 700 : 400, fontSize: "0.95rem",
              color: tab === t ? "var(--primary)" : "var(--text-muted)",
              borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: "-1px", transition: "all 0.2s"
            }}
          >
            {t === "complaints" ? `🔔 Complaints${complaints.length > 0 ? ` (${complaints.filter(c => c.status === "open").length} open)` : ""}` : "📢 Notice Board"}
          </button>
        ))}
      </div>

      {/* --- COMPLAINTS TAB --- */}
      {tab === "complaints" && (
        complaintsLoading ? <p>Loading complaints...</p> :
        complaints.length === 0 ? (
          <div className="card text-center" style={{ padding: "3rem" }}>
            <p>No complaints reported yet. You have a happy PG! 🎉</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {complaints.map(req => (
              <div key={req.id} className="card animate-fade-in" style={{ borderLeft: req.status === "open" ? "4px solid var(--danger)" : "4px solid var(--success)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ textTransform: "capitalize", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {req.category}
                      <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "12px", backgroundColor: req.status === "resolved" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: req.status === "resolved" ? "var(--success)" : "var(--danger)" }}>
                        {req.status.toUpperCase()}
                      </span>
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                      From: <strong>{req.tenant?.name}</strong> (Room {req.tenant?.bed?.room?.room_number} - {req.tenant?.bed?.bed_label}){activePropertyId === "all" && req.propertyName && ` — ${req.propertyName}`}
                    </p>
                    <p>{req.description}</p>
                    <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "1rem" }}>Reported on {formatDate(req.created_at)}</div>
                  </div>
                  {req.status === "open" && (
                    <button className="btn-primary" onClick={() => handleResolve(req.id)} style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* --- NOTICES TAB --- */}
      {tab === "notices" && (
        <>
          {showAddForm && (
            <div className="card mb-8 animate-fade-in">
              <h3>Create Notice</h3>
              <form onSubmit={handleCreateNotice}>
                {activePropertyId === "all" && (
                  <div className="input-group mb-0">
                    <label className="input-label">Select Property</label>
                    <select className="input-field" value={selectedFormPropertyId} onChange={e => setSelectedFormPropertyId(e.target.value)} required>
                      {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="input-group mb-0">
                  <label className="input-label">Title</label>
                  <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="input-group mb-0">
                  <label className="input-label">Priority</label>
                  <select className="input-field" value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="input-group mb-0" style={{ gridColumn: "1 / -1" }}>
                  <label className="input-label">Message</label>
                  <textarea className="input-field" rows={4} value={content} onChange={e => setContent(e.target.value)} required />
                </div>
                <div className="flex items-center" style={{ marginTop: "1.5rem", gridColumn: "1 / -1" }}>
                  <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Posting..." : "Post Notice"}</button>
                </div>
              </form>
            </div>
          )}

          {noticesLoading ? <p>Loading notices...</p> :
          notices.length === 0 ? (
            <div className="card text-center" style={{ padding: "3rem" }}>
              <p>No notices posted yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {notices.map(notice => (
                <div key={notice.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--primary)" }}>{notice.title}</h3>
                      {notice.priority === "high" && (
                        <span style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--danger)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>HIGH PRIORITY</span>
                      )}
                    </div>
                    <button onClick={() => handleDeleteNotice(notice.id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "1.2rem" }}>&times;</button>
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Posted on: {formatDate(notice.created_at)}{activePropertyId === "all" && (notice as any).propertyName && ` — ${(notice as any).propertyName}`}</div>
                  <p style={{ marginTop: "0.5rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{notice.content}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
