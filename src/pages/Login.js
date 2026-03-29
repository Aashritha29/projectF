import API_BASE from "../api";
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles.css";

const store = (key, value) => {
  if (value !== null && value !== undefined) {
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
  }
};

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (role === "teacher") {
      setTimeout(() => {
        if (email === "teacher@college.com" && password === "teacher123") {
          navigate("/teacher");
        } else {
          setError("Invalid teacher credentials. Please try again.");
          setLoading(false);
        }
      }, 500);
    } else {
      try {
        const res = await axios.post(`${API_BASE}/api/students/login`, { email, password });
        const s = res.data;
        store("studentId",      s.id);
        store("studentName",    s.name);
        store("studentBranch",  s.branch);
        store("studentSection", s.section);
        store("studentRoll",    s.rollNumber);
        navigate("/student-dashboard");
      } catch {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-icon">🎓</div>
          <h1>Smart Project<br /><span>Submission Portal</span></h1>
          <p>A centralized academic platform for project submission, peer review, and AI-powered evaluation.</p>
        </div>
        <div className="auth-features">
          {[
            "Submit GitHub or Drive project links",
            "Track review status in real-time",
            "AI-powered automated evaluation",
            "Faculty dashboard with export",
          ].map((f) => (
            <div className="auth-feature-item" key={f}>
              <div className="feat-dot" /> {f}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue to your portal</p>

          <div className="role-selector">
            <button type="button" className={`role-btn ${role === "student" ? "active" : ""}`}
              onClick={() => { setRole("student"); setError(""); }}>
              🎓 Student
            </button>
            <button type="button" className={`role-btn ${role === "teacher" ? "active" : ""}`}
              onClick={() => { setRole("teacher"); setError(""); }}>
              📋 Teacher
            </button>
          </div>

          {error && (
            <div style={{
              background: "rgba(192,57,43,.08)", border: "1px solid rgba(192,57,43,.25)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "14px",
              color: "#C0392B", fontSize: ".85rem", fontWeight: 500
            }}>
              ⚠️ {error}
            </div>
          )}

          {role === "teacher" && (
            <div style={{
              background: "rgba(0,180,216,.07)", border: "1px solid rgba(0,180,216,.2)",
              borderRadius: "8px", padding: "9px 13px", marginBottom: "14px",
              fontSize: ".8rem", color: "var(--text-secondary)"
            }}>
              💡 Demo: <strong>teacher@college.com</strong> / <strong>teacher123</strong>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input className="field-input" type="email"
                placeholder={role === "teacher" ? "teacher@college.com" : "you@college.edu"}
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field-group">
              <label className="field-label">Password</label>
              <input className="field-input" type="password" placeholder="Enter your password"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full"
              style={{ marginTop: "8px", padding: "13px" }} disabled={loading}>
              {loading ? "Signing in…" : `Sign In as ${role === "teacher" ? "Teacher" : "Student"}`}
            </button>
          </form>

          <p className="auth-link-text">
            New student? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
