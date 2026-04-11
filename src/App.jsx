import { useEffect, useState } from "react";
import { auth } from "./services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useTheme } from "./context/ThemeContext";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import Dashboard from "./components/Dashboard";
import DailyPlan from "./components/DailyPlan";
import Pomodoro from "./components/Pomodoro";
import Auth from "./components/Auth";
import Landing from "./components/Landing";
import Settings from "./components/Settings";
import { checkTaskNotifications } from "./services/notificationChecker";
import { subscribeToTasks } from "./services/taskService";
import Onboarding from "./components/Onboarding";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLanding, setShowLanding] = useState(true);
  const [pomodoroSettings, setPomodoroSettings] = useState({ focus: 25, break: 5 });
  const [pendingCount, setPendingCount] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !currentUser.emailVerified) {
        setUser(null);
      } else {
        setUser(currentUser);
        if (currentUser) {
          const done = localStorage.getItem("onboarding_done");
          if (!done) setShowOnboarding(true);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("📱 Reality Planner", {
            body: "Notifications enabled! You'll get deadline reminders.",
            icon: "/vite.svg"
          });
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToTasks(user.uid, (tasks) => {
      checkTaskNotifications(tasks);
      const pending = tasks.filter((t) => t.status !== "completed").length;
      setPendingCount(pending);
    });
    return () => unsubscribe();
  }, [user]);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "daily", label: "Daily", icon: "📅" },
    { id: "tasks", label: "Tasks", icon: "📝", badge: pendingCount },
    { id: "pomodoro", label: "Focus", icon: "⏱" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text2)" }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    if (showLanding) {
      return <Landing onGetStarted={() => setShowLanding(false)} />;
    }
    return <Auth />;
  }

  if (showOnboarding) {
    return <Onboarding onDone={() => setShowOnboarding(false)} />;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "16px", paddingBottom: "80px" }}>

      {/* Header */}
      <div className="app-header">
        <span className="app-title">📱 Reality Planner</span>
        <div className="header-right">
          <span className="user-email">{user.email}</span>
          <button className="signout-btn" onClick={() => signOut(auth)}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Top Navbar — PC only */}
      <div className="navbar top-navbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ position: "relative" }}
          >
            {tab.icon} {tab.label}
            {tab.badge > 0 && (
              <span style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                background: "var(--danger)",
                color: "white",
                fontSize: "10px",
                fontWeight: "800",
                borderRadius: "10px",
                padding: "1px 5px",
                minWidth: "16px",
                textAlign: "center",
                lineHeight: "1.4"
              }}>
                {tab.badge > 99 ? "99+" : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div key={activeTab} className="page-transition">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "daily" && <DailyPlan />}
        {activeTab === "tasks" && <> <TaskForm /> <TaskList /> </>}
        {activeTab === "pomodoro" && <Pomodoro pomodoroSettings={pomodoroSettings} />}
        {activeTab === "settings" && <Settings pomodoroSettings={pomodoroSettings} setPomodoroSettings={setPomodoroSettings} />}
      </div>

      {/* Bottom Navbar — Mobile only */}
      <div className="bottom-navbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`bottom-nav-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ position: "relative" }}
          >
            <span className="bottom-nav-icon">{tab.icon}</span>
            {tab.badge > 0 && (
              <span style={{
                position: "absolute",
                top: "0px",
                right: "12px",
                background: "var(--danger)",
                color: "white",
                fontSize: "9px",
                fontWeight: "800",
                borderRadius: "10px",
                padding: "1px 4px",
                minWidth: "14px",
                textAlign: "center",
                lineHeight: "1.4"
              }}>
                {tab.badge > 99 ? "99+" : tab.badge}
              </span>
            )}
            <span className="bottom-nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;