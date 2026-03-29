import API_BASE from "../api";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles.css";

const STATUS_STEPS = ["SUBMITTED", "UNDER_REVIEW", "EVALUATED"];

function StatusTracker({ status }) {
  const idx = STATUS_STEPS.indexOf(status);
  const labels = ["Submitted", "Under Review", "Evaluated"];
  const icons  = ["📤", "🔍", "✅"];
  return (
    <div className="status-tracker">
      {STATUS_STEPS.map((s, i) => {
        const done = i < idx, active = i === idx;
        return (
          <div className="tracker-step" key={s}>
            <div className="tracker-node">
              <div className={`tracker-circle ${done ? "done" : active ? "active" : ""}`}>
                {done ? "✓" : icons[i]}
              </div>
              <div className={`tracker-label ${done ? "done" : active ? "active" : ""}`}>
                {labels[i]}
              </div>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`tracker-line ${done ? "done" : active ? "active" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function getBadge(status) {
  if (status === "SUBMITTED")    return <span className="badge badge-submitted">Submitted</span>;
  if (status === "UNDER_REVIEW") return <span className="badge badge-review">Under Review</span>;
  if (status === "EVALUATED")    return <span className="badge badge-evaluated">Evaluated</span>;
  return <span className="badge">{status}</span>;
}

function ScoreBreakdown({ ideaScore, codeScore, docScore, implScore }) {
  const bars = [
    { label: "Project Idea",   score: ideaScore, max: 20, color: "var(--blue-1)" },
    { label: "Code Quality",   score: codeScore, max: 30, color: "var(--blue-2)" },
    { label: "Documentation",  score: docScore,  max: 20, color: "var(--blue-3)" },
    { label: "Implementation", score: implScore, max: 30, color: "var(--blue-4)" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
      {bars.map(b => {
        const pct = b.score != null ? Math.round((b.score / b.max) * 100) : 0;
        return (
          <div key={b.label}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: ".78rem", fontWeight: 600, marginBottom: "4px",
              fontFamily: "var(--font-display)", color: "var(--text-primary)"
            }}>
              <span>{b.label}</span>
              <span style={{ color: b.color }}>
                {b.score != null ? b.score : "—"}
                <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>/{b.max}</span>
              </span>
            </div>
            <div style={{ height: "7px", background: "var(--border)", borderRadius: "100px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct}%`, background: b.color,
                borderRadius: "100px", transition: "width .6s cubic-bezier(.4,0,.2,1)"
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SuggestionsList({ suggestions }) {
  if (!suggestions) return null;
  const items = suggestions.split("|").map(s => s.trim()).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div style={{
      marginTop: "14px", background: "rgba(0,180,216,.05)",
      border: "1px solid rgba(0,180,216,.2)", borderRadius: "10px", padding: "14px 16px"
    }}>
      <p style={{
        fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: ".07em", color: "var(--blue-2)", marginBottom: "10px",
        fontFamily: "var(--font-display)"
      }}>
        ✨ AI Improvement Suggestions
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
        {items.map((tip, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "9px",
            fontSize: ".85rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
            <span style={{
              width: "20px", height: "20px", borderRadius: "50%",
              background: "var(--blue-1)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".68rem", fontWeight: 700, flexShrink: 0, fontFamily: "var(--font-display)"
            }}>
              {i + 1}
            </span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MyProjects() {
  const navigate  = useNavigate();
  const studentId = localStorage.getItem("studentId");
  const name      = localStorage.getItem("studentName") || "Student";
  const initials  = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editId,   setEditId]   = useState(null);
  const [editData, setEditData] = useState({});
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);

  // ✅ Declared BEFORE useEffect so ESLint doesn't complain
  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

useEffect(() => {
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/projects/student/${studentId}`);
      setProjects(res.data);
    } catch {
      showToast("Failed to load projects.", "error");
    } finally {
      setLoading(false);
    }
  };

  fetchProjects();
}, []);

  // ✅ useEffect comes AFTER fetchProjects is defined
  useEffect(() => {
  const load = async () => {
    await fetchProjects();
  };
  load();
}, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = (p) => {
    setEditId(p.id);
    setEditData({ title: p.title, githubLink: p.githubLink, abstractText: p.abstractText });
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/api/projects/edit/${id}`, editData);
      showToast("Project updated.", "success");
      setEditId(null);
      fetchProjects();
    } catch {
      showToast("Update failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

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
            <span>{name}</span>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: "rgba(255,255,255,.75)", borderColor: "rgba(255,255,255,.2)" }}
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </header>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      <div className="page-content">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>My Projects</h1>
            <p>Track your submissions, scores, AI feedback, and improvement suggestions.</p>
          </div>
          <Link to="/submit-project" className="btn btn-primary btn-sm">+ Submit New</Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <div className="ai-loading" style={{ justifyContent: "center", gap: "8px" }}>
              <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
            </div>
            <p style={{ marginTop: "12px", fontSize: ".87rem" }}>Loading your projects…</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>No projects yet</h3>
              <p>Submit your first project to get started!</p>
              <Link to="/submit-project" className="btn btn-primary btn-sm" style={{ marginTop: "14px" }}>
                Submit Project
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {projects.map(p => (
              <div className="card" key={p.id}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    {editId === p.id ? (
                      <input
                        className="field-input"
                        value={editData.title}
                        onChange={e => setEditData({ ...editData, title: e.target.value })}
                        style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "6px" }}
                      />
                    ) : (
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.08rem",
                        fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                        {p.title}
                      </h3>
                    )}
                    <div className="info-chips">
                      {p.rollNumber && <div className="info-chip">Roll No <span>{p.rollNumber}</span></div>}
                      {p.submissionDate && (
                        <div className="info-chip">
                          Submitted <span>{new Date(p.submissionDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {getBadge(p.status)}
                    {p.status === "SUBMITTED" && editId !== p.id && (
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(p)}>✏️ Edit</button>
                    )}
                    {editId === p.id && (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => saveEdit(p.id)} disabled={saving}>
                          {saving ? "Saving…" : "Save"}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                      </>
                    )}
                  </div>
                </div>

                <StatusTracker status={p.status} />
                <div className="divider" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <p style={{ fontSize: ".73rem", fontWeight: 600, textTransform: "uppercase",
                      letterSpacing: ".06em", color: "var(--text-muted)", fontFamily: "var(--font-display)", marginBottom: "6px" }}>
                      Project Link
                    </p>
                    {editId === p.id ? (
                      <input
                        className="field-input"
                        value={editData.githubLink}
                        onChange={e => setEditData({ ...editData, githubLink: e.target.value })}
                      />
                    ) : (
                      <a href={p.githubLink} target="_blank" rel="noreferrer" className="table-link">
                        🔗 Open Project
                      </a>
                    )}
                  </div>
                  {p.marks != null && (
                    <div>
                      <p style={{ fontSize: ".73rem", fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: ".06em", color: "var(--text-muted)", fontFamily: "var(--font-display)", marginBottom: "6px" }}>
                        Total Score
                      </p>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem",
                        fontWeight: 800, color: "var(--blue-3)", lineHeight: 1 }}>
                        {p.marks}
                        <span style={{ fontSize: ".9rem", fontWeight: 400, color: "var(--text-muted)" }}>/100</span>
                      </span>
                    </div>
                  )}
                </div>

                {p.status === "EVALUATED" && (p.ideaScore != null || p.codeScore != null) && (
                  <div style={{ marginTop: "16px" }}>
                    <p style={{ fontSize: ".73rem", fontWeight: 600, textTransform: "uppercase",
                      letterSpacing: ".06em", color: "var(--text-muted)", fontFamily: "var(--font-display)", marginBottom: "10px" }}>
                      Score Breakdown
                    </p>
                    <ScoreBreakdown
                      ideaScore={p.ideaScore} codeScore={p.codeScore}
                      docScore={p.docScore}   implScore={p.implScore}
                    />
                  </div>
                )}

                {editId === p.id && (
                  <div className="field-group" style={{ marginTop: "12px" }}>
                    <label className="field-label">Abstract</label>
                    <textarea
                      className="field-input"
                      value={editData.abstractText}
                      onChange={e => setEditData({ ...editData, abstractText: e.target.value })}
                    />
                  </div>
                )}

                {p.remarks && (
                  <div style={{
                    marginTop: "14px", background: "rgba(0,150,199,.06)",
                    borderLeft: "3px solid var(--blue-2)", padding: "12px 14px",
                    borderRadius: "0 8px 8px 0"
                  }}>
                    <p style={{ fontSize: ".72rem", fontWeight: 600, textTransform: "uppercase",
                      letterSpacing: ".06em", color: "var(--blue-3)", fontFamily: "var(--font-display)", marginBottom: "5px" }}>
                      Faculty Review
                    </p>
                    <p style={{ fontSize: ".88rem", color: "var(--text-primary)", lineHeight: 1.6 }}>
                      {p.remarks}
                    </p>
                  </div>
                )}

                <SuggestionsList suggestions={p.suggestions} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyProjects;
