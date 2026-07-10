"use client";

import { useState, useEffect } from "react";
import { useProperties } from "@/context/PropertyContext";
import { useToast } from "@/context/ToastContext";

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
  propertyId?: string;
};

export default function TenantsPage() {
  const { activePropertyId, properties } = useProperties();
  const { toast } = useToast();
  const [selectedFormPropertyId, setSelectedFormPropertyId] = useState("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [availableBeds, setAvailableBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [copiedTenantId, setCopiedTenantId] = useState<string | null>(null);
  const [roomChangeTenant, setRoomChangeTenant] = useState<Tenant | null>(null);
  const [changeRoomFloor, setChangeRoomFloor] = useState("");
  const [changeRoomRoomNumber, setChangeRoomRoomNumber] = useState("");
  const [changeRoomBedId, setChangeRoomBedId] = useState("");
  const [changingRoom, setChangingRoom] = useState(false);

  useEffect(() => {
    if (activePropertyId && activePropertyId !== "all") {
      setSelectedFormPropertyId(activePropertyId);
    } else if (properties.length > 0) {
      setSelectedFormPropertyId(properties[0].id);
    }
  }, [activePropertyId, properties]);

  const [editTenantData, setEditTenantData] = useState<Tenant | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRentAmount, setEditRentAmount] = useState("");
  const [editBillingCycleDay, setEditBillingCycleDay] = useState("5");
  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bedId, setBedId] = useState("");
  const [formPropertyId, setFormPropertyId] = useState("");
  const [formFloor, setFormFloor] = useState("");
  const [formRoomNumber, setFormRoomNumber] = useState("");
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

  // Offline payment quick-action state
  const [offlinePayTenant, setOfflinePayTenant] = useState<Tenant | null>(null);
  const [offlinePayAmount, setOfflinePayAmount] = useState("");
  const [offlinePayNote, setOfflinePayNote] = useState("");
  const [offlinePayDate, setOfflinePayDate] = useState("");
  const [offlinePayPersonName, setOfflinePayPersonName] = useState("");
  const [submittingOfflinePay, setSubmittingOfflinePay] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
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

  const getPaymentStatus = (tenantId: string, billingDay: number, rentAmount: number) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Sum all rent payments for this tenant in the current month
    const tenantPayments = payments.filter(p => {
      if (p.tenantId !== tenantId || p.type !== "rent") return false;
      let pDate: Date;
      if (p.payment_date?.seconds) {
        pDate = new Date(p.payment_date.seconds * 1000);
      } else if (p.payment_date?._seconds) {
        pDate = new Date(p.payment_date._seconds * 1000);
      } else {
        pDate = new Date(p.payment_date);
      }
      return !isNaN(pDate.getTime()) && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    });

    const totalPaid = tenantPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
    const leftPending = rentAmount - totalPaid;

    if (totalPaid > 0) {
      if (leftPending <= 0) {
        return { text: "Paid", color: "var(--success)", isOverdue: false };
      } else {
        return { text: `Partial (₹${leftPending} pending)`, color: "var(--warning)", isOverdue: false };
      }
    }

    const currentDay = now.getDate();
    if (currentDay <= billingDay) {
      const daysLeft = billingDay - currentDay;
      return { text: `Due in ${daysLeft}d`, color: "var(--warning)", isOverdue: false };
    } else {
      const daysOverdue = currentDay - billingDay;
      return { text: `Overdue ${daysOverdue}d`, color: "var(--danger)", isOverdue: true };
    }
  };

  // Synchronize Change Room modal dropdown cascading state
  useEffect(() => {
    if (!roomChangeTenant) return;
    const propId = roomChangeTenant.propertyId || selectedFormPropertyId;
    const filtered = availableBeds.filter(b => b.propertyId === propId);
    
    // Get unique floors
    const floors = Array.from(new Set(filtered.map(b => b.floor || "Ground Floor")));
    
    let currentFloor = changeRoomFloor;
    if (!currentFloor || !floors.includes(currentFloor)) {
      currentFloor = floors[0] || "";
      setChangeRoomFloor(currentFloor);
    }
    
    // Get rooms on current floor
    const roomsOnFloor = Array.from(new Set(filtered.filter(b => b.floor === currentFloor).map(b => b.roomNumber)));
    
    let currentRoom = changeRoomRoomNumber;
    if (!currentRoom || !roomsOnFloor.includes(currentRoom)) {
      currentRoom = roomsOnFloor[0] || "";
      setChangeRoomRoomNumber(currentRoom);
    }
    
    // Get beds in current room on current floor
    const beds = filtered.filter(b => b.floor === currentFloor && b.roomNumber === currentRoom);
    
    let currentBed = changeRoomBedId;
    if (beds.length > 0) {
      if (!currentBed || !beds.some(b => b.id === currentBed)) {
        currentBed = beds[0].id;
        setChangeRoomBedId(currentBed);
      }
    } else {
      setChangeRoomBedId("");
    }
  }, [roomChangeTenant, changeRoomFloor, changeRoomRoomNumber, availableBeds]);

  const handleChangeRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomChangeTenant || !changeRoomBedId) return;
    
    setChangingRoom(true);
    const [newRoomId, newBedId] = changeRoomBedId.split("_");
    
    try {
      const res = await fetch(`/api/tenants/${roomChangeTenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newRoomId, newBedId })
      });
      
      if (res.ok) {
        toast("Room changed successfully!", "success");
        setRoomChangeTenant(null);
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.message || "Failed to change room.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error changing room.", "error");
    } finally {
      setChangingRoom(false);
    }
  };

  const fetchData = async () => {
    try {
      const queryParam = activePropertyId ? `?propertyId=${activePropertyId}` : "";
      const [tenantsRes, roomsRes, paymentsRes] = await Promise.all([
        fetch(`/api/tenants${queryParam}`),
        fetch(`/api/rooms${queryParam}`),
        fetch(`/api/payments${queryParam}`)
      ]);
      
      if (tenantsRes.ok) {
        setTenants(await tenantsRes.json());
      }

      if (paymentsRes.ok) {
        setPayments(await paymentsRes.json());
      }
      
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        const vacantBeds: any[] = [];
        roomsData.forEach((r: any) => {
          (r.beds || []).forEach((b: any) => {
            if (b.status === "vacant") {
              vacantBeds.push({ 
                id: `${r.id}_${b.id}`, 
                bedId: b.id,
                bedLabel: b.bed_label,
                roomId: r.id,
                roomNumber: r.room_number,
                floor: r.floor || "Ground Floor",
                propertyName: r.propertyName || "PG",
                propertyId: r.propertyId 
              });
            }
          });
        });
        setAvailableBeds(vacantBeds);
        if (vacantBeds.length > 0) {
          setBedId(vacantBeds[0].id);
          if (vacantBeds[0].propertyId) {
            setSelectedFormPropertyId(vacantBeds[0].propertyId);
          }
        }
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

  // Synchronize cascaded selectors
  useEffect(() => {
    if (availableBeds.length === 0) {
      setFormPropertyId("");
      setFormFloor("");
      setFormRoomNumber("");
      setBedId("");
      return;
    }

    // 1. Property selector sync
    let targetProp = formPropertyId;
    if (activePropertyId && activePropertyId !== "all") {
      targetProp = activePropertyId;
    } else {
      const props = Array.from(new Set(availableBeds.map(b => b.propertyId)));
      if (!props.includes(targetProp)) {
        targetProp = props[0] || "";
      }
    }
    if (targetProp !== formPropertyId) {
      setFormPropertyId(targetProp);
    }

    // Filter beds of selected property
    const propBeds = availableBeds.filter(b => b.propertyId === targetProp);
    if (propBeds.length === 0) {
      setFormFloor("");
      setFormRoomNumber("");
      setBedId("");
      return;
    }

    // 2. Floor selector sync
    const floors = Array.from(new Set(propBeds.map(b => b.floor || "Ground Floor"))).sort();
    let targetFloor = formFloor;
    if (!floors.includes(targetFloor)) {
      targetFloor = floors[0] || "";
    }
    if (targetFloor !== formFloor) {
      setFormFloor(targetFloor);
    }

    // Filter beds of selected floor
    const floorBeds = propBeds.filter(b => (b.floor || "Ground Floor") === targetFloor);
    if (floorBeds.length === 0) {
      setFormRoomNumber("");
      setBedId("");
      return;
    }

    // 3. Room selector sync
    const roomNums = Array.from(new Set(floorBeds.map(b => b.roomNumber))).sort((a, b) => a.localeCompare(b));
    let targetRoomNum = formRoomNumber;
    if (!roomNums.includes(targetRoomNum)) {
      targetRoomNum = roomNums[0] || "";
    }
    if (targetRoomNum !== formRoomNumber) {
      setFormRoomNumber(targetRoomNum);
    }

    // Filter beds of selected room
    const roomBeds = floorBeds.filter(b => b.roomNumber === targetRoomNum);
    if (roomBeds.length === 0) {
      setBedId("");
      return;
    }

    // 4. Bed selector sync
    let targetBedId = bedId;
    const bedIds = roomBeds.map(b => b.id);
    if (!bedIds.includes(targetBedId)) {
      targetBedId = roomBeds[0].id;
    }
    if (targetBedId !== bedId) {
      setBedId(targetBedId);
    }
    setSelectedFormPropertyId(targetProp);
  }, [availableBeds, activePropertyId, formPropertyId, formFloor, formRoomNumber, bedId]);

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setCsvUploading(true);
    try {
      const text = await csvFile.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        toast("CSV file must contain a header and at least one row of data.", "warning");
        setCsvUploading(false);
        return;
      }
      
      // Detect delimiter (comma or semicolon)
      const firstLine = lines[0];
      const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';

      // Robust CSV line parser helper to handle quoted values and inner commas
      const parseCSVLine = (line: string, delim: string) => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === delim && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result.map(v => v.replace(/^["']|["']$/g, '').trim());
      };

      // Normalize header names to match what the backend expects
      const headers = parseCSVLine(lines[0], delimiter).map(h => {
        const norm = h.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (norm === "room" || norm === "roomno" || norm === "roomnumber") return "roomnumber";
        if (norm === "bed" || norm === "bedlabel" || norm === "bedno") return "bedlabel";
        if (norm === "rent" || norm === "rentamount") return "rentamount";
        if (norm === "billingcycleday" || norm === "billingcycle") return "billingcycleday";
        if (norm === "securitydeposit" || norm === "deposit") return "securitydeposit";
        if (norm === "emergencycontact" || norm === "emergencyphone") return "emergencycontact";
        return norm;
      });
      
      const tenantsData = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i], delimiter);
        // Skip blank or placeholder lines
        if (values.every(v => v === "")) continue;

        const tenantObj: any = {};
        headers.forEach((header, index) => {
          tenantObj[header] = values[index] !== undefined ? values[index] : "";
        });
        tenantsData.push(tenantObj);
      }

      const res = await fetch('/api/tenants/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenants: tenantsData, propertyId: selectedFormPropertyId })
      });

      if (res.ok) {
        toast("Tenants uploaded successfully!", "success");
        setShowCsvUpload(false);
        setCsvFile(null);
        fetchData();
      } else {
        const data = await res.json();
        toast(data.message || "Failed to upload tenants.", "error");
      }
    } catch (e) {
      console.error(e);
      toast("Error parsing or uploading CSV.", "error");
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
          photo: photoUrl, id_proof_doc: idProofUrl,
          propertyId: selectedFormPropertyId
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
      toast("Error saving tenant: " + (e.message || "Unknown error."), "error");
    } finally {
      setUploading(false);
    }
  };

  const handleVacate = async (tenantId: string, tenantName: string) => {
    setActionLoading(tenantId);
    try {
      const res = await fetch(`/api/tenants/${tenantId}`, { method: "DELETE" });
      if (res.ok) {
        toast(`"${tenantName}" has been vacated.`, "info");
        fetchData();
      } else if (res.status === 404) {
        toast(`"${tenantName}" has already been vacated.`, "info");
        fetchData();
      } else {
        toast("Failed to vacate tenant.", "error");
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
        toast("Tenant updated successfully.", "success");
        setEditTenantData(null);
        fetchData();
      } else {
        toast("Failed to update tenant.", "error");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string, tenantName: string) => {
    setActionLoading(tenantId);
    try {
      const res = await fetch(`/api/tenants/${tenantId}?hard=true`, { method: "DELETE" });
      if (res.ok || res.status === 404) {
        toast(`"${tenantName}" permanently deleted.`, "info");
        fetchData();
      } else {
        toast("Failed to delete tenant.", "error");
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

  const handleOfflinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlinePayTenant || !offlinePayAmount || isNaN(parseFloat(offlinePayAmount))) {
      toast("Please enter a valid amount.", "warning");
      return;
    }
    setSubmittingOfflinePay(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: offlinePayTenant.id,
          type: "rent",
          amount: offlinePayAmount,
          amount_paid: offlinePayAmount,
          method: "Cash",
          propertyId: (offlinePayTenant as any).propertyId || "",
          reference: offlinePayNote || "Cash payment recorded by admin",
          payment_date: offlinePayDate || undefined,
          payer_name: offlinePayPersonName || undefined,
        }),
      });
      if (res.ok) {
        toast(`Cash payment of ₹${offlinePayAmount} recorded for ${offlinePayTenant.name}!`, "success");
        setOfflinePayTenant(null);
        setOfflinePayAmount("");
        setOfflinePayNote("");
        setOfflinePayDate("");
        setOfflinePayPersonName("");
        fetchData();
      } else {
        toast("Failed to record payment.", "error");
      }
    } catch (e) {
      console.error(e);
      toast("An error occurred.", "error");
    } finally {
      setSubmittingOfflinePay(false);
    }
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();

  const paidTenantIds = new Set(
    payments
      .filter(p => {
        if (p.type !== "rent") return false;
        let pDate: Date;
        if (p.payment_date?.seconds) {
          pDate = new Date(p.payment_date.seconds * 1000);
        } else if (p.payment_date?._seconds) {
          pDate = new Date(p.payment_date._seconds * 1000);
        } else {
          pDate = new Date(p.payment_date);
        }
        return !isNaN(pDate.getTime()) && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      })
      .map(p => p.tenantId)
  );

  const activeTenants = tenants.filter(t => t.status === "active");
  const paidCount = activeTenants.filter(t => paidTenantIds.has(t.id)).length;
  const overdueCount = activeTenants.filter(t => !paidTenantIds.has(t.id) && currentDay > t.billing_cycle_day).length;

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

      {/* ── Summary Stats ─────────────────────────────────────────────── */}
      {tenants.length > 0 && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "1.5rem", 
          marginBottom: "2rem" 
        }}>
          <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--primary)", display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 500 }}>Active Tenants</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, marginTop: "0.25rem", color: 'var(--text-main)' }}>{activeTenants.length}</div>
          </div>
          <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--success)", display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 500 }}>Paid (This Month)</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--success)", marginTop: "0.25rem" }}>{paidCount}</div>
          </div>
          <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--danger)", display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 500 }}>Overdue Rent</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--danger)", marginTop: "0.25rem" }}>{overdueCount}</div>
          </div>
        </div>
      )}

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
            {/* Choose Property (only if activePropertyId is "all") */}
            {activePropertyId === "all" && (
              <div className="input-group mb-0">
                <label className="input-label">Select PG Property</label>
                <select 
                  className="input-field" 
                  value={formPropertyId} 
                  onChange={e => setFormPropertyId(e.target.value)}
                  required
                >
                  {Array.from(new Set(availableBeds.map(b => b.propertyId))).map(pId => {
                    const prop = properties.find(p => p.id === pId);
                    return (
                      <option key={pId} value={pId}>
                        {prop?.name || "PG Property"}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Choose Floor */}
            <div className="input-group mb-0">
              <label className="input-label">Select Floor</label>
              <select 
                className="input-field" 
                value={formFloor} 
                onChange={e => setFormFloor(e.target.value)}
                required
              >
                {Array.from(new Set(
                  availableBeds
                    .filter(b => b.propertyId === (activePropertyId !== "all" ? activePropertyId : formPropertyId))
                    .map(b => b.floor || "Ground Floor")
                )).sort().map(floor => (
                  <option key={floor} value={floor}>
                    {floor}
                  </option>
                ))}
              </select>
            </div>

            {/* Choose Room */}
            <div className="input-group mb-0">
              <label className="input-label">Select Room</label>
              <select 
                className="input-field" 
                value={formRoomNumber} 
                onChange={e => setFormRoomNumber(e.target.value)}
                required
              >
                {Array.from(new Set(
                  availableBeds
                    .filter(b => 
                      b.propertyId === (activePropertyId !== "all" ? activePropertyId : formPropertyId) && 
                      (b.floor || "Ground Floor") === formFloor
                    )
                    .map(b => b.roomNumber)
                )).sort((a, b) => a.localeCompare(b)).map(roomNum => (
                  <option key={roomNum} value={roomNum}>
                    Room {roomNum}
                  </option>
                ))}
              </select>
            </div>

            {/* Choose Bed */}
            <div className="input-group mb-0">
              <label className="input-label">Select Bed</label>
              <select 
                className="input-field" 
                value={bedId} 
                onChange={e => setBedId(e.target.value)} 
                required
              >
                {availableBeds
                  .filter(b => 
                    b.propertyId === (activePropertyId !== "all" ? activePropertyId : formPropertyId) && 
                    (b.floor || "Ground Floor") === formFloor && 
                    b.roomNumber === formRoomNumber
                  )
                  .map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bedLabel}
                    </option>
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
              {photoPreview && <img src={photoPreview} alt="Tenant profile photo preview" style={{ marginTop: '0.5rem', height: '60px', width: '60px', objectFit: 'cover', borderRadius: '8px' }} />}
            </div>
            <div className="input-group mb-0" style={{ display: 'flex', flexDirection: 'column', opacity: 0.5 }}>
              <label className="input-label">ID Proof Document (Locked for now)</label>
              <input type="file" accept="image/*,.pdf" disabled className="input-field" onChange={e => {
                const file = e.target?.files?.[0] || null;
                setIdProofFile(file);
                if (file && file.type.startsWith('image/')) setIdProofPreview(URL.createObjectURL(file));
                else setIdProofPreview(null);
              }} style={{ padding: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', cursor: 'not-allowed' }} />
              {idProofPreview && <img src={idProofPreview} alt="Tenant identification proof document preview" style={{ marginTop: '0.5rem', height: '60px', width: '60px', objectFit: 'cover', borderRadius: '8px' }} />}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* ── Search Bar ── */}
          <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>🔍</span>
            <input
              type="text"
              className="input-field"
              style={{ flex: 1, border: 'none', padding: '0.25rem 0.5rem', fontSize: '1.05rem', outline: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}
              placeholder="Search tenants by name or room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: 'var(--text-muted)', 
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="card table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Room / Bed</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Rent</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Rent Status</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants
                .filter(t => {
                  const query = searchQuery.toLowerCase().trim();
                  if (!query) return true;
                  const roomMatch = t.bed?.room?.room_number?.toLowerCase().includes(query);
                  const nameMatch = t.name?.toLowerCase().includes(query);
                  return roomMatch || nameMatch;
                })
                .map(tenant => (
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
                      (() => {
                        const rentStatus = getPaymentStatus(tenant.id, tenant.billing_cycle_day, tenant.rent_amount);
                        return (
                          <span style={{ 
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: rentStatus.isOverdue ? 'rgba(239, 68, 68, 0.1)' : rentStatus.text === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: rentStatus.color
                          }}>
                            {rentStatus.text}
                          </span>
                        );
                      })()
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
                      {tenant.status === 'active' && (
                        <button 
                          onClick={() => {
                            const url = `${window.location.origin}/t/${tenant.id}`;
                            navigator.clipboard.writeText(url);
                            setCopiedTenantId(tenant.id);
                            setTimeout(() => setCopiedTenantId(null), 2000);
                          }} 
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '0.875rem', 
                            backgroundColor: copiedTenantId === tenant.id ? 'var(--success)' : 'var(--primary)', 
                            border: 'none', 
                            color: '#fff', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {copiedTenantId === tenant.id ? "Copied! ✓" : "Copy Link"}
                        </button>
                      )}
                      {tenant.status === 'active' && (
                        <button
                          onClick={() => {
                            setOfflinePayTenant(tenant);
                            setOfflinePayAmount(String(tenant.rent_amount || ""));
                            const d = new Date();
                            const month = String(d.getMonth() + 1).padStart(2, '0');
                            const day = String(d.getDate()).padStart(2, '0');
                            setOfflinePayDate(`${d.getFullYear()}-${month}-${day}`);
                            setOfflinePayPersonName(tenant.name);
                            setOfflinePayNote("");
                          }}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.875rem',
                            backgroundColor: '#10b981',
                            border: 'none',
                            color: '#fff',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          💵 Cash Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

      {/* ── Offline Payment Modal ───────────────────────────────────── */}
      {offlinePayTenant && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--success)' }}>💵 Cash Payment</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{offlinePayTenant.name}</p>
              </div>
              <button onClick={() => setOfflinePayTenant(null)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', lineHeight: 1, color: 'var(--text-muted)' }}>&times;</button>
            </div>
            <form onSubmit={handleOfflinePayment}>
              <div className="input-group">
                <label className="input-label">Amount Paid (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={offlinePayAmount}
                  onChange={e => setOfflinePayAmount(e.target.value)}
                  min="1"
                  required
                  autoFocus
                  placeholder={`Default: ₹${offlinePayTenant.rent_amount}`}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Payment Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={offlinePayDate}
                  onChange={e => setOfflinePayDate(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Paid Person Name (Payer)</label>
                <input
                  type="text"
                  className="input-field"
                  value={offlinePayPersonName}
                  onChange={e => setOfflinePayPersonName(e.target.value)}
                  required
                  placeholder="e.g. Tenant name or parent name"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Note (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  value={offlinePayNote}
                  onChange={e => setOfflinePayNote(e.target.value)}
                  placeholder="e.g. Cash received in person"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setOfflinePayTenant(null)} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, backgroundColor: '#10b981' }} disabled={submittingOfflinePay}>
                  {submittingOfflinePay ? "Saving..." : "✓ Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Change Room Modal ───────────────────────────────────── */}
      {roomChangeTenant && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--primary)' }}>🔄 Change Room</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{roomChangeTenant.name}</p>
              </div>
              <button onClick={() => setRoomChangeTenant(null)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', lineHeight: 1, color: 'var(--text-muted)' }}>&times;</button>
            </div>
            <form onSubmit={handleChangeRoomSubmit}>
              {/* Floor Selector */}
              <div className="input-group">
                <label className="input-label">Select Floor</label>
                <select 
                  className="input-field" 
                  value={changeRoomFloor} 
                  onChange={e => setChangeRoomFloor(e.target.value)}
                  required
                >
                  {Array.from(new Set(availableBeds.filter(b => b.propertyId === (roomChangeTenant.propertyId || selectedFormPropertyId)).map(b => b.floor || "Ground Floor"))).map(floor => (
                    <option key={floor} value={floor}>{floor}</option>
                  ))}
                </select>
              </div>
              
              {/* Room Selector */}
              <div className="input-group">
                <label className="input-label">Select Room</label>
                <select 
                  className="input-field" 
                  value={changeRoomRoomNumber} 
                  onChange={e => setChangeRoomRoomNumber(e.target.value)}
                  required
                >
                  {Array.from(new Set(availableBeds.filter(b => b.propertyId === (roomChangeTenant.propertyId || selectedFormPropertyId) && b.floor === changeRoomFloor).map(b => b.roomNumber))).map(roomNo => (
                    <option key={roomNo} value={roomNo}>Room {roomNo}</option>
                  ))}
                </select>
              </div>

              {/* Bed Selector */}
              <div className="input-group">
                <label className="input-label">Select Bed</label>
                <select 
                  className="input-field" 
                  value={changeRoomBedId} 
                  onChange={e => setChangeRoomBedId(e.target.value)}
                  required
                >
                  {availableBeds.filter(b => b.propertyId === (roomChangeTenant.propertyId || selectedFormPropertyId) && b.floor === changeRoomFloor && b.roomNumber === changeRoomRoomNumber).map(bed => (
                    <option key={bed.id} value={bed.id}>{bed.bedLabel}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setRoomChangeTenant(null)} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={changingRoom || !changeRoomBedId}>
                  {changingRoom ? "Updating..." : "✓ Change Room"}
                </button>
              </div>
            </form>
          </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>{selectedTenant.phone}</span>
                  <a 
                    href={`https://wa.me/${selectedTenant.phone.replace(/\D/g, "").startsWith('91') || selectedTenant.phone.replace(/\D/g, "").length > 10 ? selectedTenant.phone.replace(/\D/g, "") : '91' + selectedTenant.phone.replace(/\D/g, "")}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#25D366',
                      color: '#fff',
                      textDecoration: 'none',
                    }}
                    title="Chat on WhatsApp"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 1.977 14.12 1.95 12.012 1.95c-5.438 0-9.863 4.374-9.867 9.802-.001 1.73.476 3.41 1.378 4.885l-.994 3.633 3.71-.975zm13.11-7.79c-.067-.112-.247-.179-.517-.314-.27-.134-1.597-.787-1.845-.877-.247-.09-.427-.135-.607.135-.179.27-.697.877-.854 1.057-.158.18-.315.202-.585.067-.27-.135-1.14-.42-2.172-1.341-.803-.715-1.345-1.6-1.502-1.87-.158-.27-.017-.417.118-.552.122-.122.27-.315.405-.472.135-.158.18-.27.27-.45.09-.18.045-.337-.022-.472-.068-.135-.608-1.464-.833-2.004-.22-.528-.48-.456-.66-.465-.17-.008-.367-.01-.563-.01-.197 0-.517.074-.787.37-.27.298-1.03 1.007-1.03 2.457s1.057 2.846 1.203 3.049c.146.202 2.08 3.178 5.04 4.456.703.304 1.252.486 1.68.622.709.226 1.353.194 1.863.118.57-.085 1.597-.652 1.823-1.282.225-.63.225-1.17.157-1.282zm0 0"/>
                    </svg>
                  </a>
                </div>
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

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={() => { setEditTenantData(selectedTenant); setEditName(selectedTenant.name); setEditPhone(selectedTenant.phone); setEditRentAmount(selectedTenant.rent_amount?.toString() || ""); setEditBillingCycleDay(selectedTenant.billing_cycle_day?.toString() || "5"); setSelectedTenant(null); }} 
                  style={{ flex: 1, padding: '10px', fontSize: '0.9rem', backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                >
                  ✏️ Edit Details
                </button>
                <button 
                  onClick={() => { handleDeleteTenant(selectedTenant.id, selectedTenant.name); setSelectedTenant(null); }} 
                  disabled={actionLoading === selectedTenant.id}
                  style={{ flex: 1, padding: '10px', fontSize: '0.9rem', backgroundColor: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                >
                  🗑️ Delete
                </button>
              </div>
              {selectedTenant.status === 'active' && (
                <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                  <button 
                    onClick={() => { setRoomChangeTenant(selectedTenant); setSelectedTenant(null); }} 
                    style={{ flex: 1, padding: '10px', fontSize: '0.9rem', backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    🔄 Change Room
                  </button>
                  <button 
                    onClick={() => { handleVacate(selectedTenant.id, selectedTenant.name); setSelectedTenant(null); }} 
                    disabled={actionLoading === selectedTenant.id}
                    style={{ flex: 1, padding: '10px', fontSize: '0.9rem', backgroundColor: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    {actionLoading === selectedTenant.id ? '...' : '🚪 Vacate Room'}
                  </button>
                </div>
              )}
              <button className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setSelectedTenant(null)}>Close</button>
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
