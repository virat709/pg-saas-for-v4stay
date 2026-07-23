"use client";

interface MonthlyData {
  month: string;
  collections: number;
}

interface MonthlyCollectionsChartProps {
  data: MonthlyData[];
}

export default function MonthlyCollectionsChart({ data }: MonthlyCollectionsChartProps) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.collections), 1000);
  const chartHeight = 160;
  const barWidth = 32;
  const gap = 16;
  const totalWidth = data.length * (barWidth + gap) + 40;

  const totalCollected = data.reduce((acc, d) => acc + d.collections, 0);

  return (
    <div className="card" style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.25rem", fontSize: "1.25rem" }}>💰 Monthly Collections of Every Month</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>
            Visual bar breakdown of total rent collections per month
          </p>
        </div>
        <div style={{
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          color: "var(--success)",
          padding: "4px 12px",
          borderRadius: "99px",
          fontSize: "0.8rem",
          fontWeight: 700
        }}>
          Total: ₹{totalCollected.toLocaleString("en-IN")}
        </div>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: "0.5rem" }}>
        <svg
          width={Math.max(totalWidth, 300)}
          height={chartHeight + 60}
          viewBox={`0 0 ${Math.max(totalWidth, 300)} ${chartHeight + 60}`}
          style={{ display: "block" }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartHeight - ratio * chartHeight;
            return (
              <g key={ratio}>
                <line x1={0} y1={y} x2={Math.max(totalWidth, 300)} y2={y} stroke="var(--border-color)" strokeWidth={1} />
                <text x={0} y={y - 4} fontSize="9" fill="var(--text-muted)" textAnchor="start">
                  ₹{Math.round((maxVal * ratio) / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const barHeight = Math.max((d.collections / maxVal) * chartHeight, d.collections > 0 ? 4 : 0);
            const x = i * (barWidth + gap) + 25;
            const y = chartHeight - barHeight;

            return (
              <g key={d.month}>
                <rect x={x} y={y} width={barWidth} height={barHeight} rx={6} ry={6} fill="url(#colGradient)" />
                <title>{d.month}: ₹{d.collections.toLocaleString("en-IN")}</title>

                <text x={x + barWidth / 2} y={chartHeight + 20} fontSize="10" fill="var(--text-muted)" textAnchor="middle">
                  {d.month}
                </text>

                {d.collections > 0 && (
                  <text x={x + barWidth / 2} y={y - 6} fontSize="9" fill="var(--primary)" textAnchor="middle" fontWeight="600">
                    ₹{d.collections >= 1000 ? `${Math.round(d.collections / 1000)}k` : d.collections}
                  </text>
                )}
              </g>
            );
          })}

          <defs>
            <linearGradient id="colGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--success)" stopOpacity="0.75" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
