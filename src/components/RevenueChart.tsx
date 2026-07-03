"use client";

interface MonthlyData {
  month: string;
  amount: number;
}

interface RevenueChartProps {
  data: MonthlyData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.amount), 1);
  const chartHeight = 160;
  const barWidth = 32;
  const gap = 16;
  const totalWidth = data.length * (barWidth + gap) - gap;

  return (
    <div className="card" style={{ marginBottom: "2rem" }}>
      <h2 style={{ marginBottom: "0.25rem" }}>Revenue — Last 6 Months</h2>
      <p style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>Monthly rent collection overview</p>

      <div style={{ overflowX: "auto", paddingBottom: "0.5rem" }}>
        <svg
          width={Math.max(totalWidth, 300)}
          height={chartHeight + 60}
          viewBox={`0 0 ${Math.max(totalWidth, 300)} ${chartHeight + 60}`}
          style={{ display: "block" }}
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartHeight - ratio * chartHeight;
            return (
              <g key={ratio}>
                <line
                  x1={0}
                  y1={y}
                  x2={Math.max(totalWidth, 300)}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeWidth={1}
                />
                <text
                  x={0}
                  y={y - 4}
                  fontSize="9"
                  fill="var(--text-muted)"
                  textAnchor="start"
                >
                  ₹{Math.round((max * ratio) / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const barHeight = Math.max((d.amount / max) * chartHeight, d.amount > 0 ? 4 : 0);
            const x = i * (barWidth + gap) + 20;
            const y = chartHeight - barHeight;

            return (
              <g key={d.month}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={6}
                  ry={6}
                  fill="url(#barGradient)"
                  style={{ transition: "all 0.3s ease" }}
                />
                {/* Amount label on hover via title */}
                <title>₹{d.amount.toLocaleString("en-IN")}</title>

                {/* Month label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  fontSize="10"
                  fill="var(--text-muted)"
                  textAnchor="middle"
                >
                  {d.month}
                </text>

                {/* Amount label */}
                {d.amount > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    fontSize="9"
                    fill="var(--primary)"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    ₹{d.amount >= 1000 ? `${Math.round(d.amount / 1000)}k` : d.amount}
                  </text>
                )}
              </g>
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--success)" stopOpacity="0.7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
