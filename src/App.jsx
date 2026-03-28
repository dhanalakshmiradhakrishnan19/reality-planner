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

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "daily", label: "Daily", icon: "📅" },
  { id: "tasks", label: "Tasks", icon: "📝" },
  { id: "pomodoro", label: "Focus", icon: "⏱" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLanding, setShowLanding] = useState(true);
  const [pomodoroSettings, setPomodoroSettings] = useState({ focus: 25, break: 5 });
  const { theme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
    let unsubscribe = subscribeToTasks(user.uid, (tasks) => {
      checkTaskNotifications(tasks);
    });
    const interval = setInterval(() => {
      if (unsubscribe) unsubscribe();
      unsubscribe = subscribeToTasks(user.uid, (tasks) => {
        checkTaskNotifications(tasks);
      });
    }, 5 * 60 * 1000);
    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, [user]);

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

      {/* Top Navbar — visible on PC only */}
      <div className="navbar top-navbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "daily" && <DailyPlan />}
        {activeTab === "tasks" && (
          <div>
            <TaskForm />
            <TaskList />
          </div>
        )}
        {activeTab === "pomodoro" && <Pomodoro pomodoroSettings={pomodoroSettings} />}
        {activeTab === "settings" && (
          <Settings
            pomodoroSettings={pomodoroSettings}
            setPomodoroSettings={setPomodoroSettings}
          />
        )}
      </div>

      {/* Bottom Navbar — visible on mobile only */}
      <div className="bottom-navbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`bottom-nav-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="bottom-nav-icon">{tab.icon}</span>
            <span className="bottom-nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;