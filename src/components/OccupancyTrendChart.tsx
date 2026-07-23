"use client";

interface OccupancyData {
  month: string;
  occupancyRate: number; // 0 to 100
  occupiedBeds: number;
  totalBeds: number;
}

interface OccupancyTrendChartProps {
  data: OccupancyData[];
}

export default function OccupancyTrendChart({ data }: OccupancyTrendChartProps) {
  if (!data || data.length === 0) return null;

  const chartHeight = 160;
  const width = 500;
  const paddingX = 40;
  const stepX = (width - paddingX * 2) / Math.max(1, data.length - 1);

  // Compute points for SVG curve/line
  const points = data.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = chartHeight - (d.occupancyRate / 100) * chartHeight + 10;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight + 10} L ${points[0].x} ${chartHeight + 10} Z`;

  const latest = data[data.length - 1] || { occupancyRate: 0, occupiedBeds: 0, totalBeds: 0 };

  return (
    <div className="card" style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.25rem", fontSize: "1.25rem" }}>🏠 Monthly Room Filling & Occupancy Trend</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>
            Track room filling rates & occupancy percentages over the last 6 months
          </p>
        </div>
        <div style={{
          backgroundColor: "rgba(30, 96, 145, 0.15)",
          color: "var(--primary)",
          padding: "4px 12px",
          borderRadius: "99px",
          fontSize: "0.8rem",
          fontWeight: 700
        }}>
          Current: {latest.occupancyRate}% Filled
        </div>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: "0.5rem" }}>
        <svg
          width="100%"
          height={chartHeight + 60}
          viewBox={`0 0 ${width} ${chartHeight + 60}`}
          style={{ display: "block", minWidth: "320px" }}
        >
          <defs>
            <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((rate) => {
            const y = chartHeight - (rate / 100) * chartHeight + 10;
            return (
              <g key={rate}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--border-color)" strokeWidth={1} strokeDasharray="3 3" />
                <text x={paddingX - 8} y={y + 4} fontSize="9" fill="var(--text-muted)" textAnchor="end">
                  {rate}%
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#occupancyGradient)" />

          {/* Trend Line */}
          <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={6} fill="var(--surface-color)" stroke="var(--primary)" strokeWidth={3} />
              
              {/* Tooltip text on point */}
              <text x={p.x} y={p.y - 12} fontSize="10" fontWeight="700" fill="var(--primary)" textAnchor="middle">
                {p.occupancyRate}%
              </text>

              {/* Month label */}
              <text x={p.x} y={chartHeight + 32} fontSize="10" fill="var(--text-muted)" textAnchor="middle">
                {p.month}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
