import { useState } from "react";

const slides = [
  {
    icon: "📝",
    title: "Add Your Tasks",
    desc: "Enter your task title, subject, deadline and how long you think it will take. This estimated time is the key to the app's intelligence.",
    color: "#7c6bff"
  },
  {
    icon: "⏱",
    title: "Track Real Time",
    desc: "Click Start when you begin working on a task and Stop when you're done. The app tracks exactly how long you actually spent.",
    color: "#ff6b9d"
  },
  {
    icon: "🧠",
    title: "Get Smart Insights",
    desc: "After stopping, the app shows if you underestimated or overestimated. Over time it reveals your planning patterns and habits.",
    color: "#6bffce"
  },
  {
    icon: "🔴",
    title: "Never Miss Deadlines",
    desc: "The risk predictor warns you automatically when you don't have enough time left to finish a task before its deadline.",
    color: "#ffb300"
  },
  {
    icon: "🚀",
    title: "You're All Set!",
    desc: "Start adding your tasks and let Reality Planner correct your planning mistakes before they become missed deadlines.",
    color: "#4caf50"
  }
];

export default function Onboarding({ onDone }) {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      localStorage.setItem("onboarding_done", "true");
      onDone();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_done", "true");
    onDone();
  };

  const slide = slides[current];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: "24px"
    }}>
      <div style={{
        background: "var(--card)",
        borderRadius: "24px",
        padding: "40px 32px",
        maxWidth: "420px",
        width: "100%",
        border: "1px solid var(--border)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
        textAlign: "center"
      }}>

        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
          {slides.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: i === current ? slide.color : "var(--border)",
                transition: "all 0.3s",
                cursor: "pointer"
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: `${slide.color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "48px",
          margin: "0 auto 24px",
          border: `2px solid ${slide.color}40`
        }}>
          {slide.icon}
        </div>

        {/* Step indicator */}
        <p style={{
          fontSize: "12px",
          fontWeight: "700",
          color: slide.color,
          marginBottom: "12px",
          letterSpacing: "1px"
        }}>
          STEP {current + 1} OF {slides.length}
        </p>

        {/* Title */}
        <h2 style={{
          fontSize: "22px",
          fontWeight: "800",
          marginBottom: "16px",
          color: "var(--text)"
        }}>
          {slide.title}
        </h2>

        {/* Description */}
        <p style={{
          fontSize: "14px",
          color: "var(--text2)",
          lineHeight: "1.7",
          marginBottom: "36px"
        }}>
          {slide.desc}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          {current < slides.length - 1 && (
            <button
              onClick={handleSkip}
              style={{
                background: "transparent",
                color: "var(--text2)",
                border: "2px solid var(--border)",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Skip
            </button>
          )}
          <button
            onClick={handleNext}
            style={{
              background: `linear-gradient(135deg, ${slide.color}, ${slide.color}99)`,
              color: "white",
              border: "none",
              padding: "12px 32px",
              borderRadius: "12px",
              fontWeight: "800",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: `0 4px 16px ${slide.color}40`,
              flex: current === slides.length - 1 ? 1 : "unset"
            }}
          >
            {current === slides.length - 1 ? "🚀 Let's Go!" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}