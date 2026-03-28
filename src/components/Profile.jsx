import { useState } from "react";
import { auth } from "../services/firebase";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";

export default function Profile() {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateName = async () => {
    setMsg(""); setError(""); setLoading(true);
    try {
      await updateProfile(user, { displayName });
      setMsg("✅ Name updated successfully!");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    setMsg(""); setError(""); setLoading(true);
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setMsg("✅ Password changed successfully!");
      setCurrentPassword(""); setNewPassword("");
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setError("Current password is incorrect.");
      } else {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  const getInitial = () => {
    if (user?.displayName) return user.displayName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "?";
  };

  return (
    <div className="card">
      <h2>👤 Profile</h2>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent), var(--accent2))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "28px", fontWeight: "800", color: "white"
        }}>
          {getInitial()}
        </div>
        <div>
          <p style={{ fontWeight: "700", fontSize: "15px" }}>
            {user?.displayName || "No name set"}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text2)" }}>{user?.email}</p>
        </div>
      </div>

      {/* Display Name */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "var(--text2)" }}>
          DISPLAY NAME
        </p>
        <input
          className="edit-input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          style={{ marginBottom: "10px", width: "100%" }}
        />
        <button
          className="btn-edit"
          style={{ padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "700", cursor: "pointer" }}
          onClick={handleUpdateName}
          disabled={loading}
        >
          {loading ? "Saving..." : "💾 Save Name"}
        </button>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "20px 0" }} />

      {/* Change Password */}
      <div>
        <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "12px", color: "var(--text2)" }}>
          CHANGE PASSWORD
        </p>
        <input
          className="edit-input"
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={{ marginBottom: "8px", width: "100%" }}
        />
        <input
          className="edit-input"
          type="password"
          placeholder="New password (min 6 chars)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ marginBottom: "12px", width: "100%" }}
        />
        <button
          className="btn-start"
          style={{ padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "700", cursor: "pointer" }}
          onClick={handleChangePassword}
          disabled={loading}
        >
          {loading ? "Updating..." : "🔒 Change Password"}
        </button>
      </div>

      {msg && <p style={{ marginTop: "16px", color: "var(--success)", fontSize: "13px", fontWeight: "600" }}>{msg}</p>}
      {error && <p style={{ marginTop: "16px", color: "var(--danger)", fontSize: "13px" }}>{error}</p>}
    </div>
  );
}