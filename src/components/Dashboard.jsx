import { useEffect, useState } from "react";
import { subscribeToTasks } from "../services/taskService";
import { auth } from "../services/firebase";
import ProgressChart from "./ProgressChart";

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

  const getStreaks = () => {
    const completedWithDate = completed.filter((t) => t.completedAt);
    if (completedWithDate.length === 0) return { current: 0, best: 0 };

    // Get unique dates when tasks were completed
    const dateSet = new Set(
      completedWithDate.map((t) => {
        const d = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
        return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
      })
    );

    const dates = Array.from(dateSet).sort();

    // Calculate best streak
    let bestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // Calculate current streak
    let currentStreak = 1;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const lastDate = dates[dates.length - 1];

    if (lastDate !== today && lastDate !== yesterday) {
      currentStreak = 0;
    } else {
      for (let i = dates.length - 1; i > 0; i--) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return { current: currentStreak, best: bestStreak };
  };

  const { current: currentStreak, best: bestStreak } = getStreaks();

  const streakInsight = () => {
    if (currentStreak === 0) return "⚠️ No active streak — complete a task today to start one!";
    if (currentStreak >= 7) return `🔥 Amazing! You're on a ${currentStreak}-day streak!`;
    if (currentStreak >= 3) return `🔥 Great work! Keep going — ${currentStreak} days in a row!`;
    return `🔥 ${currentStreak}-day streak — keep it up!`;
  };

  return (
    <div>
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
          <StatCard label="🔥 Current Streak" value={`${currentStreak} days`} />
          <StatCard label="🏆 Best Streak" value={`${bestStreak} days`} />
        </div>

        {startDelayInsight() && (
          <p style={{ marginTop: "16px", fontSize: "14px", fontWeight: "500" }}>
            {startDelayInsight()}
          </p>
        )}

        {completed.length > 0 && (
          <p style={{ marginTop: "8px", fontSize: "14px", fontWeight: "500" }}>
            {streakInsight()}
          </p>
        )}
      </div>

      <ProgressChart tasks={tasks} />
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