import { useEffect, useState } from "react";
import { subscribeToTasks, updateTask, deleteTask } from "../services/taskService";
import { auth } from "../services/firebase";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [liveTimes, setLiveTimes] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

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

    if (!task.firstStartedAt) {
      updateData.firstStartedAt = new Date();
    }

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
    await updateTask(task.id, {
      status: "completed",
      completedAt: new Date()
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this task?")) {
      await deleteTask(id);
    }
  };

  const handleEditStart = (task) => {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      subject: task.subject,
      deadline: task.deadline,
      estimatedTime: task.estimatedTime
    });
  };

  const handleEditSave = async (id) => {
    await updateTask(id, {
      title: editData.title,
      subject: editData.subject,
      deadline: editData.deadline,
      estimatedTime: Number(editData.estimatedTime)
    });
    setEditingId(null);
  };

  return (
    <div className="task-list">
      <h2>Tasks</h2>
      {tasks.map((task) => (
        <div key={task.id} className={`task-card ${task.status === "completed" ? "completed" : ""}`}>

          {/* EDIT MODE */}
          {editingId === task.id ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                className="edit-input"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                placeholder="Title"
              />
              <input
                className="edit-input"
                value={editData.subject}
                onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                placeholder="Subject"
              />
              <input
                className="edit-input"
                type="date"
                value={editData.deadline}
                onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
              />
              <input
                className="edit-input"
                type="number"
                value={editData.estimatedTime}
                onChange={(e) => setEditData({ ...editData, estimatedTime: e.target.value })}
                placeholder="Estimated hours"
              />
              <div className="task-buttons">
                <button className="btn-start" onClick={() => handleEditSave(task.id)}>💾 Save</button>
                <button className="btn-complete" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>

          ) : (
            <>
              <h3>{task.title} {task.status === "completed" && "✅"}</h3>
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
      ))}
    </div>
  );
}