"use client";

import { useState, useEffect } from "react";
import { useProperties } from "@/context/PropertyContext";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

type Tenant = { id: string; name: string; rent_amount: number; propertyId?: string };
type Payment = {
  id: string;
  tenantId?: string;
  type: string;
  amount: number;
  amount_paid: number;
  method: string;
  status: string;
  reference?: string;
  payment_date: any;
  tenant: Tenant | null;
  payer_name?: string;
  propertyId?: string;
  propertyName?: string;
};

export default function PaymentsPage() {
  const { activePropertyId, properties } = useProperties();
  const { toast } = useToast();
  const [selectedFormPropertyId, setSelectedFormPropertyId] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [savingUpi, setSavingUpi] = useState(false);
  const [historyTab, setHistoryTab] = useState<"all" | "online" | "offline">("all");

  // Form state
  const [tenantId, setTenantId] = useState("");
  const [type, setType] = useState("rent");
  const [amount, setAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [method, setMethod] = useState("UPI");
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (activePropertyId && activePropertyId !== "all") {
      setSelectedFormPropertyId(activePropertyId);
    } else if (properties.length > 0) {
      setSelectedFormPropertyId(properties[0].id);
    }
  }, [activePropertyId, properties]);

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

  const fetchData = async () => {
    try {
      const queryParam = activePropertyId ? `?propertyId=${activePropertyId}` : "";
      const [payRes, tenRes, upiRes] = await Promise.all([
        fetch(`/api/payments${queryParam}`),
        fetch(`/api/tenants${queryParam}`),
        fetch(`/api/property/upi${queryParam}`)
      ]);
      
      if (payRes.ok) setPayments(await payRes.json());
      if (upiRes.ok) {
        const uData = await upiRes.json();
        setUpiId(uData.upi_id || "");
      }
      if (tenRes.ok) {
        const tData = await tenRes.json();
        setTenants(tData);
        if (tData.length > 0) {
          setTenantId(tData[0].id);
          setAmount(tData[0].rent_amount.toString());
          setAmountPaid(tData[0].rent_amount.toString());
          if (tData[0].propertyId) {
            setSelectedFormPropertyId(tData[0].propertyId);
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

  const handleConfirmPending = async (paymentId: string, propertyId: string) => {
    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status: "completed", propertyId })
      });
      if (res.ok) {
        toast("Payment confirmed successfully! Receipt is now visible to tenant.", "success");
        fetchData();
      } else {
        toast("Failed to confirm payment.", "error");
      }
    } catch (e) {
      console.error(e);
      toast("Error confirming payment.", "error");
    }
  };

  const handleTenantChange = (id: string) => {
    setTenantId(id);
    const tenant = tenants.find(t => t.id === id);
    if (tenant) {
      if (type === "rent") {
        setAmount(tenant.rent_amount.toString());
        setAmountPaid(tenant.rent_amount.toString());
      }
      if (tenant.propertyId) {
        setSelectedFormPropertyId(tenant.propertyId);
      }
    }
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant && newType === "rent") {
      setAmount(tenant.rent_amount.toString());
      setAmountPaid(tenant.rent_amount.toString());
    } else {
      setAmount("");
      setAmountPaid("");
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tenantId, 
          type, 
          amount, 
          amount_paid: amountPaid, 
          method,
          propertyId: selectedFormPropertyId
        })
      });
      if (res.ok) {
        setShowAddForm(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUpi(true);
    try {
      const res = await fetch("/api/property/upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upi_id: upiId, propertyId: selectedFormPropertyId })
      });
      if (res.ok) {
        toast("UPI ID saved successfully!", "success");
      } else {
        toast("Failed to save UPI ID.", "error");
      }
    } catch (e) {
      console.error(e);
      toast("Error saving UPI ID.", "error");
    } finally {
      setSavingUpi(false);
    }
  };

  // Calculate summary
  const currentMonthPayments = payments.filter(p => {
    if (!p.payment_date) return false;
    let pDate: Date;
    if (typeof p.payment_date === "object") {
      if (typeof p.payment_date.seconds === "number") {
        pDate = new Date(p.payment_date.seconds * 1000);
      } else if (typeof p.payment_date._seconds === "number") {
        pDate = new Date(p.payment_date._seconds * 1000);
      } else {
        pDate = new Date(p.payment_date);
      }
    } else {
      pDate = new Date(p.payment_date);
    }
    if (isNaN(pDate.getTime())) return false;
    const today = new Date();
    return pDate.getMonth() === today.getMonth() && pDate.getFullYear() === today.getFullYear();
  });

  const totalExpectedRent = tenants.reduce((acc, t) => acc + (t.rent_amount || 0), 0);
  const totalCollectedThisMonth = currentMonthPayments.reduce((acc, p) => acc + (p.amount_paid || 0), 0);
  const totalDueThisMonth = Math.max(0, totalExpectedRent - totalCollectedThisMonth);

  const exportCSV = () => {
    const headers = ["Date", "Tenant", "Type", "Amount", "Amount Paid", "Method", "Status"];
    const rows = payments.map((p) => [
      formatDate(p.payment_date),
      p.tenant?.name || "",
      p.type,
      p.amount,
      p.amount_paid,
      p.method,
      p.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map(String).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-receipt, #print-receipt * {
            visibility: visible;
          }
          #print-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
      <div className="flex justify-between items-center mb-8" style={{ flexWrap: "wrap", gap: "1rem" }}>
        <h1>Payments</h1>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={exportCSV}
            style={{ padding: "0.6rem 1.1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", backgroundColor: "var(--surface-color)", color: "var(--text-main)", fontWeight: 500, cursor: "pointer", fontSize: "0.875rem" }}
          >
            ⬇ Export CSV
          </button>
          <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Record Payment"}
          </button>
        </div>
      </div>

      <div className="card mb-8 animate-fade-in" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', borderLeft: '4px solid var(--primary)' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📱 Set Up UPI Payments
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Enter your UPI ID below. When tenants click "Pay Online" in their portal, it will automatically open their Google Pay / PhonePe with your UPI ID and the rent amount pre-filled.
        </p>
        <form onSubmit={handleSaveUpi} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ marginBottom: 0, flex: 1, minWidth: '250px' }}>
            <label className="input-label">Your UPI ID (e.g. 9876543210@ybl, name@oksbi)</label>
            <input 
              type="text" 
              className="input-field" 
              value={upiId} 
              onChange={e => setUpiId(e.target.value)} 
              placeholder="Enter UPI ID to enable intent payments"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={savingUpi} style={{ height: '46px' }}>
            {savingUpi ? "Saving..." : "Save UPI ID"}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase' }}>Collected This Month</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--success)' }}>
            ₹{totalCollectedThisMonth.toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ borderLeft: totalDueThisMonth > 0 ? '4px solid var(--danger)' : '4px solid var(--text-main)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase' }}>Due This Month</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0', color: totalDueThisMonth > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
            ₹{totalDueThisMonth.toLocaleString()}
          </div>
        </div>
      </div>

      {receiptPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div id="print-receipt" className="card" style={{ width: '400px', backgroundColor: '#fff', color: '#000', padding: '2rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>PGmate Receipt</h2>
            <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <p><strong>Receipt ID:</strong> {receiptPayment.id.substring(0, 8).toUpperCase()}</p>
              <p><strong>Date:</strong> {formatDate(receiptPayment.payment_date)}</p>
              <p><strong>Tenant:</strong> {receiptPayment.tenant?.name}</p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Payment Type:</strong> <span style={{ textTransform: 'capitalize' }}>{receiptPayment.type}</span></p>
              <p><strong>Amount Paid:</strong> ₹{receiptPayment.amount_paid}</p>
              <p><strong>Method:</strong> {receiptPayment.method}</p>
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: '#666' }}>
              <p>Thank you for your payment!</p>
            </div>
            <div className="flex justify-between" style={{ marginTop: '2rem' }}>
              <button className="btn-secondary no-print" onClick={() => setReceiptPayment(null)}>Close</button>
              <button className="btn-primary no-print" onClick={() => window.print()}>Print Receipt</button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="card mb-8 animate-fade-in">
          <h3>Record New Payment</h3>
          <form onSubmit={handleAddPayment} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="input-group mb-0">
              <label className="input-label">Tenant</label>
              <select className="input-field" value={tenantId} onChange={e => handleTenantChange(e.target.value)} required>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Payment Type</label>
              <select className="input-field" value={type} onChange={e => handleTypeChange(e.target.value)} required>
                <option value="rent">Rent</option>
                <option value="deposit">Security Deposit</option>
                <option value="refund">Refund</option>
              </select>
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Expected Amount (₹)</label>
              <input type="number" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Amount Paid (₹)</label>
              <input type="number" className="input-field" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} required />
            </div>
            <div className="input-group mb-0">
              <label className="input-label">Payment Method</label>
              <select className="input-field" value={method} onChange={e => setMethod(e.target.value)} required>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="flex items-center" style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn-primary w-full">Save Payment</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading payments...</p>
      ) : payments.length === 0 ? (
        <div className="card text-center animate-fade-in" style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(0,196,159,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No payments yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            When you record rent collections or security deposits, they will appear here.
          </p>
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            Record First Payment
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* ── History Tabs ────────────────────────────────────────── */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
            {(["all", "online", "offline"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setHistoryTab(tab)}
                style={{
                  padding: '0.85rem 1.5rem',
                  border: 'none',
                  borderBottom: historyTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color: historyTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: historyTab === tab ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {tab === 'all' && '📋 All'}
                {tab === 'online' && '📱 Online'}
                {tab === 'offline' && '💵 Offline / Cash'}
                <span style={{
                  backgroundColor: historyTab === tab ? 'var(--primary)' : 'var(--border-color)',
                  color: historyTab === tab ? '#fff' : 'var(--text-muted)',
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {tab === 'all'
                    ? payments.length
                    : tab === 'online'
                    ? payments.filter(p => p.method !== 'Cash').length
                    : payments.filter(p => p.method === 'Cash').length}
                </span>
              </button>
            ))}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Tenant</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Method</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments
                .filter(p => {
                  if (historyTab === 'online') return p.method !== 'Cash';
                  if (historyTab === 'offline') return p.method === 'Cash';
                  return true;
                })
                .map(payment => (
                <tr key={payment.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    {formatDate(payment.payment_date)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{payment.tenant?.name || "Unknown"}</div>
                    {payment.payer_name && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Payer: {payment.payer_name}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                    {payment.type}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>₹{payment.amount_paid}</div>
                    {payment.amount_paid < payment.amount && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>
                        ₹{payment.amount - payment.amount_paid} due
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ textTransform: 'capitalize' }}>{payment.method}</div>
                    {payment.reference && (
                      <div style={{ marginTop: '0.5rem' }}>
                        {payment.reference.startsWith('http') ? (
                          <a href={payment.reference} target="_blank" rel="noopener noreferrer" title="Click to view full screenshot">
                            <img 
                              src={payment.reference} 
                              alt="Payment proof screenshot uploaded by tenant" 
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                            />
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Ref: {payment.reference}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 500,
                      backgroundColor: (payment.status === 'paid' || payment.status === 'completed') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: (payment.status === 'paid' || payment.status === 'completed') ? 'var(--success)' : 'var(--warning)'
                    }}>
                      {(payment.status === 'paid' || payment.status === 'completed') ? 'PAID' : (payment.status?.toUpperCase() ?? '-')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {payment.status === 'pending' && (
                        <button 
                          onClick={() => handleConfirmPending(payment.id, payment.propertyId || "")}
                          style={{ padding: '6px 12px', fontSize: '0.875rem', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', cursor: 'pointer', border: 'none', fontWeight: 600 }}
                        >
                          Confirm
                        </button>
                      )}
                      {(payment.status === 'paid' || payment.status === 'completed') && (
                        <button 
                          onClick={() => setReceiptPayment(payment)}
                          style={{ padding: '6px 12px', fontSize: '0.875rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '6px', cursor: 'pointer', border: 'none' }}
                        >
                          Receipt
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
