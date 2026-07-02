"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";
import { useToast } from "@/context/ToastContext";

export default function TenantPortal() {
  const params = useParams();
  const tenantId = params.id as string;
  const { toast } = useToast();

  const [tenant, setTenant] = useState<any>(null);
  const [vacated, setVacated] = useState(false);
  const [menu, setMenu] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<any[]>([]);
  
  const [category, setCategory] = useState("wifi");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

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

  const getDaysLeft = (billingDay: number | string) => {
    if (!billingDay) return 0;
    const day = parseInt(billingDay.toString());
    const today = new Date();
    const currentDay = today.getDate();
    
    if (currentDay <= day) {
      return day - currentDay;
    } else {
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      return (daysInMonth - currentDay) + day;
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/t/${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setTenant(data);
        if (!paymentAmount) setPaymentAmount(data.rent_amount?.toString() || "");
      } else if (res.status === 403) {
        // Vacated — permanently block portal access
        setVacated(true);
        setTenant(null);
      } else {
        setTenant(null);
      }

      const menuRes = await fetch(`/api/t/${tenantId}/menu`);
      if (menuRes.ok) {
        setMenu(await menuRes.json());
      }

      const noticesRes = await fetch(`/api/t/${tenantId}/notices`);
      if (noticesRes.ok) {
        setNotices(await noticesRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Poll specifically for notices every 10 seconds to ensure immediate updates
    const noticeInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/t/${tenantId}/notices`);
        if (res.ok) {
          setNotices(await res.json());
        }
      } catch (e) {
        console.error("Notice polling failed:", e);
      }
    }, 10000);

    return () => clearInterval(noticeInterval);
  }, [tenantId]);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/t/${tenantId}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, description })
      });
      if (res.ok) {
        toast("Complaint submitted successfully!", "success");
        setDescription("");
        fetchData();
      } else {
        toast("Failed to submit complaint.", "error");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) {
      toast("Please enter a valid amount.", "warning");
      return;
    }

    setProcessingPayment(true);

    try {
      const res = await fetch(`/api/t/${tenantId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: paymentAmount, 
          method: "UPI", 
          reference: utrNumber || "Online UPI payment" 
        })
      });

      if (res.ok) {
        toast("Payment confirmation submitted to owner!", "success");
        setUtrNumber("");
        fetchData();
      } else {
        toast("Failed to submit payment confirmation. Please try again.", "error");
      }
    } catch (e) {
      console.error(e);
      toast("An error occurred during submission.", "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading portal...</div>
    </div>
  );

  if (vacated) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ color: 'var(--danger)', marginBottom: '0.75rem', fontSize: '1.5rem' }}>Account Deactivated</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          This tenant portal has been permanently closed by the property owner.
          Your access has been revoked.
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Please contact your PG owner directly for any queries.
        </p>
      </div>
    </div>
  );

  if (!tenant) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ textAlign: 'center', color: 'var(--danger)' }}>Tenant not found or unauthorized access.</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem', paddingBottom: '4rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <NotificationBell role="tenant" tenantId={tenantId} />
        </div>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{tenant.property?.name || "PG Dashboard"}</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome, {tenant.name}</p>
        {menu && (
          <button 
            onClick={() => setShowMenu(true)} 
            className="btn-primary" 
            style={{ marginTop: '1rem', backgroundColor: 'var(--surface-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            🍽️ View Weekly Menu
          </button>
        )}
      </header>

      <div className="card mb-8">
        <h3>My Stay</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Name</div>
            <div style={{ fontWeight: 500 }}>{tenant.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Room / Bed</div>
            <div style={{ fontWeight: 500 }}>
              {tenant.bed ? `Room ${tenant.bed.room?.room_number ?? '?'} - ${tenant.bed.bed_label}` : 'Unassigned'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Monthly Rent</div>
            <div style={{ fontWeight: 500 }}>₹{tenant.rent_amount}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Billing Date</div>
            <div style={{ fontWeight: 500 }}>{tenant.billing_cycle_day}th of every month</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Days Left</div>
            <div style={{ fontWeight: 500, color: tenant.status === 'active' && getDaysLeft(tenant.billing_cycle_day) <= 5 ? 'var(--danger)' : 'inherit' }}>
              {tenant.status === 'active' ? `${getDaysLeft(tenant.billing_cycle_day)} days` : '-'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status</div>
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
          </div>
        </div>
      </div>

      {notices.length > 0 && (
        <div className="card mb-8 animate-fade-in">
          <h3>Notice Board 📢</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {notices.map((notice) => (
              <div key={notice.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.1rem' }}>{notice.title}</h4>
                  {notice.priority === 'high' && (
                    <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '2px 6px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600 }}>
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Posted on: {formatDate(notice.created_at)}</div>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card mb-8">
        <h3>Make a Payment</h3>

        {tenant?.property?.upi_id ? (
          <>
            {/* ── UPI QR Code ─────────────────────────────────────── */}
            <div style={{ marginTop: '1rem', marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 500 }}>
                📷 Scan QR to Pay Directly
              </p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=10&data=${encodeURIComponent(`upi://pay?pa=${tenant.property.upi_id}&pn=${encodeURIComponent(tenant.property.name || 'PG Owner')}&am=${paymentAmount || tenant.rent_amount}&cu=INR`)}`}
                alt="UPI QR Code for rent payment"
                style={{ width: '180px', height: '180px', borderRadius: '8px', display: 'block', margin: '0 auto' }}
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
                UPI: <strong style={{ color: 'var(--primary)' }}>{tenant.property.upi_id}</strong>
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Open any UPI app → Scan → Pay ₹{paymentAmount || tenant.rent_amount}
              </p>
            </div>

            <form onSubmit={handleMakePayment}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Confirm Your Payment
              </p>
              <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                <label className="input-label">Amount Paid (₹)</label>
                <input type="number" className="input-field" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} required min="1" placeholder="Enter amount paid" />
              </div>
              <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                <label className="input-label">Transaction ID / UTR / Reference (Required)</label>
                <input type="text" className="input-field" value={utrNumber} onChange={e => setUtrNumber(e.target.value)} required placeholder="e.g. UTR 2345678901 or UPI Ref" />
              </div>
              <div className="input-group" style={{ marginBottom: '1.25rem', opacity: 0.6 }}>
                <label className="input-label">📸 Upload Screenshot (Locked)</label>
                <input type="text" className="input-field" disabled value="Coming Soon" style={{ cursor: 'not-allowed', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }} />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={processingPayment} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                {processingPayment ? "Submitting..." : "Submit Payment Details"}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleMakePayment}>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', fontWeight: 500 }}>
              Submit your payment details:
            </p>
            <div className="input-group">
              <label className="input-label">Amount Paid (₹)</label>
              <input type="number" className="input-field" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} required min="1" placeholder="Enter amount paid" />
            </div>
            <div className="input-group">
              <label className="input-label">Transaction ID / UTR / Reference (Required)</label>
              <input type="text" className="input-field" value={utrNumber} onChange={e => setUtrNumber(e.target.value)} required placeholder="e.g. UTR 2345678901 or UPI Ref" />
            </div>
            <div className="input-group" style={{ opacity: 0.6 }}>
              <label className="input-label">📸 Upload Screenshot (Locked)</label>
              <input type="text" className="input-field" disabled value="Coming Soon" style={{ cursor: 'not-allowed', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={processingPayment} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              {processingPayment ? "Submitting..." : "Submit Payment Details"}
            </button>
          </form>
        )}
      </div>

      <div className="card mb-8">
        <h3>Raise a Complaint</h3>
        <form onSubmit={handleSubmitComplaint} style={{ marginTop: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Category</label>
            <select className="input-field" value={category} onChange={e => setCategory(e.target.value)} required>
              <option value="wifi" style={{ color: '#000' }}>WiFi / Internet</option>
              <option value="plumbing" style={{ color: '#000' }}>Plumbing / Water</option>
              <option value="electrical" style={{ color: '#000' }}>Electrical / Appliances</option>
              <option value="cleaning" style={{ color: '#000' }}>Housekeeping / Cleaning</option>
              <option value="other" style={{ color: '#000' }}>Other</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea 
              className="input-field" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
              rows={3} 
              placeholder="Describe the issue in detail..."
            ></textarea>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      {showMenu && menu && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--primary)' }}>This Week&apos;s Menu</h2>
              <button onClick={() => setShowMenu(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', lineHeight: 1, color: 'var(--text-muted)' }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => {
                if (!menu[day] || (!menu[day].breakfast && !menu[day].lunch && !menu[day].dinner)) return null;
                
                const isToday = new Date().getDay() === (["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(day));

                return (
                  <div key={day} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', borderLeft: isToday ? '4px solid #facc15' : '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <strong style={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {day}
                        {isToday && <span style={{ backgroundColor: '#facc15', color: '#854d0e', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>TODAY</span>}
                      </strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 500 }}>☀️ Breakfast</div>
                        <div style={{ whiteSpace: 'pre-line' }}>{menu[day].breakfast || '-'}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 500 }}>🍱 Lunch</div>
                        <div style={{ whiteSpace: 'pre-line' }}>{menu[day].lunch || '-'}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 500 }}>🌙 Dinner</div>
                        <div style={{ whiteSpace: 'pre-line' }}>{menu[day].dinner || '-'}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setShowMenu(false)}>Close Menu</button>
          </div>
        </div>
      )}

      {tenant.payments && tenant.payments.length > 0 && (
        <div className="card mb-8">
          <h3>My Payments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {tenant.payments.map((pay: any) => (
              <div key={pay.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>₹{pay.amount}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: '0.25rem' }}>
                    {pay.method || 'Cash'} • {formatDate(pay.payment_date)}
                  </div>
                  {pay.reference && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                      {pay.reference.startsWith('http') ? (
                        <a href={pay.reference} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>🔗 View Proof</a>
                      ) : (
                        <span>Ref: {pay.reference}</span>
                      )}
                    </div>
                  )}
                  {(pay.status === 'completed' || pay.status === 'paid') && (
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      <a 
                        href={`/payments/receipt/${pay.id}?tenantId=${tenantId}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: '#00c49f', textDecoration: 'underline', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        📄 View Receipt
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '4px 8px', 
                    borderRadius: '12px',
                    backgroundColor: (pay.status === 'completed' || pay.status === 'paid') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: (pay.status === 'completed' || pay.status === 'paid') ? 'var(--success)' : 'var(--warning)'
                  }}>
                    {(pay.status === 'completed' || pay.status === 'paid') ? 'PAID' : (pay.status?.toUpperCase() || 'PENDING')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tenant.maintenanceRequests && tenant.maintenanceRequests.length > 0 && (
        <div className="card">
          <h3>My Complaints</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {tenant.maintenanceRequests.map((req: any) => (
              <div key={req.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ textTransform: 'capitalize' }}>{req.category}</strong>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    backgroundColor: req.status === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: req.status === 'resolved' ? 'var(--success)' : 'var(--warning)'
                  }}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{req.description}</p>
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
                  Submitted: {formatDate(req.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
