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
import { checkTaskNotifications } from "./services/notificationChecker";
import { subscribeToTasks } from "./services/taskService";
import Profile from "./components/Profile";
import Landing from "./components/Landing";

const tabs = [
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "daily", label: "📅 Daily" },
  { id: "tasks", label: "📝 Tasks" },
  { id: "pomodoro", label: " Focus" },
  { id: "profile", label: "👤 Profile" },
];
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { theme, setTheme } = useTheme();
  const [showLanding, setShowLanding] = useState(true);
  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  // Request notification permission on login
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
  // Check notifications every 5 minutes
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
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "16px" }}>
      {/* Header */}
      <div className="app-header">
        <span className="app-title">📱 Reality Planner</span>
        <div className="header-right">
          {/* Theme Switcher */}
          <div className="theme-selector">
            {["system", "light", "dark"].map((t) => (
              <button
                key={t}
                className={`theme-btn ${theme === t ? "active" : ""}`}
                onClick={() => setTheme(t)}
              >
                {t === "system" ? "⚙️" : t === "light" ? "☀️" : "🌙"}
              </button>
            ))}
          </div>
          <span className="user-email">{user.email}</span>
          <button className="signout-btn" onClick={() => signOut(auth)}>
            Sign Out
          </button>
        </div>
      </div>
      {/* Navbar */}
      <div className="navbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Content */}
      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "daily" && <DailyPlan />}
      {activeTab === "tasks" && (
        <div>
          <TaskForm />
          <TaskList />
        </div>
      )}
      {activeTab === "pomodoro" && <Pomodoro />}
      {activeTab === "profile" && <Profile />}
    </div>
  );
}
export default App;
