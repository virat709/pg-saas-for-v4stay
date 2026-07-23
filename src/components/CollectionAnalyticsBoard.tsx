"use client";

interface CollectionAnalyticsBoardProps {
  collectedAmount: number;
  expectedCollection: number;
  paymentMethods: {
    upi: number;
    cash: number;
    bank: number;
    other: number;
  };
}

export default function CollectionAnalyticsBoard({
  collectedAmount,
  expectedCollection,
  paymentMethods,
}: CollectionAnalyticsBoardProps) {
  const pendingAmount = Math.max(0, expectedCollection - collectedAmount);
  const collectionRate = expectedCollection > 0
    ? Math.min(100, Math.round((collectedAmount / expectedCollection) * 100))
    : 0;

  const totalMethodAmount = paymentMethods.upi + paymentMethods.cash + paymentMethods.bank + paymentMethods.other;
  const upiPercent = totalMethodAmount > 0 ? Math.round((paymentMethods.upi / totalMethodAmount) * 100) : 0;
  const cashPercent = totalMethodAmount > 0 ? Math.round((paymentMethods.cash / totalMethodAmount) * 100) : 0;

  return (
    <div className="card" style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.25rem", fontSize: "1.25rem" }}>📊 Financial Collection Analytics</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>
            Real-time monthly rent collection & payment channel analysis
          </p>
        </div>
        <div style={{
          backgroundColor: collectionRate >= 80 ? "rgba(34, 197, 94, 0.15)" : collectionRate >= 50 ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
          color: collectionRate >= 80 ? "var(--success)" : collectionRate >= 50 ? "#f59e0b" : "var(--danger)",
          padding: "4px 12px",
          borderRadius: "99px",
          fontSize: "0.8rem",
          fontWeight: 700
        }}>
          {collectionRate}% Collected
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: 600 }}>
          <span>Collected: ₹{collectedAmount.toLocaleString("en-IN")}</span>
          <span style={{ color: "var(--text-muted)" }}>Target: ₹{expectedCollection.toLocaleString("en-IN")}</span>
        </div>
        <div style={{
          width: "100%",
          height: "12px",
          backgroundColor: "var(--border-color)",
          borderRadius: "99px",
          overflow: "hidden"
        }}>
          <div style={{
            width: `${collectionRate}%`,
            height: "100%",
            background: "linear-gradient(90deg, var(--primary) 0%, var(--success) 100%)",
            borderRadius: "99px",
            transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          }} />
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <div style={{ padding: "1rem", backgroundColor: "rgba(34, 197, 94, 0.08)", borderRadius: "8px", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Received Revenue</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--success)", marginTop: "0.25rem" }}>
            ₹{collectedAmount.toLocaleString("en-IN")}
          </div>
        </div>

        <div style={{ padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.08)", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Pending Dues</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--danger)", marginTop: "0.25rem" }}>
            ₹{pendingAmount.toLocaleString("en-IN")}
          </div>
        </div>

        <div style={{ padding: "1rem", backgroundColor: "rgba(30, 96, 145, 0.08)", borderRadius: "8px", border: "1px solid rgba(30, 96, 145, 0.2)" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Expected Total</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)", marginTop: "0.25rem" }}>
            ₹{expectedCollection.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Payment Method Distribution */}
      <div>
        <h4 style={{ fontSize: "0.875rem", marginBottom: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Payment Method Distribution
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
              <span>📱 UPI Payments</span>
              <strong>₹{paymentMethods.upi.toLocaleString("en-IN")} ({upiPercent}%)</strong>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${upiPercent}%`, height: "100%", backgroundColor: "#3b82f6", borderRadius: "4px" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
              <span>💵 Cash Payments</span>
              <strong>₹{paymentMethods.cash.toLocaleString("en-IN")} ({cashPercent}%)</strong>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${cashPercent}%`, height: "100%", backgroundColor: "#10b981", borderRadius: "4px" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
              <span>🏦 Bank Transfers / Other</span>
              <strong>₹{(paymentMethods.bank + paymentMethods.other).toLocaleString("en-IN")} ({Math.max(0, 100 - upiPercent - cashPercent)}%)</strong>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${Math.max(0, 100 - upiPercent - cashPercent)}%`, height: "100%", backgroundColor: "#8b5cf6", borderRadius: "4px" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
