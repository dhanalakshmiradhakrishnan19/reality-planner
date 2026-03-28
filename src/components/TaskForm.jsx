import { useState } from "react";
import { addTaskToDB } from "../services/taskService";
import { auth } from "../services/firebase";

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subject || !deadline || !estimatedTime) {
      alert("Please fill all fields");
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
      priority
    };
    try {
      await addTaskToDB(newTask, auth.currentUser.uid);
      setTitle("");
      setSubject("");
      setDeadline("");
      setEstimatedTime("");
      setPriority("medium");
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <input
        type="number"
        placeholder="Estimated hours"
        value={estimatedTime}
        onChange={(e) => setEstimatedTime(e.target.value)}
      />
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
      <button type="submit">+ Add Task</button>
    </form>
  );
}