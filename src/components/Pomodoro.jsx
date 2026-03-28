import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";

export default function Pomodoro({ pomodoroSettings = { focus: 25, break: 5 } }) {
  const [secondsLeft, setSecondsLeft] = useState(pomodoroSettings.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const { showToast } = useToast();

  // Reset timer when settings change
  useEffect(() => {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(pomodoroSettings.focus * 60);
  }, [pomodoroSettings.focus, pomodoroSettings.break]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isBreak]);

  const handleTimerEnd = () => {
    setIsRunning(false);
    if (!isBreak) {
      setSessions((prev) => prev + 1);
     showToast(`Focus session done! Take a ${pomodoroSettings.break} min break.`, "success");
      setIsBreak(true);
      setSecondsLeft(pomodoroSettings.break * 60);
    } else {
      showToast(`Break over! Start your next focus session.`, "info");
      setIsBreak(false);
      setSecondsLeft(pomodoroSettings.focus * 60);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getProgress = () => {
    const total = isBreak ? pomodoroSettings.break * 60 : pomodoroSettings.focus * 60;
    return ((total - secondsLeft) / total) * 100;
  };

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(pomodoroSettings.focus * 60);
  };

  return (
    <div className="dashboard" style={{ marginBottom: "28px", textAlign: "center" }}>
      <h2>Focus Mode</h2>

      <p style={{ color: "var(--text2)", fontSize: "13px", marginBottom: "16px" }}>
        {isBreak ? "☕ Break Time" : "🎯 Focus Session"} &nbsp;|&nbsp; Sessions completed: {sessions}
      </p>

      <p style={{ color: "var(--text2)", fontSize: "12px", marginBottom: "16px" }}>
        {pomodoroSettings.focus} min focus · {pomodoroSettings.break} min break
      </p>

      {/* Circular timer */}
      <div style={{
        width: "160px",
        height: "160px",
        borderRadius: "50%",
        background: `conic-gradient(var(--accent) ${getProgress()}%, var(--bg3) ${getProgress()}%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px auto"
      }}>
        <div style={{
          width: "130px",
          height: "130px",
          borderRadius: "50%",
          background: "var(--card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          fontWeight: "bold",
          color: isBreak ? "var(--success)" : "var(--accent)"
        }}>
          {formatTime(secondsLeft)}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        {!isRunning ? (
          <button
            className="btn-start"
            style={{ padding: "10px 24px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer" }}
            onClick={() => setIsRunning(true)}
          >
            ▶ Start
          </button>
        ) : (
          <button
            className="btn-stop"
            style={{ padding: "10px 24px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer" }}
            onClick={() => setIsRunning(false)}
          >
            ⏸ Pause
          </button>
        )}
        <button
          className="btn-complete"
          style={{ padding: "10px 24px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer" }}
          onClick={reset}
        >
          🔄 Reset
        </button>
      </div>

      {sessions > 0 && (
        <p style={{ marginTop: "16px", fontSize: "13px", color: "var(--text2)" }}>
          🎉 You completed {sessions} focus {sessions === 1 ? "session" : "sessions"} today
        </p>
      )}
    </div>
  );
}