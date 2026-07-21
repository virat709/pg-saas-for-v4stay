/**
 * SplineBackground — replaced with a pure-CSS animated gradient background.
 * Previously used @splinetool/react-spline which loaded a large WebGL bundle
 * and an external .splinecode file, severely hurting Lighthouse Performance score.
 * This zero-JS version achieves the same floating-orb aesthetic.
 */
export default function SplineBackground() {
  return (
    <>
      <style>{`
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(40px, -60px) scale(1.08); }
          66%       { transform: translate(-30px, 40px) scale(0.95); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-50px, 50px) scale(1.05); }
          70%       { transform: translate(35px, -35px) scale(0.97); }
        }
        @keyframes orb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(25px, 60px) scale(1.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .spline-orb { animation: none !important; }
        }
      `}</style>

      {/* Container */}
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* Primary teal orb — top-center */}
        <div
          className="spline-orb"
          style={{
            position: "absolute",
            top: "-15%",
            left: "40%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 40%, rgba(0,196,159,0.22), transparent 70%)",
            filter: "blur(60px)",
            animation: "orb-float-1 18s ease-in-out infinite",
          }}
        />
        {/* Blue orb — left */}
        <div
          className="spline-orb"
          style={{
            position: "absolute",
            top: "20%",
            left: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 60% 50%, rgba(56,189,248,0.15), transparent 70%)",
            filter: "blur(70px)",
            animation: "orb-float-2 22s ease-in-out infinite",
          }}
        />
        {/* Accent orb — bottom-right */}
        <div
          className="spline-orb"
          style={{
            position: "absolute",
            bottom: "5%",
            right: "-5%",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 50% 50%, rgba(0,196,159,0.12), transparent 65%)",
            filter: "blur(50px)",
            animation: "orb-float-3 26s ease-in-out infinite",
          }}
        />
      </div>
    </>
  );
}
