import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: "none",
          background: "radial-gradient(circle at 50% 40%, rgba(0, 196, 159, 0.08), transparent 60%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: "8rem",
            fontWeight: 900,
            lineHeight: 1,
            background: "linear-gradient(135deg, #00c49f, #38bdf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "1rem",
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#f8fafc",
            marginBottom: "0.75rem",
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "1.1rem",
            maxWidth: "420px",
            lineHeight: 1.6,
            marginBottom: "2.5rem",
          }}
        >
          Oops! The page you're looking for doesn't exist or may have been moved.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/dashboard"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              backgroundColor: "#00c49f",
              color: "#0f172a",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.2s",
              boxShadow: "0 0 20px rgba(0,196,159,0.3)",
            }}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#e2e8f0",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          >
            Go Home
          </Link>
        </div>

        <p style={{ marginTop: "3rem", color: "#475569", fontSize: "0.875rem" }}>
          © {new Date().getFullYear()} PGmate · v4stay
        </p>
      </div>
    </div>
  );
}
