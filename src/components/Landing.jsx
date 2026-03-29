export default function Landing({ onGetStarted }) {

  const highlights = [
    {
      icon: "⏱",
      title: "Live Time Tracker",
      desc: "Click Start when you begin a task and Stop when done. The app tracks actual time spent — not just deadlines.",
      color: "#7c6bff"
    },
    {
      icon: "🧠",
      title: "Estimation vs Reality",
      desc: "Enter how long you think a task will take. After completion, see exactly how accurate your estimate was.",
      color: "#ff6b9d"
    },
    {
      icon: "🔴",
      title: "Deadline Risk Predictor",
      desc: "If remaining work exceeds time left before deadline, you get an automatic warning — before it's too late.",
      color: "#f44336"
    },
    {
      icon: "📅",
      title: "Smart Daily Plan",
      desc: "Tasks sorted by urgency combining deadline, effort and time left. Most critical task shown first.",
      color: "#ff9800"
    },
    {
      icon: "📊",
      title: "Productivity Dashboard",
      desc: "10 stats including avg accuracy, start delay, missed deadlines, on-time % and most delayed subject.",
      color: "#4caf50"
    },
    {
      icon: "🍅",
      title: "Pomodoro Focus Mode",
      desc: "Built-in focus timer with customizable 25/45/60 min sessions and 5/10/15 min breaks.",
      color: "#ff6b9d"
    },
    {
      icon: "🔥",
      title: "Streak Tracker",
      desc: "Track how many days in a row you complete tasks. See your current streak and personal best.",
      color: "#ff9800"
    },
    {
      icon: "📈",
      title: "Progress Charts",
      desc: "Visual bar and doughnut charts showing estimated vs actual time per task and completion breakdown.",
      color: "#7c6bff"
    }
  ];

  const allFeatures = [
    { icon: "🔐", text: "Firebase Authentication" },
    { icon: "📧", text: "Forgot Password via Email" },
    { icon: "🎯", text: "Onboarding for New Users" },
    { icon: "👤", text: "Per-user Data Isolation" },
    { icon: "📝", text: "Task Add / Edit / Delete" },
    { icon: "📌", text: "Pin Important Tasks" },
    { icon: "🏷️", text: "Priority Tags (High/Medium/Low)" },
    { icon: "🔄", text: "Sort by Deadline / Priority / Date" },
    { icon: "🔍", text: "Search & Filter Tasks" },
    { icon: "📤", text: "Export Tasks to CSV" },
    { icon: "⏱", text: "Live Timer (Start/Stop)" },
    { icon: "🧠", text: "Estimation vs Reality Insight" },
    { icon: "🔴", text: "Deadline Risk Predictor" },
    { icon: "📅", text: "Smart Daily Plan" },
    { icon: "🔥", text: "Streak Tracker" },
    { icon: "🍅", text: "Pomodoro Focus Mode" },
    { icon: "⚙️", text: "Custom Pomodoro Duration" },
    { icon: "📊", text: "Productivity Dashboard (10 stats)" },
    { icon: "📈", text: "Progress Charts" },
    { icon: "🔔", text: "Browser Notifications" },
    { icon: "💬", text: "Toast Notifications" },
    { icon: "🎉", text: "Completion Confetti Animation" },
    { icon: "🔢", text: "Task Counter Badge" },
    { icon: "🎨", text: "Light / Dark / System Theme" },
    { icon: "👤", text: "Profile Section" },
    { icon: "🗑️", text: "Clear All Tasks" },
    { icon: "📱", text: "Mobile Bottom Navbar" },
    { icon: "🚀", text: "Deployed on Vercel" }
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
          { value: "28+", label: "Features" },
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

      {/* Key Features Section */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px" }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "800",
          marginBottom: "12px"
        }}>
          Key Features
        </h2>
        <p style={{
          textAlign: "center",
          color: "var(--text2)",
          fontSize: "15px",
          marginBottom: "40px"
        }}>
          Everything you need to actually finish your tasks
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px"
        }}>
          {highlights.map((f) => (
            <div
              key={f.title}
              style={{
                background: "var(--card)",
                border: `1px solid ${f.color}30`,
                borderLeft: `4px solid ${f.color}`,
                borderRadius: "16px",
                padding: "20px",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: `${f.color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", marginBottom: "12px"
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "8px", color: "var(--text)" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text2)", lineHeight: "1.6" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{
        background: "var(--bg2)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "60px 24px"
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "28px",
            fontWeight: "800",
            marginBottom: "12px"
          }}>
            How It Works
          </h2>
          <p style={{
            textAlign: "center",
            color: "var(--text2)",
            fontSize: "15px",
            marginBottom: "40px"
          }}>
            4 simple steps to fix your planning habits
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { step: "01", title: "Add a task", desc: "Enter title, subject, deadline and your estimated time to complete it.", color: "#7c6bff" },
              { step: "02", title: "Start the timer", desc: "Click Start when you begin working. The app tracks real time automatically.", color: "#ff6b9d" },
              { step: "03", title: "Get insights", desc: "After stopping, see if you underestimated or overestimated. The app shows accuracy %.", color: "#ff9800" },
              { step: "04", title: "Review your patterns", desc: "Dashboard shows your accuracy, delay habits, streak, and which subjects you struggle with.", color: "#4caf50" }
            ].map((item) => (
              <div key={item.step} style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                background: "var(--card)",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid var(--border)"
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: `${item.color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", fontWeight: "900", color: item.color,
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "6px" }}>{item.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text2)", lineHeight: "1.6" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complete Feature List */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px" }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "800",
          marginBottom: "12px"
        }}>
          Complete Feature List
        </h2>
        <p style={{
          textAlign: "center",
          color: "var(--text2)",
          fontSize: "15px",
          marginBottom: "40px"
        }}>
          28 features built into one free app
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "10px"
        }}>
          {allFeatures.map((f) => (
            <div key={f.text} style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--card)",
              borderRadius: "10px",
              padding: "12px 16px",
              border: "1px solid var(--border)",
              fontSize: "13px",
              fontWeight: "600"
            }}>
              <span style={{ fontSize: "16px" }}>{f.icon}</span>
              <span style={{ color: "var(--text)" }}>{f.text}</span>
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
          Free forever. No credit card needed. Start in seconds.
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