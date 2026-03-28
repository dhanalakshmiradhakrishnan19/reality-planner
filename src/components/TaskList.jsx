import { useEffect, useState } from "react";
import { subscribeToTasks, updateTask, deleteTask } from "../services/taskService";
import { auth } from "../services/firebase";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [liveTimes, setLiveTimes] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    const unsubscribe = subscribeToTasks(auth.currentUser.uid, (data) => {
      setTasks(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = {};
      tasks.forEach((task) => {
        if (task.startedAt) {
          const start = task.startedAt.toDate ? task.startedAt.toDate() : new Date(task.startedAt);
          const seconds = Math.floor((new Date() - start) / 1000);
          updated[task.id] = seconds;
        }
      });
      setLiveTimes(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && task.status === "completed") ||
      (filterStatus === "pending" && task.status !== "completed");
    const matchesPriority =
      filterPriority === "all" ||
      (task.priority || "medium") === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const exportToCSV = () => {
    const headers = ["Title", "Subject", "Deadline", "Priority", "Estimated Hours", "Actual Hours", "Status"];
    const rows = tasks.map((t) => [
      t.title,
      t.subject,
      t.deadline,
      t.priority || "medium",
      t.estimatedTime,
      (t.actualTime || 0).toFixed(2),
      t.status
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reality-planner-tasks.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getInsight = (estimated, actual) => {
    if (!actual || actual === 0) return null;
    const diff = actual - estimated;
    const accuracy = Math.min((estimated / actual) * 100, 100).toFixed(0);
    if (diff > 0) return `⚠️ You underestimated by ${diff.toFixed(2)} hrs (Accuracy: ${accuracy}%)`;
    else if (diff < 0) return `✅ You finished ${Math.abs(diff).toFixed(2)} hrs early (Accuracy: ${accuracy}%)`;
    return `🎯 Perfect estimate! (Accuracy: 100%)`;
  };

  const getRisk = (deadline, estimatedTime, actualTime) => {
    const today = new Date();
    const due = new Date(deadline);
    const hoursLeft = (due - today) / (1000 * 60 * 60);
    const remaining = estimatedTime - (actualTime || 0);
    if (remaining <= 0) return null;
    if (hoursLeft < remaining) return `🔴 HIGH RISK: Only ${hoursLeft.toFixed(1)} hrs left but ~${remaining.toFixed(1)} hrs of work remaining`;
    else if (hoursLeft < remaining * 1.5) return `🟡 MEDIUM RISK: Cutting it close`;
    return `🟢 On track`;
  };

  const handleStart = async (task) => {
    const updateData = { startedAt: new Date() };
    if (!task.firstStartedAt) updateData.firstStartedAt = new Date();
    await updateTask(task.id, updateData);
  };

  const handleStop = async (task) => {
    if (!task.startedAt) return;
    const start = task.startedAt.toDate ? task.startedAt.toDate() : new Date(task.startedAt);
    const end = new Date();
    const hours = (end - start) / (1000 * 60 * 60);
    await updateTask(task.id, {
      actualTime: (task.actualTime || 0) + hours,
      startedAt: null
    });
  };

  const handleComplete = async (task) => {
    if (task.startedAt) await handleStop(task);
    await updateTask(task.id, { status: "completed", completedAt: new Date() });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this task?")) await deleteTask(id);
  };

  const handleEditStart = (task) => {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      subject: task.subject,
      deadline: task.deadline,
      estimatedTime: task.estimatedTime,
      priority: task.priority || "medium"
    });
  };

  const handleEditSave = async (id) => {
    await updateTask(id, {
      title: editData.title,
      subject: editData.subject,
      deadline: editData.deadline,
      estimatedTime: Number(editData.estimatedTime),
      priority: editData.priority || "medium"
    });
    setEditingId(null);
  };

  return (
    <div className="task-list">

      {/* Search & Filter Bar */}
      <div style={{
        background: "var(--card)",
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "16px",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        <input
          type="text"
          placeholder="🔍 Search by title or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "var(--bg3)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            padding: "10px 14px",
            borderRadius: "10px",
            fontSize: "14px",
            width: "100%"
          }}
        />

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {["all", "pending", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: filterStatus === s ? "var(--accent)" : "var(--bg3)",
                  color: filterStatus === s ? "white" : "var(--text2)",
                  transition: "all 0.2s"
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ width: "1px", background: "var(--border)", margin: "0 4px" }} />

          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {[
              { value: "all", label: "All" },
              { value: "high", label: "🔴 High" },
              { value: "medium", label: "🟡 Medium" },
              { value: "low", label: "🟢 Low" }
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setFilterPriority(p.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: filterPriority === p.value ? "var(--accent2)" : "var(--bg3)",
                  color: filterPriority === p.value ? "white" : "var(--text2)",
                  transition: "all 0.2s"
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "12px", color: "var(--text2)" }}>
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
          <button
            onClick={exportToCSV}
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            📤 Export to CSV
          </button>
        </div>
      </div>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <p style={{ color: "var(--text2)", fontSize: "14px", textAlign: "center", padding: "20px" }}>
          {tasks.length === 0 ? "No tasks yet. Add one above!" : "No tasks match your search or filter."}
        </p>
      ) : (
        filteredTasks.map((task) => (
          <div key={task.id} className={`task-card ${task.status === "completed" ? "completed" : ""}`}>

            {editingId === task.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input className="edit-input" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} placeholder="Title" />
                <input className="edit-input" value={editData.subject} onChange={(e) => setEditData({ ...editData, subject: e.target.value })} placeholder="Subject" />
                <input className="edit-input" type="date" value={editData.deadline} onChange={(e) => setEditData({ ...editData, deadline: e.target.value })} />
                <input className="edit-input" type="number" value={editData.estimatedTime} onChange={(e) => setEditData({ ...editData, estimatedTime: e.target.value })} placeholder="Estimated hours" />
                <select className="edit-input" value={editData.priority || "medium"} onChange={(e) => setEditData({ ...editData, priority: e.target.value })}>
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🟢 Low Priority</option>
                </select>
                <div className="task-buttons">
                  <button className="btn-start" onClick={() => handleEditSave(task.id)}>💾 Save</button>
                  <button className="btn-complete" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>

            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <h3 style={{ margin: 0 }}>{task.title} {task.status === "completed" && "✅"}</h3>
                  <PriorityBadge priority={task.priority} />
                </div>
                <p className="task-meta">📚 {task.subject}</p>
                <p className="task-meta">📅 Deadline: {task.deadline}</p>
                <p className="task-meta">🕐 Estimated: {task.estimatedTime} hrs &nbsp;|&nbsp; Actual: {(task.actualTime || 0).toFixed(2)} hrs</p>

                {task.startedAt && liveTimes[task.id] !== undefined && (
                  <p className="task-timer">⏱ Running: {formatTime(liveTimes[task.id])}</p>
                )}
                {task.actualTime > 0 && (
                  <p className="task-insight">{getInsight(task.estimatedTime, task.actualTime)}</p>
                )}
                {task.status !== "completed" && (
                  <p className="task-risk">{getRisk(task.deadline, task.estimatedTime, task.actualTime)}</p>
                )}

                <div className="task-buttons">
                  {task.status !== "completed" && (
                    <>
                      {!task.startedAt ? (
                        <button className="btn-start" onClick={() => handleStart(task)}>▶ Start</button>
                      ) : (
                        <button className="btn-stop" onClick={() => handleStop(task)}>⏹ Stop</button>
                      )}
                      <button className="btn-complete" onClick={() => handleComplete(task)}>✅ Complete</button>
                    </>
                  )}
                  <button className="btn-edit" onClick={() => handleEditStart(task)}>✏️ Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(task.id)}>🗑️ Delete</button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const config = {
    high: { label: "High", color: "#f44336", bg: "rgba(244,67,54,0.15)" },
    medium: { label: "Medium", color: "#ff9800", bg: "rgba(255,152,0,0.15)" },
    low: { label: "Low", color: "#4caf50", bg: "rgba(76,175,80,0.15)" }
  };
  const p = config[priority] || config["medium"];
  return (
    <span style={{
      fontSize: "11px",
      fontWeight: "700",
      color: p.color,
      background: p.bg,
      padding: "2px 8px",
      borderRadius: "20px",
      whiteSpace: "nowrap"
    }}>
      {p.label}
    </span>
  );
}