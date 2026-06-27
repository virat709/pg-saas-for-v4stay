"use client";

import { useState, useEffect } from "react";

type Room = { room_number: string };
type Bed = { id: string; bed_label: string; room: Room };
type Tenant = {
  id: string;
  name: string;
  phone: string;
  rent_amount: number;
  billing_cycle_day: number;
  status: string;
  bed?: Bed;
  security_deposit_amount?: string;
  date_joined?: string;
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [availableBeds, setAvailableBeds] = useState<{id: string, label: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const [editTenantData, setEditTenantData] = useState<Tenant | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRentAmount, setEditRentAmount] = useState("");
  const [editBillingCycleDay, setEditBillingCycleDay] = useState("5");
  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bedId, setBedId] = useState("");
  const [dateJoined, setDateJoined] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [billingCycleDay, setBillingCycleDay] = useState("5");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [idProofPreview, setIdProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Bulk CSV Upload State
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const getDaysLeft = (billingDay: number) => {
    if (!billingDay) return 0;
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (currentDay <= billingDay) {
      return billingDay - currentDay;
    } else {
      return (daysInMonth - currentDay) + billingDay;
    }
  };

  const fetchData = async () => {
    try {
      const [tenantsRes, roomsRes] = await Promise.all([
        fetch("/api/tenants"),
        fetch("/api/rooms")
      ]);
      
      if (tenantsRes.ok) {
        setTenants(await tenantsRes.json());
      }
      
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        const vacantBeds: {id: string, label: string}[] = [];
        roomsData.forEach((r: any) => {
          r.beds.forEach((b: any) => {
            if (b.status === "vacant") {
              vacantBeds.push({ id: `${r.id}_${b.id}`, label: `Room ${r.room_number} - ${b.bed_label}` });
            }
          });
        });
        setAvailableBeds(vacantBeds);
        if (vacantBeds.length > 0) setBedId(vacantBeds[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setCsvUploading(true);
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) {
        alert("CSV file must contain a header and at least one row of data.");
        setCsvUploading(false);
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const tenantsData = [];
      
      for (let i = 1; i < lines.length; i++) {
        // Handle basic CSV splitting, ignoring commas inside quotes if possible
        // A simple split is used here for simplicity as requested
        const values = lines[i].split(',').map(v => v.trim());
        const tenantObj: any = {};
        headers.forEach((header, index) => {
          tenantObj[header] = values[index];
        });
        tenantsData.push(tenantObj);
      }

      const res = await fetch('/api/tenants/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenants: tenantsData })
      });

      if (res.ok) {
        alert("Tenants uploaded successfully!");
        setShowCsvUpload(false);
        setCsvFile(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to upload tenants.");
      }
    } catch (e) {
      console.error(e);
      alert("Error parsing or uploading CSV.");
    } finally {
      setCsvUploading(false);
    }
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let photoUrl = null;
      let idProofUrl = null;



      // Temporarily bypass file uploads to Firebase Storage
      if (photoFile) {
        console.log("Skipping photo upload as per user request.");
      }

      if (idProofFile) {
        console.log("Skipping ID proof upload as per user request.");
      }

      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, bedId, date_joined: dateJoined,
          rent_amount: rentAmount, billing_cycle_day: billingCycleDay,
          security_deposit_amount: securityDeposit,
          photo: photoUrl, id_proof_doc: idProofUrl
        })
      });
      if (res.ok) {
        setShowAddForm(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        setIdProofFile(null);
        setIdProofPreview(null);
        fetchData();
      }
    } catch (e: any) {
      console.error(e);
      alert("Error saving tenant: " + (e.message || "Unknown error. Check console for details."));
    } finally {
      setUploading(false);
    }
  };

  const handleVacate = async (tenantId: string, tenantName: string) => {
    if (!confirm(
      `⚠️ Vacate "${tenantName}"?\n\n` +
      `This will:\n` +
      `• Free up their bed\n` +
      `• Permanently DELETE their portal access\n` +
      `• Their link will stop working immediately\n\n` +
      `This action cannot be undone. Proceed?`
    )) return;
    setActionLoading(tenantId);
    try {
      const res = await fetch(`/api/tenants/${tenantId}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to vacate tenant.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTenantData) return;
    setUploading(true);
    try {
      const res = await fetch(`/api/tenants/${editTenantData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          rent_amount: editRentAmount,
          billing_cycle_day: editBillingCycleDay
        })
      });
      if (res.ok) {
        setEditTenantData(null);
        fetchData();
      } else {
        alert("Failed to update tenant.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string, tenantName: string) => {
    if (!confirm(
      `🧨 HARD DELETE "${tenantName}"?\n\n` +
      `This will completely erase the tenant from the database. Use this ONLY for mistakes.\n\n` +
      `Are you absolutely sure?`
    )) return;
    setActionLoading(tenantId);
    try {
      const res = await fetch(`/api/tenants/${tenantId}?hard=true`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete tenant.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Phone", "Room", "Bed", "Rent", "Status", "Date Joined"];
    const rows = tenants.map((t) => [
      t.name,
      t.phone,
      t.bed?.room?.room_number || "Unassigned",
      t.bed?.bed_label || "",
      t.rent_amount,
      t.status,
      t.date_joined || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map(String).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tenants-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8" style={{ flexWrap: "wrap", gap: "1rem" }}>
        <h1>Tenants</h1>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={exportCSV}
            style={{ padding: "0.6rem 1.1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", backgroundColor: "var(--surface-color)", color: "var(--text-main)", fontWeight: 500, cursor: "pointer", fontSize: "0.875rem" }}
          >
            ⬇ Export CSV
          </button>
          <button className="btn-secondary" onClick={() => setShowCsvUpload(!showCsvUpload)} style={{ padding: "0.6rem 1.1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--primary)", backgroundColor: "transparent", color: "var(--primary)", cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}>
            {showCsvUpload ? "Cancel Upload" : "Upload CSV"}
          </button>
          <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "+ Add Tenant"}
          </button>
        </div>
      </div>

      {showCsvUpload && (
        <div className="card mb-8 animate-fade-in">
          <h3>Upload Tenants via CSV</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Format: <code style={{background: 'rgba(0,0,0,0.1)', padding: '2px 4px', borderRadius: '4px'}}>name, phone, roomnumber, bedlabel, rentamount, billingcycleday, securitydeposit, emergencycontact</code>
          </p>
          <div className="input-group mb-0">
            <input type="file" accept=".csv" className="input-field" onChange={e => {
              const file = e.target?.files?.[0] || null;
              setCsvFile(file);
            }} />
          </div>
          <div className="flex items-center" style={{ marginTop: '1.5rem' }}>
            <button onClick={handleCsvUpload} className="btn-primary" disabled={!csvFile || csvUploading}>
              {csvUploading ? "Uploading..." : "Upload CSV"}
            </button>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="card mb-8 animate-fade-in">
          <h3>Add New Tenant</h3>
          <form onSubmit={handleAddTenant} className="add-tenant-form">
            <div className="input-group mb-0">
              <label className="input-label">Full Name</label>
              <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Phone Number</label>
              <input type="tel" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Assign Bed</label>
              <select className="input-field" value={bedId} onChange={e => setBedId(e.target.value)} required>
                {availableBeds.map(b => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Date Joined</label>
              <input type="date" className="input-field" value={dateJoined} onChange={e => setDateJoined(e.target.value)} required />
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Monthly Rent (₹)</label>
              <input type="number" className="input-field" value={rentAmount} onChange={e => setRentAmount(e.target.value)} required />
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Security Deposit (₹)</label>
              <input type="number" className="input-field" value={securityDeposit} onChange={e => setSecurityDeposit(e.target.value)} required />
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Billing Cycle Day</label>
              <input type="number" min="1" max="31" className="input-field" value={billingCycleDay} onChange={e => setBillingCycleDay(e.target.value)} required placeholder="e.g. 5" />
            </div>
            <div className="input-group mb-0" style={{ display: 'flex', flexDirection: 'column', opacity: 0.5 }}>
              <label className="input-label">Tenant Photo (Locked for now)</label>
              <input type="file" accept="image/*" disabled className="input-field" onChange={e => {
                const file = e.target?.files?.[0] || null;
                setPhotoFile(file);
                if (file) setPhotoPreview(URL.createObjectURL(file));
                else setPhotoPreview(null);
              }} style={{ padding: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', cursor: 'not-allowed' }} />
              {photoPreview && <img src={photoPreview} alt="Preview" style={{ marginTop: '0.5rem', height: '60px', width: '60px', objectFit: 'cover', borderRadius: '8px' }} />}
            </div>
            <div className="input-group mb-0" style={{ display: 'flex', flexDirection: 'column', opacity: 0.5 }}>
              <label className="input-label">ID Proof Document (Locked for now)</label>
              <input type="file" accept="image/*,.pdf" disabled className="input-field" onChange={e => {
                const file = e.target?.files?.[0] || null;
                setIdProofFile(file);
                if (file && file.type.startsWith('image/')) setIdProofPreview(URL.createObjectURL(file));
                else setIdProofPreview(null);
              }} style={{ padding: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', cursor: 'not-allowed' }} />
              {idProofPreview && <img src={idProofPreview} alt="Preview" style={{ marginTop: '0.5rem', height: '60px', width: '60px', objectFit: 'cover', borderRadius: '8px' }} />}
            </div>
            <div className="flex items-center" style={{ marginTop: '1.5rem', gridColumn: '1 / -1' }}>
              <button type="submit" className="btn-primary w-full" disabled={uploading}>
                {uploading ? "Uploading & Saving..." : "Save Tenant"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading tenants...</p>
      ) : tenants.length === 0 ? (
        <div className="card text-center animate-fade-in" style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(0,196,159,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No tenants added yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Add your first tenant manually or upload multiple tenants at once using a CSV file.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={() => setShowAddForm(true)}>
              + Add Tenant
            </button>
          </div>
        </div>
      ) : (
        <div className="card table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Room / Bed</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Rent</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Days Left</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => (
                <tr key={tenant.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{tenant.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{tenant.phone}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {tenant.bed ? `Room ${tenant.bed.room?.room_number ?? '?'} - ${tenant.bed.bed_label}` : 'Unassigned'}
                  </td>
                  <td style={{ padding: '1rem' }}>₹{tenant.rent_amount}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 500,
                      backgroundColor: tenant.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-color)',
                      color: tenant.status === 'active' ? 'var(--success)' : 'var(--text-muted)'
                    }}>
                      {tenant.status?.toUpperCase() ?? 'UNKNOWN'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    {tenant.status === 'active' ? (
                      <span style={{ color: getDaysLeft(tenant.billing_cycle_day) <= 5 ? 'var(--danger)' : 'inherit' }}>
                        {getDaysLeft(tenant.billing_cycle_day)} days
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => setSelectedTenant(tenant)} 
                        style={{ padding: '6px 12px', fontSize: '0.875rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => { setEditTenantData(tenant); setEditName(tenant.name); setEditPhone(tenant.phone); setEditRentAmount(tenant.rent_amount?.toString() || ""); setEditBillingCycleDay(tenant.billing_cycle_day?.toString() || "5"); }} 
                        style={{ padding: '6px 12px', fontSize: '0.875rem', backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteTenant(tenant.id, tenant.name)} 
                        disabled={actionLoading === tenant.id}
                        style={{ padding: '6px 12px', fontSize: '0.875rem', backgroundColor: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                      {tenant.status === 'active' && (
                        <>
                          <button 
                          onClick={() => {
                            const url = `${window.location.origin}/t/${tenant.id}`;
                            navigator.clipboard.writeText(url);
                            alert("Tenant access link copied to clipboard!\n\n" + url);
                          }} 
                          style={{ padding: '6px 12px', fontSize: '0.875rem', backgroundColor: 'var(--primary)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Copy Link
                        </button>
                        <button 
                          onClick={() => handleVacate(tenant.id, tenant.name)} 
                          disabled={actionLoading === tenant.id}
                          style={{ padding: '6px 12px', fontSize: '0.875rem', backgroundColor: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          {actionLoading === tenant.id ? '...' : '🚪 Vacate'}
                        </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTenant && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>Tenant Details</h2>
              <button onClick={() => setSelectedTenant(null)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', lineHeight: 1, color: 'var(--text-muted)' }}>&times;</button>
            </div>
            
            <div className="tenant-details-grid">
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Full Name</div>
                <div style={{ fontWeight: 500, fontSize: '1.1rem' }}>{selectedTenant.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Phone Number</div>
                <div style={{ fontWeight: 500, fontSize: '1.1rem' }}>{selectedTenant.phone}</div>
              </div>
              <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: 'var(--border-color)' }}></div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Room / Bed</div>
                <div style={{ fontWeight: 500 }}>{selectedTenant.bed ? `Room ${selectedTenant.bed.room?.room_number ?? '?'} - ${selectedTenant.bed.bed_label}` : 'Unassigned'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Date Joined</div>
                <div style={{ fontWeight: 500 }}>{selectedTenant.date_joined || '-'}</div>
              </div>
              <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: 'var(--border-color)' }}></div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Monthly Rent</div>
                <div style={{ fontWeight: 500 }}>₹{selectedTenant.rent_amount}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Security Deposit</div>
                <div style={{ fontWeight: 500 }}>₹{selectedTenant.security_deposit_amount || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Billing Cycle Day</div>
                <div style={{ fontWeight: 500 }}>{selectedTenant.billing_cycle_day}th</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</div>
                <div style={{ 
                  display: 'inline-block',
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  backgroundColor: selectedTenant.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-color)',
                  color: selectedTenant.status === 'active' ? 'var(--success)' : 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  {selectedTenant.status}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => setSelectedTenant(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {editTenantData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>Edit Tenant</h2>
              <button onClick={() => setEditTenantData(null)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', lineHeight: 1, color: 'var(--text-muted)' }}>&times;</button>
            </div>
            <form onSubmit={handleEditTenantSubmit} className="add-tenant-form">
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input type="tel" className="input-field" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Monthly Rent (₹)</label>
                <input type="number" className="input-field" value={editRentAmount} onChange={(e) => setEditRentAmount(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Billing Cycle Day</label>
                <input type="number" className="input-field" value={editBillingCycleDay} onChange={(e) => setEditBillingCycleDay(e.target.value)} min="1" max="31" required />
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary w-full" disabled={uploading}>
                  {uploading ? "Saving..." : "Update Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .add-tenant-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }
        .table-responsive {
          padding: 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .tenant-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 600px) {
          .add-tenant-form {
            grid-template-columns: 1fr;
          }
          .tenant-details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
