import { useEffect, useState } from "react";
import { subscribeToTasks } from "../services/taskService";
import { auth } from "../services/firebase";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToTasks(auth.currentUser.uid, (data) => {
      setTasks(data);
    });
    return () => unsubscribe();
  }, []);

  const completed = tasks.filter((t) => t.status === "completed");
  const pending = tasks.filter((t) => t.status !== "completed");

  const avgAccuracy = () => {
    const withData = completed.filter((t) => t.actualTime > 0);
    if (withData.length === 0) return "No data yet";
    const total = withData.reduce((sum, t) => {
      return sum + Math.min((t.estimatedTime / t.actualTime) * 100, 100);
    }, 0);
    return (total / withData.length).toFixed(0) + "%";
  };

  const mostDelayedSubject = () => {
    const subjectMap = {};
    completed.forEach((t) => {
      if (!t.actualTime || !t.estimatedTime) return;
      const delay = t.actualTime - t.estimatedTime;
      if (!subjectMap[t.subject]) subjectMap[t.subject] = 0;
      subjectMap[t.subject] += delay;
    });
    const sorted = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : "No data yet";
  };

  const missedDeadlines = () => {
    return completed.filter((t) => {
      if (!t.completedAt || !t.deadline) return false;
      const completedDate = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
      return completedDate > new Date(t.deadline);
    }).length;
  };

  const completedOnTimePercent = () => {
    if (completed.length === 0) return "No data yet";
    const onTime = completed.filter((t) => {
      if (!t.completedAt || !t.deadline) return false;
      const completedDate = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
      return completedDate <= new Date(t.deadline);
    }).length;
    return ((onTime / completed.length) * 100).toFixed(0) + "%";
  };

  const avgStartDelay = () => {
    const withDelay = tasks.filter((t) => t.firstStartedAt && t.createdAt);
    if (withDelay.length === 0) return "No data yet";
    const total = withDelay.reduce((sum, t) => {
      const created = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
      const started = t.firstStartedAt.toDate ? t.firstStartedAt.toDate() : new Date(t.firstStartedAt);
      const days = (started - created) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    return (total / withDelay.length).toFixed(1) + " days";
  };

  const startDelayInsight = () => {
    const withDelay = tasks.filter((t) => t.firstStartedAt && t.createdAt);
    if (withDelay.length === 0) return null;
    const total = withDelay.reduce((sum, t) => {
      const created = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
      const started = t.firstStartedAt.toDate ? t.firstStartedAt.toDate() : new Date(t.firstStartedAt);
      return sum + (started - created) / (1000 * 60 * 60 * 24);
    }, 0);
    const avg = total / withDelay.length;
    if (avg < 0.5) return "🟢 You start tasks quickly — good habit";
    if (avg < 2) return `🟡 You usually start tasks ${avg.toFixed(1)} days after creating them`;
    return `🔴 Warning: You delay starting tasks by ${avg.toFixed(1)} days on average`;
  };

  return (
    <div className="dashboard">
      <h2>📊 Dashboard</h2>
      <div className="stat-grid">
        <StatCard label="Total Tasks" value={tasks.length} />
        <StatCard label="Completed" value={completed.length} />
        <StatCard label="Pending" value={pending.length} />
        <StatCard label="Avg Accuracy" value={avgAccuracy()} />
        <StatCard label="Missed Deadlines" value={missedDeadlines()} />
        <StatCard label="On Time %" value={completedOnTimePercent()} />
        <StatCard label="Avg Start Delay" value={avgStartDelay()} />
        <StatCard label="Most Delayed Subject" value={mostDelayedSubject()} />
      </div>

      {startDelayInsight() && (
        <p style={{ marginTop: "16px", fontSize: "14px", fontWeight: "500" }}>
          {startDelayInsight()}
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
