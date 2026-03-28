import { useState } from "react";
import { auth } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      if (err.code === "auth/user-not-found") setError("No account found with this email.");
      else if (err.code === "auth/wrong-password") setError("Incorrect password.");
      else if (err.code === "auth/email-already-in-use") setError("Email already in use.");
      else if (err.code === "auth/weak-password") setError("Password must be at least 6 characters.");
      else if (err.code === "auth/invalid-email") setError("Invalid email address.");
      else setError(err.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg("✅ Password reset email sent! Check your inbox.");
    } catch (err) {
      if (err.code === "auth/user-not-found") setError("No account found with this email.");
      else if (err.code === "auth/invalid-email") setError("Invalid email address.");
      else setError(err.message);
    }
  };

  // Forgot Password Screen
  if (isForgot) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">📱 Reality Planner</h1>
          <p className="auth-subtitle">Enter your email to reset your password</p>

          <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
            {error && <p className="auth-error">{error}</p>}
            {msg && <p style={{ color: "var(--success)", fontSize: "13px", fontWeight: "600" }}>{msg}</p>}
            <button type="submit" className="auth-btn">
              📧 Send Reset Email
            </button>
          </form>

          <div className="auth-switch">
            Remember your password?
            <span onClick={() => { setIsForgot(false); setError(""); setMsg(""); }}>
              Sign In
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Login / Signup Screen
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">📱 Reality Planner</h1>
        <p className="auth-subtitle">
          {isLogin ? "Sign in to your account" : "Create a new account"}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />
          {error && <p className="auth-error">{error}</p>}
          {msg && <p style={{ color: "var(--success)", fontSize: "13px", fontWeight: "600" }}>{msg}</p>}
          <button type="submit" className="auth-btn">
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Forgot Password link — only show on login */}
        {isLogin && (
          <p style={{ textAlign: "center", marginTop: "12px", fontSize: "13px" }}>
            <span
              onClick={() => { setIsForgot(true); setError(""); setMsg(""); }}
              style={{ color: "var(--accent)", cursor: "pointer", fontWeight: "600" }}
            >
              Forgot Password?
            </span>
          </p>
        )}

        <div className="auth-switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => { setIsLogin(!isLogin); setError(""); setMsg(""); }}>
            {isLogin ? "Sign Up" : "Sign In"}
          </span>
        </div>
      </div>
    </div>
  );
}