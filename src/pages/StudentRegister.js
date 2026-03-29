import API_BASE from "../api";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles.css";

function StudentRegister() {
  const navigate = useNavigate();
  const [student, setStudent] = useState({
    name: "", email: "", password: "", branch: "", section: "", rollNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setStudent({ ...student, [e.target.name]: e.target.value });

  const registerStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/students/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate("/"), 1800);
    } catch {
      setError("Registration failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-icon">📝</div>
          <h1>Join the<br /><span>Project Portal</span></h1>
          <p>Register your student account to start submitting projects and tracking your evaluation progress.</p>
        </div>
        <div className="auth-features">
          {[
            "One-time registration with roll number",
            "Submit projects anytime from dashboard",
            "Get marks & remarks from faculty",
            "AI evaluation for instant feedback",
          ].map((f) => (
            <div className="auth-feature-item" key={f}>
              <div className="feat-dot" /> {f}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box" style={{ maxWidth: 460 }}>
          <h2>Create Account</h2>
          <p className="auth-subtitle">Fill in your details to get started</p>

          {success && (
            <div style={{
              background: "rgba(11,163,96,.1)", border: "1px solid rgba(11,163,96,.3)",
              borderRadius: "8px", padding: "12px 16px", marginBottom: "16px",
              color: "var(--success)", fontSize: ".87rem", fontWeight: 600, textAlign: "center"
            }}>
              ✅ Registered successfully! Redirecting to login…
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(192,57,43,.08)", border: "1px solid rgba(192,57,43,.25)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "14px",
              color: "#C0392B", fontSize: ".85rem", fontWeight: 500
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={registerStudent}>
            <div className="field-group">
              <label className="field-label">Full Name</label>
              <input className="field-input" name="name" placeholder="e.g. Rahul Sharma"
                onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input className="field-input" name="email" type="email" placeholder="you@college.edu"
                onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label className="field-label">Password</label>
              <input className="field-input" name="password" type="password" placeholder="Create a password"
                onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="field-group">
                <label className="field-label">Branch</label>
                <input className="field-input" name="branch" placeholder="e.g. CSE"
                  onChange={handleChange} required />
              </div>
              <div className="field-group">
                <label className="field-label">Section</label>
                <input className="field-input" name="section" placeholder="e.g. A"
                  onChange={handleChange} required />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Roll Number</label>
              <input className="field-input" name="rollNumber" placeholder="e.g. 21CSE045"
                onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full"
              style={{ marginTop: "6px", padding: "13px" }} disabled={loading || success}>
              {loading ? "Creating Account…" : "Register"}
            </button>
          </form>

          <p className="auth-link-text">
            Already have an account? <Link to="/">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentRegister;
