"use client";

import React, { useState, useEffect } from "react";

interface OwnerCrmData {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string | null;
  planTier: string;
  isTrial?: boolean;
  status: string;
  activatedAt: string | null;
  expiresAt: string | null;
  daysLeft: number | null;
  propertyCount: number;
  propertyLimit: number;
}

interface CrmSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CrmSheet({ isOpen, onClose }: CrmSheetProps) {
  const [data, setData] = useState<{ isAdmin: boolean; owners: OwnerCrmData[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active_paid" | "free_trial" | "expired" | "inactive">("all");

  const fetchCrmData = () => {
    setLoading(true);
    setError(null);
    fetch("/api/crm/owners")
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error("Access Denied. Only for master admin.");
          }
          throw new Error("Failed to fetch CRM metrics.");
        }
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "An unexpected error occurred.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      fetchCrmData();
    }
  }, [isOpen]);

  const handleToggleStatus = async (ownerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const confirmMsg = currentStatus === "active" 
      ? "Are you sure you want to DEACTIVATE this account? The owner will be locked out of property dashboard until reactivated." 
      : "Are you sure you want to ACTIVATE this account?";
    
    if (!confirm(confirmMsg)) return;

    setActionLoadingId(ownerId);
    try {
      const res = await fetch("/api/crm/owners/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, status: newStatus }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update account status.");
      }
      // Refresh data
      fetchCrmData();
    } catch (err: any) {
      alert(err.message || "Action failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Escape key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const owners = data?.owners || [];
  const filteredOwners = owners.filter((owner) => {
    const isTrial = owner.isTrial || owner.planTier.toLowerCase().includes("trial");
    const isExpired = owner.status === "expired" || (owner.status === "active" && owner.daysLeft !== null && owner.daysLeft <= 0);
    const isNoPlan = owner.planTier === "No Active Plan" || owner.status === "inactive";
    const isPaid = owner.status === "active" && !isTrial && !isExpired;

    if (statusFilter === "active_paid" && !isPaid) return false;
    if (statusFilter === "free_trial" && (!isTrial || isExpired)) return false;
    if (statusFilter === "expired" && !isExpired) return false;
    if (statusFilter === "inactive" && !isNoPlan && !isExpired) return false;

    const query = searchQuery.toLowerCase();
    return (
      owner.name.toLowerCase().includes(query) ||
      owner.email.toLowerCase().includes(query) ||
      owner.phone.toLowerCase().includes(query) ||
      owner.planTier.toLowerCase().includes(query)
    );
  });

  const totalRegistered = owners.length;
  const activeSubs = owners.filter((o) => o.status === "active").length;
  const freeTrialCount = owners.filter((o) => o.isTrial || o.planTier.toLowerCase().includes("trial")).length;
  const totalProperties = owners.reduce((acc, o) => acc + o.propertyCount, 0);

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleExportCsv = () => {
    if (filteredOwners.length === 0) return;
    const headers = ["Business Owner", "Email", "Phone", "Created On", "Plan Tier", "Status", "Activated At", "Expires At", "Days Left", "Properties"];
    const rows = filteredOwners.map((o) => [
      `"${o.name.replace(/"/g, '""')}"`,
      `"${o.email.replace(/"/g, '""')}"`,
      `"${o.phone.replace(/"/g, '""')}"`,
      `"${formatDate(o.createdAt)}"`,
      `"${o.planTier.replace(/"/g, '""')}"`,
      `"${o.status}"`,
      `"${formatDate(o.activatedAt)}"`,
      `"${formatDate(o.expiresAt)}"`,
      `"${o.daysLeft ?? '—'}"`,
      `"${o.propertyCount} / ${o.propertyLimit}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PGmate_CRM_Owners_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(12px)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1150px",
          maxHeight: "85vh",
          backgroundColor: "var(--surface-color)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "crm-scale-in 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-main)" }}>
              📌 PGmate CRM Sheet
            </h2>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {data?.isAdmin
                ? "Platform-wide registered business owners, subscriptions, and trial accounts."
                : "Your business registration and subscription status overview."}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "var(--text-muted)",
              cursor: "pointer",
              transition: "var(--transition)",
              fontSize: "1.25rem",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            ✕
          </button>
        </div>

        {/* CRM Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {error ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--danger)", backgroundColor: "rgba(239, 68, 68, 0.05)", borderRadius: "var(--radius-md)", border: "1px dashed var(--danger)", maxWidth: "600px", margin: "2rem auto" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</div>
              <div style={{ fontWeight: 600, fontSize: "1.1rem", lineHeight: 1.5 }}>{error}</div>
            </div>
          ) : loading ? (
            <div style={{ padding: "4rem 0", textAlign: "center", color: "var(--text-muted)" }}>
              <div
                style={{
                  display: "inline-block",
                  width: "30px",
                  height: "30px",
                  border: "3px solid rgba(0, 196, 159, 0.2)",
                  borderTopColor: "#00c49f",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "1rem",
                }}
              />
              <div>Loading business metrics...</div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1.25rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "rgba(30, 96, 145, 0.05)",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                    {data?.isAdmin ? "Total Registered PGs" : "Business Profile"}
                  </div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--primary)", marginTop: "0.25rem" }}>
                    {data?.isAdmin ? totalRegistered : owners[0]?.name || "Guest"}
                  </div>
                </div>

                <div
                  style={{
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "rgba(16, 185, 129, 0.05)",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                    {data?.isAdmin ? "Active Subscriptions" : "Current Plan"}
                  </div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--success)", marginTop: "0.25rem" }}>
                    {data?.isAdmin ? activeSubs : owners[0]?.planTier || "Free"}
                  </div>
                </div>

                {data?.isAdmin && (
                  <div
                    style={{
                      padding: "1.25rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "rgba(245, 158, 11, 0.05)",
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                      Free Trial Users
                    </div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f59e0b", marginTop: "0.25rem" }}>
                      {freeTrialCount}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "rgba(139, 92, 246, 0.05)",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                    {data?.isAdmin ? "Total Active PG Properties" : "Created Properties"}
                  </div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#8b5cf6", marginTop: "0.25rem" }}>
                    {data?.isAdmin ? totalProperties : `${owners[0]?.propertyCount || 0} / ${owners[0]?.propertyLimit || 1}`}
                  </div>
                </div>
              </div>

              {/* Search Bar & Controls */}
              {data?.isAdmin && (
                <div style={{ marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                    {/* Status Filter Tabs */}
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {[
                        { key: "all", label: "All Owners" },
                        { key: "active_paid", label: "Active Paid" },
                        { key: "free_trial", label: "Free Trial" },
                        { key: "expired", label: "Expired" },
                        { key: "inactive", label: "Inactive" },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setStatusFilter(tab.key as any)}
                          style={{
                            padding: "0.4rem 0.85rem",
                            borderRadius: "var(--radius-md)",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            border: "1px solid var(--border-color)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            backgroundColor: statusFilter === tab.key ? "var(--primary)" : "rgba(255,255,255,0.03)",
                            color: statusFilter === tab.key ? "#fff" : "var(--text-muted)",
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* CSV Export Button */}
                    <button
                      onClick={handleExportCsv}
                      style={{
                        padding: "0.45rem 1rem",
                        borderRadius: "var(--radius-md)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        backgroundColor: "rgba(16, 185, 129, 0.15)",
                        color: "var(--success)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      📥 Export CSV
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Search by owner name, email, phone, or plan tier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "transparent",
                      color: "var(--text-main)",
                      outline: "none",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>
              )}

              {/* Table */}
              <div style={{ overflowX: "auto", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-color)" }}>
                      <th style={{ padding: "1rem" }}>Business Owner</th>
                      <th style={{ padding: "1rem" }}>Contact Details</th>
                      <th style={{ padding: "1rem" }}>Generated On</th>
                      <th style={{ padding: "1rem" }}>Plan Tier</th>
                      <th style={{ padding: "1rem" }}>Activated At</th>
                      <th style={{ padding: "1rem" }}>Time Left</th>
                      <th style={{ padding: "1rem" }}>Properties</th>
                      {data?.isAdmin && <th style={{ padding: "1rem", textAlign: "center" }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOwners.length === 0 ? (
                      <tr>
                        <td colSpan={data?.isAdmin ? 8 : 7} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                          No registered businesses found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOwners.map((owner) => {
                        const isExpired = owner.status === "expired" || (owner.status === "active" && owner.daysLeft !== null && owner.daysLeft <= 0);
                        const isNoPlan = owner.planTier === "No Active Plan" || owner.status === "inactive";
                        const isTrial = owner.isTrial || owner.planTier.toLowerCase().includes("trial");

                        return (
                          <tr
                            key={owner.id}
                            style={{
                              borderBottom: "1px solid var(--border-color)",
                              transition: "var(--transition)",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.01)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <td style={{ padding: "1rem", fontWeight: 600, color: "var(--text-main)" }}>
                              {owner.name}
                            </td>
                            <td style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                              <div>✉ {owner.email}</div>
                              <div style={{ marginTop: "0.25rem" }}>📞 {owner.phone || "—"}</div>
                            </td>
                            <td style={{ padding: "1rem", color: "var(--text-muted)" }}>
                              {formatDate(owner.createdAt)}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <span
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: "12px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  backgroundColor: isNoPlan 
                                    ? "rgba(239, 68, 68, 0.1)" 
                                    : isTrial 
                                    ? "rgba(245, 158, 11, 0.15)" 
                                    : "rgba(16, 185, 129, 0.1)",
                                  color: isNoPlan 
                                    ? "var(--danger)" 
                                    : isTrial 
                                    ? "#f59e0b" 
                                    : "var(--success)",
                                  border: `1px solid ${
                                    isNoPlan 
                                      ? "rgba(239, 68, 68, 0.2)" 
                                      : isTrial 
                                      ? "rgba(245, 158, 11, 0.3)" 
                                      : "rgba(16, 185, 129, 0.2)"
                                  }`,
                                }}
                              >
                                {owner.planTier}
                              </span>
                            </td>
                            <td style={{ padding: "1rem", color: "var(--text-muted)" }}>
                              {formatDate(owner.activatedAt)}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              {isExpired ? (
                                <span style={{ fontWeight: 600, color: "var(--danger)" }}>Expired</span>
                              ) : owner.status === "active" && owner.daysLeft !== null ? (
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: owner.daysLeft <= 7
                                      ? "var(--danger)"
                                      : owner.daysLeft <= 15
                                      ? "#f59e0b"
                                      : "var(--success)",
                                  }}
                                >
                                  {owner.daysLeft} days left{isTrial ? " (Trial)" : ""}
                                </span>
                              ) : (
                                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                  {owner.status === "active" ? "Lifetime / Unlimited" : "Inactive"}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                                {owner.propertyCount}
                              </span>
                              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                {" "}/ {owner.propertyLimit}
                              </span>
                            </td>
                            {data?.isAdmin && (
                              <td style={{ padding: "1rem", textAlign: "center" }}>
                                <button
                                  disabled={actionLoadingId === owner.id}
                                  onClick={() => handleToggleStatus(owner.id, owner.status)}
                                  style={{
                                    padding: "4px 10px",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    borderRadius: "var(--radius-md)",
                                    border: "none",
                                    cursor: actionLoadingId === owner.id ? "not-allowed" : "pointer",
                                    opacity: actionLoadingId === owner.id ? 0.6 : 1,
                                    backgroundColor: owner.status === "active" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                                    color: owner.status === "active" ? "var(--danger)" : "var(--success)",
                                    transition: "all 0.2s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (actionLoadingId !== owner.id) {
                                      e.currentTarget.style.backgroundColor = owner.status === "active" ? "var(--danger)" : "var(--success)";
                                      e.currentTarget.style.color = "#fff";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (actionLoadingId !== owner.id) {
                                      e.currentTarget.style.backgroundColor = owner.status === "active" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)";
                                      e.currentTarget.style.color = owner.status === "active" ? "var(--danger)" : "var(--success)";
                                    }
                                  }}
                                >
                                  {actionLoadingId === owner.id 
                                    ? "Updating..." 
                                    : owner.status === "active" 
                                    ? "Deactivate" 
                                    : "Activate"}
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderTop: "1px solid var(--border-color)",
            backgroundColor: "rgba(0,0,0,0.05)",
            textAlign: "right",
          }}
        >
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}
          >
            Close Sheet
          </button>
        </div>
      </div>

      <style>{`
        @keyframes crm-scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
