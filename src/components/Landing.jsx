export default function Landing({ onGetStarted }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
      display: "flex",
      flexDirection: "column"
    }}>

      {/* Navbar */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        background: "var(--bg2)",
        borderBottom: "1px solid var(--border)"
      }}>
        <span style={{
          fontSize: "18px",
          fontWeight: "800",
          background: "linear-gradient(135deg, var(--accent), var(--accent2))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          📱 Reality Planner
        </span>
        <button
          onClick={onGetStarted}
          style={{
            background: "transparent",
            color: "var(--accent)",
            border: "1.5px solid var(--accent)",
            padding: "7px 18px",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          Sign In
        </button>
      </nav>

      {/* Single Hero Screen */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 24px",
        maxWidth: "620px",
        margin: "0 auto",
        width: "100%"
      }}>

        {/* Badge */}
        <div style={{
          display: "inline-block",
          background: "rgba(124,107,255,0.12)",
          color: "var(--accent)",
          padding: "5px 14px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "700",
          marginBottom: "24px",
          letterSpacing: "0.5px"
        }}>
          🚀 Anti-Procrastination Engine
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(36px, 7vw, 56px)",
          fontWeight: "900",
          lineHeight: "1.15",
          marginBottom: "18px",
          background: "linear-gradient(135deg, var(--text) 40%, var(--accent))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Stop Planning.<br />Start Doing.
        </h1>

        {/* Subheading */}
        <p style={{
          fontSize: "16px",
          color: "var(--text2)",
          lineHeight: "1.7",
          marginBottom: "36px",
          maxWidth: "460px"
        }}>
          Most apps track tasks. Reality Planner tracks your{" "}
          <strong style={{ color: "var(--accent)" }}>planning mistakes</strong>
          {" "}— and warns you before you miss a deadline.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }}>
          <button
            onClick={onGetStarted}
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              color: "white",
              border: "none",
              padding: "13px 30px",
              borderRadius: "12px",
              fontWeight: "800",
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(124,107,255,0.35)"
            }}
          >
            Get Started — Free
          </button>
          <button
            onClick={onGetStarted}
            style={{
              background: "transparent",
              color: "var(--text)",
              border: "1.5px solid var(--border)",
              padding: "13px 30px",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer"
            }}
          >
            Sign In
          </button>
        </div>

        {/* 4 Key Highlights */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
          width: "100%",
          maxWidth: "520px"
        }}>
          {[
            { icon: "⏱", text: "Live Time Tracker" },
            { icon: "🧠", text: "Estimation vs Reality" },
            { icon: "🔴", text: "Deadline Risk Predictor" },
            { icon: "📊", text: "Productivity Dashboard" },
          ].map((f) => (
            <div key={f.text} style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text)"
            }}>
              <span style={{ fontSize: "18px" }}>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center",
        padding: "16px",
        fontSize: "12px",
        color: "var(--text2)",
        borderTop: "1px solid var(--border)"
      }}>
        Built with React + Firebase · Reality Planner © 2026
      </div>
    </div>
  );
}