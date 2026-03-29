import API_BASE from "../api";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles.css";

const safe = (val) => (!val || val === "null" || val === "undefined" ? "" : val);

function SubmitProject() {
  const navigate  = useNavigate();
  const studentId = safe(localStorage.getItem("studentId"));

  const [studentInfo, setStudentInfo] = useState({
    rollNumber: safe(localStorage.getItem("studentRoll")),
    branch:     safe(localStorage.getItem("studentBranch")),
    section:    safe(localStorage.getItem("studentSection")),
    name:       safe(localStorage.getItem("studentName")),
  });

  const [project, setProject] = useState({ title: "", abstractText: "", githubLink: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  // If fields are missing from localStorage, fetch fresh from backend
  useEffect(() => {
    const anyMissing = !studentInfo.rollNumber || !studentInfo.branch;
    if (studentId && anyMissing) {
      axios.get(`${API_BASE}/api/students/${studentId}`)
        .then(res => {
          const s = res.data;
          setStudentInfo({
            rollNumber: s.rollNumber || "",
            branch:     s.branch     || "",
            section:    s.section    || "",
            name:       s.name       || studentInfo.name,
          });
          if (s.rollNumber) localStorage.setItem("studentRoll",    s.rollNumber);
          if (s.branch)     localStorage.setItem("studentBranch",  s.branch);
          if (s.section)    localStorage.setItem("studentSection", s.section);
        })
        .catch(() => {});
    }
  }, [studentId]); // eslint-disable-line

  const handleChange = (e) => setProject({ ...project, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/projects/submit`, {
        ...project,
        branch:     studentInfo.branch,
        section:    studentInfo.section,
        rollNumber: studentInfo.rollNumber,
        student: { id: Number(studentId) },
      });
      setSuccess(true);
      setTimeout(() => navigate("/my-projects"), 1800);
    } catch {
      setError("Failed to submit project. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };
  const initials = studentInfo.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "S";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-dot">🎓</div>
          <span>Project <em>Portal</em></span>
        </div>
        <div className="topbar-right">
          <Link to="/student-dashboard" className="btn btn-ghost btn-sm"
            style={{ color: "rgba(255,255,255,.75)", borderColor: "rgba(255,255,255,.2)" }}>
            ← Dashboard
          </Link>
          <div className="topbar-user">
            <div className="topbar-avatar">{initials}</div>
          </div>
          <button className="btn btn-ghost btn-sm"
            style={{ color: "rgba(255,255,255,.75)", borderColor: "rgba(255,255,255,.2)" }}
            onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="page-header">
          <h1>Submit Project</h1>
          <p>Fill in your project details below. Your roll number, branch, and section are pre-filled.</p>
        </div>

        <div className="form-container">
          {/* Auto-filled student info */}
          <div className="card" style={{ marginBottom: "20px", padding: "16px 20px" }}>
            <p style={{
              fontSize: ".78rem", fontWeight: 600, textTransform: "uppercase",
              letterSpacing: ".06em", color: "var(--text-muted)", marginBottom: "10px",
              fontFamily: "var(--font-display)"
            }}>
              Your Details (auto-filled)
            </p>
            <div className="info-chips">
              <div className="info-chip">
                Roll No <span>{studentInfo.rollNumber || <em style={{ color: "#aaa", fontStyle: "normal" }}>not set</em>}</span>
              </div>
              <div className="info-chip">Branch <span>{studentInfo.branch || "—"}</span></div>
              <div className="info-chip">Section <span>{studentInfo.section || "—"}</span></div>
            </div>
            {!studentInfo.rollNumber && (
              <p style={{
                marginTop: "10px", fontSize: ".8rem", color: "var(--warning)",
                background: "rgba(217,119,6,.07)", padding: "8px 12px",
                borderRadius: "6px", border: "1px solid rgba(217,119,6,.2)"
              }}>
                ⚠️ Roll number not found.{" "}
                <Link to="/" style={{ color: "var(--blue-3)", fontWeight: 600 }}>
                  Log out and log in again
                </Link>{" "}
                to refresh your profile.
              </p>
            )}
          </div>

          <div className="card">
            {success && (
              <div style={{
                background: "rgba(11,163,96,.1)", border: "1px solid rgba(11,163,96,.3)",
                borderRadius: "8px", padding: "12px 16px", marginBottom: "18px",
                color: "var(--success)", fontSize: ".87rem", fontWeight: 600, textAlign: "center"
              }}>
                ✅ Project submitted successfully! Redirecting…
              </div>
            )}
            {error && (
              <div style={{
                background: "rgba(192,57,43,.08)", border: "1px solid rgba(192,57,43,.25)",
                borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
                color: "#C0392B", fontSize: ".85rem", fontWeight: 500
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
              <div className="field-group">
                <label className="field-label">Project Title</label>
                <input className="field-input" name="title"
                  placeholder="e.g. Smart Attendance System using Face Recognition"
                  onChange={handleChange} required />
              </div>
              <div className="field-group">
                <label className="field-label">GitHub / Drive Link</label>
                <input className="field-input" name="githubLink"
                  placeholder="https://github.com/username/project  OR  https://drive.google.com/…"
                  onChange={handleChange} required />
              </div>
              <div className="field-group">
                <label className="field-label">Project Abstract</label>
                <textarea className="field-input" name="abstractText"
                  placeholder="Briefly describe your project — its purpose, technologies used, and key features…"
                  onChange={handleChange} required />
              </div>
              <button type="submit" className="btn btn-primary btn-full"
                style={{ marginTop: "6px", padding: "13px" }} disabled={loading || success}>
                {loading ? "Submitting…" : "Submit Project →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmitProject;
