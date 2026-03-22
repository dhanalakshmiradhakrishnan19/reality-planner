import { useEffect, useState } from "react";
import { subscribeToTasks } from "../services/taskService";
import { auth } from "../services/firebase";

export default function DailyPlan() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToTasks(auth.currentUser.uid, (data) => {
      setTasks(data);
    });
    return () => unsubscribe();
  }, []);

  const getSuggestedTasks = () => {
    const now = new Date();
    return tasks
      .filter((t) => t.status !== "completed")
      .map((t) => {
        const deadline = new Date(t.deadline);
        const hoursLeft = (deadline - now) / (1000 * 60 * 60);
        const remaining = t.estimatedTime - (t.actualTime || 0);
        const urgencyScore = remaining / (hoursLeft || 1);

        let label = "";
        let color = "";

        if (hoursLeft < 0) {
          label = "❌ OVERDUE";
          color = "#c62828";
        } else if (hoursLeft < remaining) {
          label = "🔴 Do this NOW — not enough time left";
          color = "#c62828";
        } else if (urgencyScore > 0.5) {
          label = "🟡 Do this today";
          color = "#ff9800";
        } else {
          label = "🟢 On track";
          color = "#4caf50";
        }

        return { ...t, urgencyScore, label, color, hoursLeft, remaining };
      })
      .sort((a, b) => b.urgencyScore - a.urgencyScore);
  };

  const suggested = getSuggestedTasks();

  return (
    <div className="dashboard" style={{ marginBottom: "28px" }}>
      <h2>📅 Smart Daily Plan</h2>
      {suggested.length === 0 ? (
        <p style={{ color: "var(--text2)", fontSize: "14px" }}>
          No pending tasks. Add tasks to get your daily plan.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {suggested.map((task) => (
            <div key={task.id} style={{
              background: "var(--bg3)",
              padding: "14px 16px",
              borderRadius: "10px",
              borderLeft: `4px solid ${task.color}`,
              border: `1px solid var(--border)`,
              borderLeftWidth: "4px",
              borderLeftColor: task.color
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                <div>
                  <p style={{ fontWeight: "bold", fontSize: "15px", color: "var(--text)" }}>{task.title}</p>
                  <p style={{ fontSize: "12px", color: "var(--text2)", marginTop: "4px" }}>📚 {task.subject}</p>
                  <p style={{ fontSize: "12px", color: "var(--text2)", marginTop: "2px" }}>
                    ⏳ {task.remaining.toFixed(1)} hrs remaining &nbsp;|&nbsp;
                    📅 {task.hoursLeft > 0 ? task.hoursLeft.toFixed(1) + " hrs until deadline" : "Overdue"}
                  </p>
                </div>
                <p style={{ fontSize: "13px", fontWeight: "bold", color: task.color, textAlign: "right", maxWidth: "200px", flexShrink: 0 }}>
                  {task.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}