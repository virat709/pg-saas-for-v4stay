"use client";

interface ProfitLossData {
  month: string;
  collections: number;
  expenses: number;
}

interface ProfitLossChartProps {
  data: ProfitLossData[];
}

export default function ProfitLossChart({ data }: ProfitLossChartProps) {
  if (!data || data.length === 0) return null;

  const totalCollections = data.reduce((acc, d) => acc + d.collections, 0);
  const totalExpenses = data.reduce((acc, d) => acc + d.expenses, 0);
  const netProfit = totalCollections - totalExpenses;
  const margin = totalCollections > 0 ? Math.round((netProfit / totalCollections) * 100) : 0;

  const maxVal = Math.max(...data.map((d) => Math.max(d.collections, d.expenses)), 1000);
  const chartHeight = 170;
  const barGroupWidth = 48;
  const singleBarWidth = 18;
  const gap = 16;
  const totalWidth = data.length * (barGroupWidth + gap) + 40;

  return (
    <div className="card" style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.25rem", fontSize: "1.25rem" }}>📈 Monthly Profit & Loss Breakdown</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>
            Side-by-side comparison of monthly collections (income) vs expenses (cost)
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <span style={{ width: "10px", height: "10px", backgroundColor: "#10b981", borderRadius: "2px", display: "inline-block" }} />
            Collections
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <span style={{ width: "10px", height: "10px", backgroundColor: "#ef4444", borderRadius: "2px", display: "inline-block" }} />
            Expenses
          </div>
          <div style={{
            backgroundColor: netProfit >= 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            color: netProfit >= 0 ? "#10b981" : "#ef4444",
            padding: "4px 12px",
            borderRadius: "99px",
            fontSize: "0.8rem",
            fontWeight: 700
          }}>
            Net: {netProfit >= 0 ? "+" : ""}₹{netProfit.toLocaleString("en-IN")} ({margin}%)
          </div>
        </div>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: "0.5rem" }}>
        <svg
          width={Math.max(totalWidth, 320)}
          height={chartHeight + 60}
          viewBox={`0 0 ${Math.max(totalWidth, 320)} ${chartHeight + 60}`}
          style={{ display: "block" }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartHeight - ratio * chartHeight;
            return (
              <g key={ratio}>
                <line x1={0} y1={y} x2={Math.max(totalWidth, 320)} y2={y} stroke="var(--border-color)" strokeWidth={1} />
                <text x={0} y={y - 4} fontSize="9" fill="var(--text-muted)" textAnchor="start">
                  ₹{Math.round((maxVal * ratio) / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Dual Bars */}
          {data.map((d, i) => {
            const x = i * (barGroupWidth + gap) + 35;
            const collectionHeight = Math.max((d.collections / maxVal) * chartHeight, d.collections > 0 ? 4 : 0);
            const expenseHeight = Math.max((d.expenses / maxVal) * chartHeight, d.expenses > 0 ? 4 : 0);

            const colY = chartHeight - collectionHeight;
            const expY = chartHeight - expenseHeight;

            const profit = d.collections - d.expenses;

            return (
              <g key={d.month}>
                {/* Collection Bar (Green) */}
                <rect x={x} y={colY} width={singleBarWidth} height={collectionHeight} rx={4} ry={4} fill="#10b981" />
                <title>{d.month} Collection: ₹{d.collections.toLocaleString("en-IN")}</title>

                {/* Expense Bar (Red) */}
                <rect x={x + singleBarWidth + 4} y={expY} width={singleBarWidth} height={expenseHeight} rx={4} ry={4} fill="#ef4444" />
                <title>{d.month} Expense: ₹{d.expenses.toLocaleString("en-IN")}</title>

                {/* Month label */}
                <text x={x + barGroupWidth / 2} y={chartHeight + 20} fontSize="10" fill="var(--text-muted)" textAnchor="middle">
                  {d.month}
                </text>

                {/* Net Profit Tag */}
                <text
                  x={x + barGroupWidth / 2}
                  y={Math.min(colY, expY) - 6}
                  fontSize="8.5"
                  fontWeight="700"
                  fill={profit >= 0 ? "#10b981" : "#ef4444"}
                  textAnchor="middle"
                >
                  {profit >= 0 ? `+${Math.round(profit / 1000)}k` : `${Math.round(profit / 1000)}k`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
