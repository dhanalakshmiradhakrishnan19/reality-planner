import { useState } from "react";
import { auth } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut
} from "firebase/auth";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

const isGmail = (email) => {
  return email.trim().toLowerCase().endsWith("@gmail.com");
};

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const emailInvalid = emailTouched && email.length > 0 && (!isValidEmail(email) || !isGmail(email));

  const getEmailError = () => {
    if (!emailTouched || email.length === 0) return null;
    if (!isValidEmail(email)) return "⚠️ Please enter a valid email address.";
    if (!isGmail(email)) return "⚠️ Only Gmail addresses are allowed (name@gmail.com).";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");

    if (!email) { setError("Please enter your email address."); return; }
    if (!isValidEmail(email)) { setError("Please enter a valid email address."); return; }
    if (!isGmail(email)) { setError("Only Gmail addresses are allowed."); return; }
    if (!password) { setError("Please enter your password."); return; }

    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (!result.user.emailVerified) {
          await signOut(auth);
          setIsVerifying(true);
          return;
        }
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(result.user);
        await signOut(auth);
        setMsg("✅ Account created! A verification link has been sent to " + email + ". Please check your inbox.");
        setTimeout(() => {
          setIsVerifying(true);
        }, 5000);
      }
    } catch (err) {
      if (err.code === "auth/user-not-found") setError("No account found with this email.");
      else if (err.code === "auth/wrong-password") setError("Incorrect password.");
      else if (err.code === "auth/email-already-in-use") setError("Email already in use. Please sign in.");
      else if (err.code === "auth/weak-password") setError("Password must be at least 6 characters.");
      else if (err.code === "auth/invalid-email") setError("Invalid email address.");
      else if (err.code === "auth/invalid-credential") setError("Incorrect email or password.");
      else setError(err.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");

    if (!email) { setError("Please enter your email address."); return; }
    if (!isValidEmail(email)) { setError("Please enter a valid email address."); return; }
    if (!isGmail(email)) { setError("Only Gmail addresses are allowed."); return; }

    try {
      await sendPasswordResetEmail(auth, email);
      setMsg("✅ Password reset email sent! Check your inbox.");
    } catch (err) {
      if (err.code === "auth/user-not-found") setError("No account found with this email.");
      else if (err.code === "auth/invalid-email") setError("Invalid email address.");
      else setError(err.message);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError(""); setMsg("");
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user);
      await signOut(auth);
      setMsg("✅ Verification email resent! Check your inbox.");
    } catch (err) {
      setError("Could not resend email. Please try again.");
    }
    setResendLoading(false);
  };

  // Email Verification Screen
  if (isVerifying) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>📧</div>
          <h1 className="auth-title">Verify Your Email</h1>
          <p style={{ color: "var(--text2)", fontSize: "14px", lineHeight: "1.6", marginBottom: "8px" }}>
            A verification link has been sent to:
          </p>
          <p style={{
            fontWeight: "700", fontSize: "14px", color: "var(--accent)",
            background: "rgba(124,107,255,0.1)", padding: "8px 16px",
            borderRadius: "8px", marginBottom: "20px", wordBreak: "break-all"
          }}>
            {email}
          </p>
          <p style={{ color: "var(--text2)", fontSize: "13px", lineHeight: "1.6", marginBottom: "24px" }}>
            Click the link in the email to verify your account, then come back and sign in.
          </p>

          {error && <p className="auth-error" style={{ marginBottom: "12px" }}>{error}</p>}
          {msg && <p style={{ color: "var(--success)", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>{msg}</p>}

          <button
            className="auth-btn"
            onClick={() => { setIsVerifying(false); setIsLogin(true); setError(""); setMsg(""); }}
            style={{ marginBottom: "12px" }}
          >
            ✅ I've Verified — Sign In
          </button>

          <button
            onClick={handleResendVerification}
            disabled={resendLoading}
            style={{
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text2)", padding: "10px 20px", borderRadius: "10px",
              fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%"
            }}
          >
            {resendLoading ? "Sending..." : "🔄 Resend Verification Email"}
          </button>
        </div>
      </div>
    );
  }

  // Forgot Password Screen
  if (isForgot) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">📱 Reality Planner</h1>
          <p className="auth-subtitle">Enter your Gmail to reset your password</p>

          <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <input
                type="email"
                placeholder="Gmail address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
                onBlur={() => setEmailTouched(true)}
                className="auth-input"
                style={{ border: emailInvalid ? "1.5px solid #f44336" : undefined }}
              />
              {getEmailError() && (
                <p style={{ color: "#f44336", fontSize: "12px", fontWeight: "600", margin: "0" }}>
                  {getEmailError()}
                </p>
              )}
            </div>

            {error && <p className="auth-error">{error}</p>}
            {msg && <p style={{ color: "var(--success)", fontSize: "13px", fontWeight: "600" }}>{msg}</p>}

            <button type="submit" className="auth-btn">📧 Send Reset Email</button>
          </form>

          <div className="auth-switch">
            Remember your password?
            <span onClick={() => { setIsForgot(false); setError(""); setMsg(""); setEmailTouched(false); }}>
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
        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text2)", marginBottom: "4px" }}>
          🔒 Gmail accounts only
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <input
              type="email"
              placeholder="Gmail address (name@gmail.com)"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
              onBlur={() => setEmailTouched(true)}
              className="auth-input"
              style={{ border: emailInvalid ? "1.5px solid #f44336" : undefined }}
            />
            {getEmailError() && (
              <p style={{ color: "#f44336", fontSize: "12px", fontWeight: "600", margin: "0" }}>
                {getEmailError()}
              </p>
            )}
          </div>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />

          {error && <p className="auth-error">{error}</p>}
          {msg && (
            <p style={{
              color: "var(--success)",
              fontSize: "13px",
              fontWeight: "600",
              background: "rgba(76,175,80,0.1)",
              border: "1px solid rgba(76,175,80,0.3)",
              padding: "12px 14px",
              borderRadius: "8px",
              lineHeight: "1.7",
              marginTop: "4px"
            }}>
              {msg}
            </p>
          )}

          <button type="submit" className="auth-btn">
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {isLogin && (
          <p style={{ textAlign: "center", marginTop: "12px", fontSize: "13px" }}>
            <span
              onClick={() => { setIsForgot(true); setError(""); setMsg(""); setEmailTouched(false); }}
              style={{ color: "var(--accent)", cursor: "pointer", fontWeight: "600" }}
            >
              Forgot Password?
            </span>
          </p>
        )}

        <div className="auth-switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => { setIsLogin(!isLogin); setError(""); setMsg(""); setEmailTouched(false); }}>
            {isLogin ? "Sign Up" : "Sign In"}
          </span>
        </div>
      </div>
    </div>
  );
}