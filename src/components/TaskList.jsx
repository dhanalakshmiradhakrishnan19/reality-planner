import { useEffect, useState } from "react";
import { subscribeToTasks, updateTask, deleteTask } from "../services/taskService";
import { auth } from "../services/firebase";
import { useToast } from "../context/ToastContext";
import confetti from "canvas-confetti";

function isOverdue(task) {
  if (task.status === "completed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.deadline);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [liveTimes, setLiveTimes] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("pinned");
  const [expandedNotes, setExpandedNotes] = useState({});
  const { showToast } = useToast();

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

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (sortBy === "deadline") return new Date(a.deadline) - new Date(b.deadline);
    if (sortBy === "priority") return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
    if (sortBy === "newest") {
      const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return bDate - aDate;
    }
    if (sortBy === "oldest") {
      const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return aDate - bDate;
    }
    return 0;
  });

  const filteredTasks = sortedTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.subject.toLowerCase().includes(search.toLowerCase()) ||
      (task.notes || "").toLowerCase().includes(search.toLowerCase());
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
    const headers = ["Title", "Subject", "Deadline", "Priority", "Estimated Hours", "Actual Hours", "Status", "Notes"];
    const rows = tasks.map((t) => [
      t.title, t.subject, t.deadline,
      t.priority || "medium",
      t.estimatedTime,
      (t.actualTime || 0).toFixed(2),
      t.status,
      t.notes || ""
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
    showToast("Tasks exported to CSV!", "success");
  };

  const toggleNotes = (id) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
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

  const handlePin = async (task) => {
    await updateTask(task.id, { pinned: !task.pinned });
    showToast(task.pinned ? "Task unpinned" : "Task pinned to top! 📌", "info");
  };

  const handleStart = async (task) => {
    const updateData = { startedAt: new Date() };
    if (!task.firstStartedAt) updateData.firstStartedAt = new Date();
    await updateTask(task.id, updateData);
    showToast("Timer started!", "info");
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
    showToast("Timer stopped!", "warning");
  };

  const handleComplete = async (task) => {
    if (task.startedAt) await handleStop(task);
    await updateTask(task.id, { status: "completed", completedAt: new Date() });
    showToast("Task completed! 🎉", "success");
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#7c6bff", "#ff6b9d", "#6bffce", "#ffb300", "#4caf50"]
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await deleteTask(id);
    showToast("Task deleted", "error");
  };

  const handleEditStart = (task) => {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      subject: task.subject,
      deadline: task.deadline,
      estimatedTime: task.estimatedTime,
      priority: task.priority || "medium",
      notes: task.notes || ""
    });
  };

  const handleEditSave = async (id) => {
    await updateTask(id, {
      title: editData.title,
      subject: editData.subject,
      deadline: editData.deadline,
      estimatedTime: Number(editData.estimatedTime),
      priority: editData.priority || "medium",
      notes: editData.notes || ""
    });
    setEditingId(null);
    showToast("Task updated!", "success");
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
          placeholder="🔍 Search by title, subject or notes..."
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
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: "6px 12px", borderRadius: "8px", border: "none",
                fontSize: "12px", fontWeight: "700", cursor: "pointer",
                background: filterStatus === s ? "var(--accent)" : "var(--bg3)",
                color: filterStatus === s ? "white" : "var(--text2)",
                transition: "all 0.2s"
              }}>
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
              <button key={p.value} onClick={() => setFilterPriority(p.value)} style={{
                padding: "6px 12px", borderRadius: "8px", border: "none",
                fontSize: "12px", fontWeight: "700", cursor: "pointer",
                background: filterPriority === p.value ? "var(--accent2)" : "var(--bg3)",
                color: filterPriority === p.value ? "white" : "var(--text2)",
                transition: "all 0.2s"
              }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
            <span style={{ fontSize: "12px", color: "var(--text2)", fontWeight: "600", whiteSpace: "nowrap" }}>🔄 Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: "var(--bg3)", border: "1px solid var(--border)",
                color: "var(--text)", padding: "6px 10px", borderRadius: "8px",
                fontSize: "12px", fontWeight: "600", cursor: "pointer", flex: 1
              }}
            >
              <option value="pinned">📌 Pinned First</option>
              <option value="deadline">📅 Deadline (Soonest)</option>
              <option value="priority">🔴 Priority (High First)</option>
              <option value="newest">🆕 Newest First</option>
              <option value="oldest">🕐 Oldest First</option>
            </select>
          </div>
          <button onClick={exportToCSV} style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            color: "white", border: "none", padding: "8px 16px",
            borderRadius: "8px", fontSize: "12px", fontWeight: "700",
            cursor: "pointer", whiteSpace: "nowrap"
          }}>
            📤 Export
          </button>
        </div>

        <p style={{ fontSize: "12px", color: "var(--text2)" }}>
          Showing {filteredTasks.length} of {tasks.length} tasks
        </p>
      </div>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
  <div style={{
    textAlign: "center",
    padding: "48px 24px",
    background: "var(--card)",
    borderRadius: "16px",
    border: "1px solid var(--border)"
  }}>
    {tasks.length === 0 ? (
      <>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>📋</div>
        <p style={{ fontWeight: "700", fontSize: "16px", marginBottom: "8px" }}>No tasks yet</p>
        <p style={{ color: "var(--text2)", fontSize: "13px" }}>Add your first task above to get started!</p>
      </>
    ) : (
      <>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔍</div>
        <p style={{ fontWeight: "700", fontSize: "16px", marginBottom: "8px" }}>No tasks found</p>
        <p style={{ color: "var(--text2)", fontSize: "13px" }}>Try adjusting your search or filters.</p>
      </>
    )}
  </div>
) : (
        filteredTasks.map((task) => {
          const overdue = isOverdue(task);
          return (
            <div
              key={task.id}
              className={`task-card ${task.status === "completed" ? "completed" : ""}`}
              style={{
                borderLeft: task.pinned
                  ? "4px solid var(--accent2)"
                  : overdue
                  ? "4px solid #f44336"
                  : undefined,
                background: overdue ? "rgba(244,67,54,0.05)" : undefined
              }}
            >
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
                  <textarea
                    className="edit-input"
                    value={editData.notes || ""}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    placeholder="Notes (optional)..."
                    rows={3}
                    style={{ resize: "vertical", fontFamily: "inherit" }}
                  />
                  <div className="task-buttons">
                    <button className="btn-start" onClick={() => handleEditSave(task.id)}>💾 Save</button>
                    <button className="btn-complete" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>

              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                    {task.pinned && <span style={{ fontSize: "14px" }}>📌</span>}
                    <h3 style={{ margin: 0 }}>{task.title} {task.status === "completed" && "✅"}</h3>
                    <PriorityBadge priority={task.priority} />
                    {task.notes && (
                      <span style={{
                        fontSize: "11px", color: "var(--accent)", background: "rgba(124,107,255,0.1)",
                        padding: "2px 6px", borderRadius: "6px", fontWeight: "600"
                      }}>📝</span>
                    )}
                    {overdue && (
                      <span style={{
                        fontSize: "11px", fontWeight: "700", color: "#f44336",
                        background: "rgba(244,67,54,0.15)", padding: "2px 8px",
                        borderRadius: "20px", whiteSpace: "nowrap"
                      }}>
                        ⚠️ Overdue
                      </span>
                    )}
                  </div>

                  <p className="task-meta">📚 {task.subject}</p>
                  <p className="task-meta" style={{ color: overdue ? "#f44336" : undefined, fontWeight: overdue ? "700" : undefined }}>
                    📅 Deadline: {task.deadline}
                  </p>
                  <p className="task-meta">🕐 Estimated: {task.estimatedTime} hrs &nbsp;|&nbsp; Actual: {(task.actualTime || 0).toFixed(2)} hrs</p>

                  {/* Progress Bar */}
                  <ProgressBar
                    estimated={task.estimatedTime}
                    actual={task.actualTime || 0}
                    isRunning={!!task.startedAt}
                    liveSeconds={liveTimes[task.id]}
                  />

                  {/* Notes expandable section */}
                  {task.notes && (
                    <div style={{ marginTop: "8px" }}>
                      <button
                        onClick={() => toggleNotes(task.id)}
                        style={{
                          background: "transparent", border: "none",
                          color: "var(--accent)", fontSize: "12px",
                          fontWeight: "700", cursor: "pointer", padding: "0"
                        }}
                      >
                        {expandedNotes[task.id] ? "▲ Hide Notes" : "▼ Show Notes"}
                      </button>
                      {expandedNotes[task.id] && (
                        <div style={{
                          marginTop: "8px",
                          background: "var(--bg3)",
                          borderRadius: "8px",
                          padding: "10px 14px",
                          fontSize: "13px",
                          color: "var(--text2)",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap",
                          border: "1px solid var(--border)"
                        }}>
                          {task.notes}
                        </div>
                      )}
                    </div>
                  )}

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
                    <button onClick={() => handlePin(task)} style={{
                      padding: "7px 11px", borderRadius: "8px", border: "none",
                      fontSize: "11px", fontWeight: "700", cursor: "pointer",
                      background: task.pinned ? "rgba(255,107,157,0.2)" : "var(--bg3)",
                      color: task.pinned ? "var(--accent2)" : "var(--text2)"
                    }}>
                      {task.pinned ? "📌 Pinned" : "📌 Pin"}
                    </button>
                    <button className="btn-edit" onClick={() => handleEditStart(task)}>✏️ Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(task.id)}>🗑️ Delete</button>
                  </div>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function ProgressBar({ estimated, actual, isRunning, liveSeconds }) {
  const liveHours = isRunning && liveSeconds ? liveSeconds / 3600 : 0;
  const totalActual = actual + liveHours;
  const percent = estimated > 0 ? (totalActual / estimated) * 100 : 0;
  const displayPercent = Math.min(percent, 100);

  const barColor =
    percent > 100 ? "#f44336" :
    percent >= 75 ? "#ff9800" :
    "#4caf50";

  const label =
    percent > 100
      ? `${percent.toFixed(0)}% — Over estimate!`
      : `${percent.toFixed(0)}% of estimated time used`;

  if (estimated === 0) return null;

  return (
    <div style={{ marginTop: "10px", marginBottom: "6px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "5px"
      }}>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text2)" }}>⏳ Progress</span>
        <span style={{ fontSize: "11px", fontWeight: "700", color: barColor }}>{label}</span>
      </div>
      <div style={{
        width: "100%", height: "7px",
        background: "var(--bg3)", borderRadius: "99px",
        overflow: "hidden", border: "1px solid var(--border)"
      }}>
        <div style={{
          width: `${displayPercent}%`, height: "100%",
          background: barColor, borderRadius: "99px",
          transition: "width 1s linear",
          boxShadow: isRunning ? `0 0 6px ${barColor}` : "none"
        }} />
      </div>
      {percent > 100 && (
        <p style={{ fontSize: "11px", color: "#f44336", fontWeight: "700", marginTop: "4px" }}>
          ⚠️ {(totalActual - estimated).toFixed(2)} hrs over estimate
        </p>
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
      fontSize: "11px", fontWeight: "700", color: p.color,
      background: p.bg, padding: "2px 8px", borderRadius: "20px", whiteSpace: "nowrap"
    }}>
      {p.label}
    </span>
  );
}