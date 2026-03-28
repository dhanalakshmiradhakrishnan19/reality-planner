import { useState } from "react";
import { auth } from "../services/firebase";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import { useTheme } from "../context/ThemeContext";
import { subscribeToTasks, deleteTask } from "../services/taskService";
import { useEffect } from "react";

export default function Settings({ pomodoroSettings, setPomodoroSettings }) {
  const user = auth.currentUser;
  const { theme, setTheme } = useTheme();

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    Notification.permission === "granted"
  );

  // Tasks state for clear all
  const [tasks, setTasks] = useState([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToTasks(user.uid, (data) => {
      setTasks(data);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateName = async () => {
    setProfileMsg(""); setProfileError(""); setProfileLoading(true);
    try {
      await updateProfile(user, { displayName });
      setProfileMsg("✅ Name updated successfully!");
    } catch (err) {
      setProfileError(err.message);
    }
    setProfileLoading(false);
  };

  const handleChangePassword = async () => {
    setProfileMsg(""); setProfileError(""); setProfileLoading(true);
    if (newPassword.length < 6) {
      setProfileError("New password must be at least 6 characters.");
      setProfileLoading(false);
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setProfileMsg("✅ Password changed successfully!");
      setCurrentPassword(""); setNewPassword("");
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setProfileError("Current password is incorrect.");
      } else {
        setProfileError(err.message);
      }
    }
    setProfileLoading(false);
  };

  const handleNotificationToggle = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
    } else {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        new Notification("📱 Reality Planner", {
          body: "Notifications enabled!",
          icon: "/vite.svg"
        });
      }
    }
  };

  const handleClearAllTasks = async () => {
    if (!window.confirm(`Are you sure you want to delete all ${tasks.length} tasks? This cannot be undone.`)) return;
    setClearing(true);
    try {
      await Promise.all(tasks.map((t) => deleteTask(t.id)));
    } catch (err) {
      console.error("Error clearing tasks:", err);
    }
    setClearing(false);
  };

  const getInitial = () => {
    if (user?.displayName) return user.displayName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "?";
  };

  const Section = ({ title, children }) => (
    <div style={{
      background: "var(--card)",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "16px",
      border: "1px solid var(--border)"
    }}>
      <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px", color: "var(--text)" }}>
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>⚙️ Settings</h2>

      {/* Profile Section */}
      <Section title="👤 Profile">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div style={{
            width: "60px", height: "60px", borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", fontWeight: "800", color: "white", flexShrink: 0
          }}>
            {getInitial()}
          </div>
          <div>
            <p style={{ fontWeight: "700", fontSize: "15px" }}>{user?.displayName || "No name set"}</p>
            <p style={{ fontSize: "12px", color: "var(--text2)" }}>{user?.email}</p>
          </div>
        </div>

        <input
          className="edit-input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
          style={{ marginBottom: "10px", width: "100%" }}
        />
        <button
          className="btn-edit"
          style={{ padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "700", cursor: "pointer", marginBottom: "20px" }}
          onClick={handleUpdateName}
          disabled={profileLoading}
        >
          {profileLoading ? "Saving..." : "💾 Save Name"}
        </button>

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "16px 0" }} />

        <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "10px", color: "var(--text2)" }}>CHANGE PASSWORD</p>
        <input
          className="edit-input"
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={{ marginBottom: "8px", width: "100%" }}
        />
        <input
          className="edit-input"
          type="password"
          placeholder="New password (min 6 chars)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ marginBottom: "12px", width: "100%" }}
        />
        <button
          className="btn-start"
          style={{ padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "700", cursor: "pointer" }}
          onClick={handleChangePassword}
          disabled={profileLoading}
        >
          {profileLoading ? "Updating..." : "🔒 Change Password"}
        </button>

        {profileMsg && <p style={{ marginTop: "12px", color: "var(--success)", fontSize: "13px", fontWeight: "600" }}>{profileMsg}</p>}
        {profileError && <p style={{ marginTop: "12px", color: "var(--danger)", fontSize: "13px" }}>{profileError}</p>}
      </Section>

      {/* Theme Section */}
      <Section title="🎨 Theme">
        <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "12px" }}>
          Choose how Reality Planner looks on your device.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { value: "system", label: "⚙️ System", desc: "Follow device" },
            { value: "light", label: "☀️ Light", desc: "Always light" },
            { value: "dark", label: "🌙 Dark", desc: "Always dark" }
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              style={{
                flex: 1,
                minWidth: "100px",
                padding: "14px 10px",
                borderRadius: "12px",
                border: theme === t.value ? "2px solid var(--accent)" : "2px solid var(--border)",
                background: theme === t.value ? "rgba(124,107,255,0.15)" : "var(--bg3)",
                color: theme === t.value ? "var(--accent)" : "var(--text2)",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>{t.label.split(" ")[0]}</div>
              <div>{t.label.split(" ")[1]}</div>
              <div style={{ fontSize: "11px", marginTop: "2px", opacity: 0.7 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Notifications Section */}
      <Section title="🔔 Notifications">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: "600" }}>Deadline Reminders</p>
            <p style={{ fontSize: "12px", color: "var(--text2)", marginTop: "4px" }}>
              Get notified when tasks are at risk or overdue
            </p>
          </div>
          <div
            onClick={handleNotificationToggle}
            style={{
              width: "48px", height: "26px",
              borderRadius: "13px",
              background: notificationsEnabled ? "var(--accent)" : "var(--bg3)",
              border: "2px solid var(--border)",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0
            }}
          >
            <div style={{
              position: "absolute",
              top: "2px",
              left: notificationsEnabled ? "22px" : "2px",
              width: "18px", height: "18px",
              borderRadius: "50%",
              background: "white",
              transition: "left 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
            }} />
          </div>
        </div>
        <p style={{ fontSize: "12px", color: "var(--text2)", marginTop: "12px" }}>
          {notificationsEnabled ? "✅ Notifications are enabled" : "❌ Notifications are disabled"}
        </p>
      </Section>

      {/* Pomodoro Settings */}
      <Section title="⏱ Pomodoro Timer">
        <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "16px" }}>
          Customize your focus and break durations.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "140px" }}>
            <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--text2)", marginBottom: "8px" }}>
              FOCUS DURATION
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              {[25, 45, 60].map((min) => (
                <button
                  key={min}
                  onClick={() => setPomodoroSettings({ ...pomodoroSettings, focus: min })}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    borderRadius: "8px",
                    border: pomodoroSettings.focus === min ? "2px solid var(--accent)" : "2px solid var(--border)",
                    background: pomodoroSettings.focus === min ? "rgba(124,107,255,0.15)" : "var(--bg3)",
                    color: pomodoroSettings.focus === min ? "var(--accent)" : "var(--text2)",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "140px" }}>
            <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--text2)", marginBottom: "8px" }}>
              BREAK DURATION
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              {[5, 10, 15].map((min) => (
                <button
                  key={min}
                  onClick={() => setPomodoroSettings({ ...pomodoroSettings, break: min })}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    borderRadius: "8px",
                    border: pomodoroSettings.break === min ? "2px solid var(--accent2)" : "2px solid var(--border)",
                    background: pomodoroSettings.break === min ? "rgba(255,107,157,0.15)" : "var(--bg3)",
                    color: pomodoroSettings.break === min ? "var(--accent2)" : "var(--text2)",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>
        </div>
        <p style={{ fontSize: "12px", color: "var(--text2)", marginTop: "12px" }}>
          Current: {pomodoroSettings.focus} min focus · {pomodoroSettings.break} min break
        </p>
      </Section>

      {/* Danger Zone */}
      <Section title="🗑️ Danger Zone">
        <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "16px" }}>
          These actions are permanent and cannot be undone.
        </p>
        <button
          onClick={handleClearAllTasks}
          disabled={clearing || tasks.length === 0}
          style={{
            background: "rgba(244,67,54,0.15)",
            color: "var(--danger)",
            border: "2px solid var(--danger)",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "14px",
            cursor: tasks.length === 0 ? "not-allowed" : "pointer",
            opacity: tasks.length === 0 ? 0.5 : 1
          }}
        >
          {clearing ? "Clearing..." : `🗑️ Clear All Tasks (${tasks.length})`}
        </button>
      </Section>
    </div>
  );
}