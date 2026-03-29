import { useState } from "react";
import { addTaskToDB } from "../services/taskService";
import { auth } from "../services/firebase";
import { useToast } from "../context/ToastContext";

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subject || !deadline || !estimatedTime) {
      showToast("Please fill all fields", "error");
      return;
    }
    const newTask = {
      title,
      subject,
      deadline,
      estimatedTime: Number(estimatedTime),
      actualTime: 0,
      sessions: [],
      createdAt: new Date(),
      status: "pending",
      priority,
      notes: notes.trim()
    };
    try {
      await addTaskToDB(newTask, auth.currentUser.uid);
      showToast("Task added successfully!", "success");
      setTitle("");
      setSubject("");
      setDeadline("");
      setEstimatedTime("");
      setPriority("medium");
      setNotes("");
      setShowNotes(false);
    } catch (error) {
      showToast("Failed to add task. Try again.", "error");
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      <input type="number" placeholder="Estimated hours" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        style={{
          background: "var(--bg3)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          padding: "10px 14px",
          borderRadius: "10px",
          fontSize: "14px",
          cursor: "pointer"
        }}
      >
        <option value="high">🔴 High Priority</option>
        <option value="medium">🟡 Medium Priority</option>
        <option value="low">🟢 Low Priority</option>
      </select>

      {/* Add Notes toggle */}
      <button
        type="button"
        onClick={() => setShowNotes(!showNotes)}
        style={{
          background: "var(--bg3)",
          color: "var(--text2)",
          border: "1px solid var(--border)",
          padding: "10px 14px",
          borderRadius: "10px",
          fontSize: "14px",
          cursor: "pointer",
          fontWeight: "600"
        }}
      >
        {showNotes ? "➖ Hide Notes" : "📝 Add Notes"}
      </button>

      <button type="submit">+ Add Task</button>

      {/* Notes textarea — full width */}
      {showNotes && (
        <textarea
          placeholder="Add notes, links, or instructions for this task..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          style={{
            background: "var(--bg3)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            padding: "10px 14px",
            borderRadius: "10px",
            fontSize: "14px",
            resize: "vertical",
            fontFamily: "inherit",
            gridColumn: "span 2",
            width: "100%"
          }}
        />
      )}
    </form>
  );
}