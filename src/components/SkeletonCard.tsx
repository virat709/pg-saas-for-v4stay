"use client";

interface SkeletonCardProps {
  height?: string;
  width?: string;
  style?: React.CSSProperties;
}

/** Animated shimmer skeleton for loading states */
export function SkeletonCard({ height = "80px", width = "100%", style }: SkeletonCardProps) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: "var(--radius-lg)",
        background: "linear-gradient(90deg, var(--border-color) 25%, rgba(255,255,255,0.05) 50%, var(--border-color) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s infinite",
        border: "1px solid var(--border-color)",
        ...style,
      }}
    />
  );
}

/** Dashboard stat card skeleton */
export function SkeletonStatGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem",
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card" style={{ padding: "1.5rem" }}>
          <SkeletonCard height="16px" width="50%" style={{ marginBottom: "0.75rem", borderRadius: "4px" }} />
          <SkeletonCard height="40px" width="60%" style={{ marginBottom: "0.5rem", borderRadius: "6px" }} />
          <SkeletonCard height="14px" width="80%" style={{ borderRadius: "4px" }} />
        </div>
      ))}
    </div>
  );
}

/** Table row skeleton */
export function SkeletonTableRows({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
          {[1, 2, 3, 4].map((j) => (
            <td key={j} style={{ padding: "1rem 0.75rem" }}>
              <SkeletonCard height="16px" width={j === 1 ? "80%" : j === 4 ? "50%" : "65%"} style={{ borderRadius: "4px" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

/** Generic empty state component */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="card text-center"
      style={{
        padding: "4rem 2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div style={{ fontSize: "3rem", lineHeight: 1 }}>{icon}</div>
      <h3 style={{ color: "var(--text-main)", marginBottom: "0.25rem" }}>{title}</h3>
      <p style={{ maxWidth: "360px", textAlign: "center", margin: 0 }}>{description}</p>
      {action && <div style={{ marginTop: "0.5rem" }}>{action}</div>}
    </div>
  );
}
