export default function Landing({ onGetStarted }) {
  const features = [
    { icon: "⏱", title: "Live Time Tracker", desc: "Track actual time spent on every task in real time" },
    { icon: "🧠", title: "Estimation vs Reality", desc: "See how accurate your time estimates are after each task" },
    { icon: "🔴", title: "Deadline Risk Predictor", desc: "Get warned automatically when you won't finish on time" },
    { icon: "📅", title: "Smart Daily Plan", desc: "Tasks sorted by urgency — most critical shown first" },
    { icon: "📊", title: "Productivity Dashboard", desc: "8 stats including accuracy, delays, and missed deadlines" },
    { icon: "🍅", title: "Pomodoro Focus Mode", desc: "Built-in 25-minute focus timer with break tracking" },
    { icon: "🔥", title: "Streak Tracker", desc: "Track your daily completion streaks and personal best" },
    { icon: "📈", title: "Progress Charts", desc: "Visual charts showing estimated vs actual time per task" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>

      {/* Navbar */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        background: "var(--bg2)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <span style={{
          fontSize: "20px",
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
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            color: "white",
            border: "none",
            padding: "8px 20px",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <div style={{
        textAlign: "center",
        padding: "80px 24px 60px",
        maxWidth: "700px",
        margin: "0 auto"
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(124,107,255,0.15)",
          color: "var(--accent)",
          padding: "6px 16px",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: "700",
          marginBottom: "20px"
        }}>
          🚀 Anti-Procrastination Engine
        </div>

        <h1 style={{
          fontSize: "clamp(32px, 6vw, 52px)",
          fontWeight: "900",
          lineHeight: "1.2",
          marginBottom: "20px",
          background: "linear-gradient(135deg, var(--text), var(--accent))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Stop Planning.<br />Start Doing.
        </h1>

        <p style={{
          fontSize: "16px",
          color: "var(--text2)",
          lineHeight: "1.7",
          marginBottom: "36px",
          maxWidth: "500px",
          margin: "0 auto 36px"
        }}>
          Most apps track tasks. Reality Planner tracks your <strong style={{ color: "var(--accent)" }}>planning mistakes</strong> — and corrects them before you miss a deadline.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={onGetStarted}
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              color: "white",
              border: "none",
              padding: "14px 32px",
              borderRadius: "12px",
              fontWeight: "800",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(124,107,255,0.4)"
            }}
          >
            Get Started — Free
          </button>
          <button
            onClick={onGetStarted}
            style={{
              background: "transparent",
              color: "var(--text)",
              border: "2px solid var(--border)",
              padding: "14px 32px",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: "var(--bg2)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "24px",
        display: "flex",
        justifyContent: "center",
        gap: "48px",
        flexWrap: "wrap"
      }}>
        {[
          { value: "20+", label: "Features" },
          { value: "100%", label: "Free" },
          { value: "Real-time", label: "Firebase Sync" },
          { value: "Mobile", label: "Responsive" }
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "24px",
              fontWeight: "900",
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text2)", marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px" }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "800",
          marginBottom: "40px"
        }}>
          Everything you need to <span style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>actually finish</span> your tasks
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px"
        }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "20px",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>{f.icon}</div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "6px" }}>{f.title}</h3>
              <p style={{ fontSize: "12px", color: "var(--text2)", lineHeight: "1.5" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        textAlign: "center",
        padding: "60px 24px",
        background: "var(--bg2)",
        borderTop: "1px solid var(--border)"
      }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "12px" }}>
          Ready to fix your planning?
        </h2>
        <p style={{ color: "var(--text2)", marginBottom: "28px", fontSize: "15px" }}>
          Free forever. No credit card needed.
        </p>
        <button
          onClick={onGetStarted}
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            color: "white",
            border: "none",
            padding: "14px 40px",
            borderRadius: "12px",
            fontWeight: "800",
            fontSize: "16px",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(124,107,255,0.4)"
          }}
        >
          Get Started — Free
        </button>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center",
        padding: "20px",
        fontSize: "12px",
        color: "var(--text2)",
        borderTop: "1px solid var(--border)"
      }}>
        Built with React + Firebase · Reality Planner © 2026
      </div>
    </div>
  );
}