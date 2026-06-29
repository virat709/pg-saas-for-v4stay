"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";

interface ReceiptData {
  id: string;
  tenantId: string;
  type: string;
  amount: number;
  amount_paid: number;
  method: string;
  payment_date: any;
  status: string;
  tenant: {
    name: string;
    phone: string;
    room?: { name?: string };
  } | null;
  property?: {
    name: string;
    address?: string;
  };
}

function formatDate(val: any): string {
  if (!val) return "—";
  if (typeof val === "object" && val.seconds) return new Date(val.seconds * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  if (typeof val === "object" && val._seconds) return new Date(val._seconds * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function receiptNumber(id: string): string {
  return "RCP-" + id.slice(-8).toUpperCase();
}

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUrl = tenantId
      ? `/api/payments/receipt/${id}?tenantId=${tenantId}`
      : `/api/payments/receipt/${id}`;
    
    fetch(fetchUrl)
      .then((r) => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, tenantId]);


  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading receipt...</div>;
  if (error || !data) return <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>Receipt not found or you do not have permission to view it.</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "2rem", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      {/* Print Button — hidden on print */}
      <div className="no-print" style={{ maxWidth: "700px", margin: "0 auto 1.5rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: "0.6rem 1.4rem",
            backgroundColor: "#1e6091",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          🖨 Print / Save PDF
        </button>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: "0.6rem 1.4rem",
            backgroundColor: "#e2e8f0",
            color: "#0f172a",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          ← Back
        </button>
      </div>

      {/* ── Receipt Document ─────────────────────────── */}
      <div
        id="receipt-document"
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div style={{ backgroundColor: "#0f172a", padding: "2rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#00c49f", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.5px" }}>PGmate</div>
            <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.2rem" }}>by v4stay</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Payment Receipt</div>
            <div style={{ color: "#f8fafc", fontSize: "1.1rem", fontWeight: 700, marginTop: "0.25rem", fontFamily: "monospace" }}>
              {receiptNumber(data.id)}
            </div>
          </div>
        </div>

        <div style={{ padding: "2.5rem" }}>
          {/* Property & Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
            <div>
              <p style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.4rem" }}>Property</p>
              <p style={{ color: "#0f172a", fontWeight: 700, fontSize: "1.05rem", margin: 0 }}>
                {data.property?.name || "—"}
              </p>
              {data.property?.address && (
                <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0.2rem 0 0" }}>{data.property.address}</p>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.4rem" }}>Payment Date</p>
              <p style={{ color: "#0f172a", fontWeight: 700, fontSize: "1.05rem", margin: 0 }}>{formatDate(data.payment_date)}</p>
            </div>
          </div>

          {/* Divider */}
          <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginBottom: "2rem" }} />

          {/* Tenant Details */}
          <div style={{ marginBottom: "2rem" }}>
            <p style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.4rem" }}>Received From</p>
            <p style={{ color: "#0f172a", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>{data.tenant?.name || "—"}</p>
            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0.2rem 0 0" }}>
              {data.tenant?.phone && `📞 ${data.tenant.phone}`}
              {data.tenant?.room?.name && ` · Room: ${data.tenant.room.name}`}
            </p>
          </div>

          {/* Payment Table */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "10px", overflow: "hidden", marginBottom: "2rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#e2e8f0" }}>
                  <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase" }}>Description</th>
                  <th style={{ padding: "0.75rem 1.25rem", textAlign: "right", color: "#64748b", fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "1rem 1.25rem", color: "#0f172a", textTransform: "capitalize" }}>
                    {data.type || "Rent"} Payment
                  </td>
                  <td style={{ padding: "1rem 1.25rem", textAlign: "right", color: "#0f172a", fontWeight: 600 }}>
                    ₹{data.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid #e2e8f0", backgroundColor: "#f1f5f9" }}>
                  <td style={{ padding: "1rem 1.25rem", fontWeight: 700, color: "#0f172a" }}>Amount Paid</td>
                  <td style={{ padding: "1rem 1.25rem", textAlign: "right", fontWeight: 800, color: "#1e6091", fontSize: "1.15rem" }}>
                    ₹{data.amount_paid.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Method & Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span style={{ color: "#64748b", fontSize: "0.875rem" }}>Payment via </span>
              <span style={{ color: "#0f172a", fontWeight: 600, textTransform: "capitalize", fontSize: "0.875rem" }}>{data.method}</span>
            </div>
            <span
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "99px",
                fontSize: "0.8rem",
                fontWeight: 700,
                backgroundColor: data.status === "paid" ? "#dcfce7" : "#fef9c3",
                color: data.status === "paid" ? "#15803d" : "#a16207",
              }}
            >
              {data.status === "paid" ? "✓ Paid" : "◑ Partial Payment"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "1.25rem 2.5rem", textAlign: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: 0 }}>
            This is a computer-generated receipt and does not require a signature. · PGmate (v4stay) · v4services.in@gmail.com
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #receipt-document { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}
