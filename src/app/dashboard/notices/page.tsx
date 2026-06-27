"use client";

import { useState, useEffect } from "react";
import { useProperties } from "@/context/PropertyContext";

type Notice = {
  id: string;
  title: string;
  content: string;
  priority: string;
  created_at: any;
};

export default function NoticeBoardPage() {
  const { activePropertyId, properties } = useProperties();
  const [selectedFormPropertyId, setSelectedFormPropertyId] = useState("");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");

  useEffect(() => {
    if (activePropertyId && activePropertyId !== "all") {
      setSelectedFormPropertyId(activePropertyId);
    } else if (properties.length > 0) {
      setSelectedFormPropertyId(properties[0].id);
    }
  }, [activePropertyId, properties]);

  const fetchNotices = async () => {
    try {
      const queryParam = activePropertyId ? `?propertyId=${activePropertyId}` : "";
      const res = await fetch(`/api/notices${queryParam}`);
      if (res.ok) {
        setNotices(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [activePropertyId]);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, priority, propertyId: selectedFormPropertyId }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        setPriority("normal");
        setShowAddForm(false);
        fetchNotices();
      } else {
        alert("Failed to create notice.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchNotices();
      } else {
        alert("Failed to delete notice.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return "-";
    if (typeof dateVal === "object") {
      if (typeof dateVal.seconds === "number") {
        return new Date(dateVal.seconds * 1000).toLocaleDateString();
      }
      if (typeof dateVal._seconds === "number") {
        return new Date(dateVal._seconds * 1000).toLocaleDateString();
      }
    }
    return new Date(dateVal).toLocaleDateString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Notice Board</h1>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ New Notice"}
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-8 animate-fade-in">
          <h3>Create Notice</h3>
          <form onSubmit={handleCreateNotice}>
            {activePropertyId === "all" && (
              <div className="input-group mb-0">
                <label className="input-label">Select Property</label>
                <select className="input-field" value={selectedFormPropertyId} onChange={e => setSelectedFormPropertyId(e.target.value)} required>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
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
            <div className="input-group mb-0" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Message</label>
              <textarea className="input-field" rows={4} value={content} onChange={e => setContent(e.target.value)} required></textarea>
            </div>
            <div className="flex items-center" style={{ marginTop: '1.5rem', gridColumn: '1 / -1' }}>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Posting..." : "Post Notice"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading notices...</p>
      ) : notices.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p>No notices posted yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notices.map(notice => (
            <div key={notice.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)' }}>{notice.title}</h3>
                  {notice.priority === 'high' && (
                    <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
                <button onClick={() => handleDelete(notice.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }}>
                  &times;
                </button>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Posted on: {formatDate(notice.created_at)}{activePropertyId === "all" && (notice as any).propertyName && ` — ${(notice as any).propertyName}`}</div>
              <p style={{ marginTop: '0.5rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{notice.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
