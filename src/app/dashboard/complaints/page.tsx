"use client";

import { useState, useEffect } from "react";
import { useProperties } from "@/context/PropertyContext";
import { useToast } from "@/context/ToastContext";

export default function ComplaintsPage() {
  const { activePropertyId } = useProperties();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateVal: any) => {
    if (!dateVal) return "-";
    if (typeof dateVal === "object" && typeof dateVal.seconds === "number") {
      return new Date(dateVal.seconds * 1000).toLocaleDateString();
    }
    return new Date(dateVal).toLocaleDateString();
  };

  const fetchData = async () => {
    try {
      const queryParam = activePropertyId ? `?propertyId=${activePropertyId}` : "";
      const res = await fetch(`/api/complaints${queryParam}`);
      if (res.ok) {
        setComplaints(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activePropertyId]);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "resolved" })
      });
      if (res.ok) {
        toast("Complaint marked as resolved!", "success");
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.message || "Failed to mark complaint as resolved.", "error");
      }
    } catch (e) {
      console.error(e);
      toast("Error marking complaint as resolved.", "error");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Tenant Complaints</h1>
      </div>

      {loading ? (
        <p>Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p>No complaints reported yet. You have a happy PG!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {complaints.map(req => (
            <div key={req.id} className="card animate-fade-in" style={{ borderLeft: req.status === 'open' ? '4px solid var(--danger)' : '4px solid var(--success)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ textTransform: 'capitalize', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {req.category}
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      backgroundColor: req.status === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: req.status === 'resolved' ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {req.status.toUpperCase()}
                    </span>
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    From: <strong>{req.tenant?.name}</strong> (Room {req.tenant?.bed?.room?.room_number} - {req.tenant?.bed?.bed_label}){activePropertyId === "all" && req.propertyName && ` — ${req.propertyName}`}
                  </p>
                  <p>{req.description}</p>
                  <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '1rem' }}>
                    Reported on {formatDate(req.created_at)}
                  </div>
                </div>
                {req.status === 'open' && (
                  <button 
                    className="btn-primary" 
                    onClick={() => handleResolve(req.id)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
