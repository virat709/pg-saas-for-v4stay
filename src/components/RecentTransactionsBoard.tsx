"use client";

interface PaymentItem {
  id: string;
  tenantName?: string;
  propertyName?: string;
  amount_paid: number;
  method: string;
  payment_date?: any;
  status: string;
}

interface RecentTransactionsBoardProps {
  payments: PaymentItem[];
}

export default function RecentTransactionsBoard({ payments }: RecentTransactionsBoardProps) {
  const recentList = (payments || []).slice(0, 5);

  return (
    <div className="card" style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.25rem", fontSize: "1.25rem" }}>⚡ Recent Payment Activity</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>
            Live record of rent collection transactions
          </p>
        </div>
      </div>

      {recentList.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem 0", fontSize: "0.875rem" }}>
          No payment transactions recorded yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {recentList.map((p) => {
            let dateStr = "Recent";
            if (p.payment_date) {
              const d = typeof p.payment_date === "object" && p.payment_date.seconds
                ? new Date(p.payment_date.seconds * 1000)
                : new Date(p.payment_date);
              if (!isNaN(d.getTime())) {
                dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
              }
            }

            const methodUpper = (p.method || "cash").toUpperCase();
            const isUPI = methodUpper.includes("UPI");

            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  justify: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  backgroundColor: "var(--bg-color)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)"
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-main)" }}>
                    {p.tenantName || "Tenant"}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {p.propertyName || "My PG"} · {dateStr}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--success)" }}>
                    +₹{(p.amount_paid || 0).toLocaleString("en-IN")}
                  </div>
                  <span style={{
                    display: "inline-block",
                    fontSize: "0.7rem",
                    padding: "2px 8px",
                    borderRadius: "99px",
                    fontWeight: 600,
                    marginTop: "2px",
                    backgroundColor: isUPI ? "rgba(59, 130, 246, 0.12)" : "rgba(16, 185, 129, 0.12)",
                    color: isUPI ? "#3b82f6" : "#10b981"
                  }}>
                    {methodUpper}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
