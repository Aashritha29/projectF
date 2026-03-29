import React from "react";
import API_BASE from "../api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles.css";
import { useCallback } from "react";
const studentId = localStorage.getItem("studentId");

function getBadge(status) {
  if (status === "SUBMITTED")    return <span className="badge badge-submitted">Submitted</span>;
  if (status === "UNDER_REVIEW") return <span className="badge badge-review">Under Review</span>;
  if (status === "EVALUATED")    return <span className="badge badge-evaluated">Evaluated</span>;
  return <span className="badge">{status}</span>;
}

function MiniScoreBar({ score, max, color }) {
  const pct = score != null ? Math.round((score / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "80px" }}>
      <div style={{ flex: 1, height: "5px", background: "var(--border)", borderRadius: "100px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "100px" }} />
      </div>
      <span style={{ fontSize: ".75rem", fontWeight: 700, color, fontFamily: "var(--font-display)", minWidth: "26px" }}>
        {score != null ? score : "—"}
      </span>
    </div>
  );
}

function SimilarityBadge({ warning }) {
  if (!warning) return null;
  const isHigh = warning.includes("⚠") || warning.includes("💡");
  return (
    <div style={{
      marginTop: "4px", padding: "5px 10px",
      background: isHigh ? "rgba(217,119,6,.1)" : "rgba(0,180,216,.08)",
      border: `1px solid ${isHigh ? "rgba(217,119,6,.3)" : "rgba(0,180,216,.2)"}`,
      borderRadius: "8px", fontSize: ".75rem", fontWeight: 500,
      color: isHigh ? "var(--warning)" : "var(--text-secondary)",
      lineHeight: 1.4, maxWidth: "320px"
    }}>
      {warning}
    </div>
  );
}

function TeacherDashboard() {
  const navigate = useNavigate();

  const [projects,    setProjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [aiLoading,   setAiLoading]   = useState({});
  const [simLoading,  setSimLoading]  = useState({});
  const [toast,       setToast]       = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [evalModal,   setEvalModal]   = useState(null);
  const [filters,     setFilters]     = useState({ status: "", branch: "", section: "", search: "" });

  // ✅ showToast declared first — used by fetchProjects
  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };



const fetchProjects = useCallback(async () => {
  setLoading(true);
  try {
    const res = await axios.get(`${API_BASE}/api/projects/student/${studentId}`);
    setProjects(res.data);
  } catch {
    showToast("Failed to load projects.", "error");
  } finally {
    setLoading(false);
  }
}, [studentId]);
useEffect(() => {
  fetchProjects();
}, [fetchProjects]);


  const markUnderReview = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/projects/review/${id}`);
      showToast("Marked as Under Review.", "success");
      fetchProjects();
    } catch {
      showToast("Failed to update status.", "error");
    }
  };

  const evaluateProject = async () => {
    if (!evalModal) return;
    try {
      await axios.put(`${API_BASE}/api/projects/evaluate/${evalModal.id}`, {
        marks: parseInt(evalModal.marks),
        remarks: evalModal.remarks,
      });
      showToast("Project evaluated.", "success");
      setEvalModal(null);
      fetchProjects();
    } catch {
      showToast("Evaluation failed.", "error");
    }
  };

  const aiEvaluate = async (id) => {
    setAiLoading(prev => ({ ...prev, [id]: true }));
    try {
      await axios.post(`${API_BASE}/api/projects/ai-evaluate/${id}`);
      showToast("✨ AI Evaluation complete! Scores, review, and suggestions saved.", "success");
      fetchProjects();
    } catch (err) {
      const msg = err?.response?.data?.error || "AI evaluation failed.";
      showToast(msg, "error");
    } finally {
      setAiLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const recheckSimilarity = async (id) => {
    setSimLoading(prev => ({ ...prev, [id]: true }));
    try {
      await axios.post(`${API_BASE}/api/projects/check-similarity/${id}`);
      showToast("Similarity check complete.", "success");
      fetchProjects();
    } catch (err) {
      const msg = err?.response?.data?.error || "Similarity check failed.";
      showToast(msg, "error");
    } finally {
      setSimLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const exportCSV = () => {
    const headers = [
      "Roll No", "Title", "Branch", "Section", "Status",
      "Marks", "Idea/20", "Code/30", "Doc/20", "Impl/30",
      "Remarks", "Suggestions", "Similarity Warning", "Submitted"
    ];
    const rows = filtered.map(p => [
      p.rollNumber, `"${p.title}"`, p.branch, p.section, p.status,
      p.marks ?? "", p.ideaScore ?? "", p.codeScore ?? "", p.docScore ?? "", p.implScore ?? "",
      `"${(p.remarks || "").replace(/"/g, "'")}"`,
      `"${(p.suggestions || "").replace(/"/g, "'")}"`,
      `"${(p.similarityWarning || "").replace(/"/g, "'")}"`,
      p.submissionDate ? new Date(p.submissionDate).toLocaleDateString() : ""
    ]);
    const csv  = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "projects.csv"; a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported.", "success");
  };

  const filtered = projects.filter(p => {
    const s = filters.search.toLowerCase();
    return (
      (!filters.status  || p.status === filters.status) &&
      (!filters.branch  || (p.branch  || "").toLowerCase().includes(filters.branch.toLowerCase())) &&
      (!filters.section || (p.section || "").toLowerCase().includes(filters.section.toLowerCase())) &&
      (!s || (p.rollNumber || "").toLowerCase().includes(s) ||
             (p.title      || "").toLowerCase().includes(s))
    );
  });

  const total     = projects.length;
  const submitted = projects.filter(p => p.status === "SUBMITTED").length;
  const review    = projects.filter(p => p.status === "UNDER_REVIEW").length;
  const evaluated = projects.filter(p => p.status === "EVALUATED").length;
  const flagged   = projects.filter(p => p.similarityWarning).length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-dot">📋</div>
          <span>Project <em>Portal</em> — Faculty</span>
        </div>
        <div className="topbar-right">
          <div className="topbar-user">
            <div className="topbar-avatar">TC</div>
            <span>Teacher</span>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: "rgba(255,255,255,.75)", borderColor: "rgba(255,255,255,.2)" }}
            onClick={() => navigate("/")}
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

      {evalModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(3,4,94,.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
        }}>
          <div className="card" style={{ width: 420, maxWidth: "90vw" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", marginBottom: "18px" }}>
              Manual Evaluation
            </h3>
            <div className="field-group">
              <label className="field-label">Marks (out of 100)</label>
              <input
                className="field-input" type="number" min="0" max="100" placeholder="e.g. 82"
                value={evalModal.marks}
                onChange={e => setEvalModal({ ...evalModal, marks: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Remarks</label>
              <textarea
                className="field-input" placeholder="Write your feedback…"
                value={evalModal.remarks}
                onChange={e => setEvalModal({ ...evalModal, remarks: e.target.value })}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={evaluateProject}>
                Submit Evaluation
              </button>
              <button className="btn btn-ghost" onClick={() => setEvalModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-content">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>Teacher Dashboard</h1>
            <p>Review, evaluate, and track all student project submissions with AI assistance.</p>
          </div>
          <button className="btn btn-accent btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "14px", marginBottom: "22px" }}>
          {[
            { label: "Total",        value: total,     icon: "📁", cls: "c1", warn: false },
            { label: "Submitted",    value: submitted, icon: "📤", cls: "c2", warn: false },
            { label: "Under Review", value: review,    icon: "🔍", cls: "c3", warn: false },
            { label: "Evaluated",    value: evaluated, icon: "✅", cls: "c4", warn: false },
            { label: "AI Flagged",   value: flagged,   icon: "⚠️", cls: "c1", warn: flagged > 0 },
          ].map(s => (
            <div className="stat-card" key={s.label}
              style={{ borderColor: s.warn ? "rgba(217,119,6,.35)" : undefined }}>
              <div className={`stat-icon ${s.cls}`}
                style={{ background: s.warn ? "rgba(217,119,6,.12)" : undefined }}>
                {s.icon}
              </div>
              <div className="stat-info">
                <div className="stat-value" style={{ color: s.warn ? "var(--warning)" : undefined }}>
                  {s.value}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="filter-group" style={{ flex: 2, minWidth: 180 }}>
            <label className="filter-label">Search</label>
            <input
              className="filter-input" placeholder="Roll number or title…"
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select className="filter-input" value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="EVALUATED">Evaluated</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Branch</label>
            <input className="filter-input" placeholder="e.g. CSE"
              value={filters.branch}
              onChange={e => setFilters({ ...filters, branch: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Section</label>
            <input className="filter-input" placeholder="e.g. A"
              value={filters.section}
              onChange={e => setFilters({ ...filters, section: e.target.value })}
            />
          </div>
          <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-end" }}
            onClick={() => setFilters({ status: "", branch: "", section: "", search: "" })}>
            Clear
          </button>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
              <div className="ai-loading" style={{ justifyContent: "center", gap: "8px", marginBottom: "10px" }}>
                <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
              </div>
              Loading submissions…
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No matching projects</h3>
              <p>Try adjusting your filters.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Title &amp; Warnings</th>
                  <th>Branch / Sec</th>
                  <th>Link</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Breakdown</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
  {filtered.map(p => (
    <React.Fragment key={p.id}>
      <tr
        style={{ cursor: "pointer" }}
        onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
      >
        <td style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {p.rollNumber || <span style={{ color: "var(--text-muted)" }}>—</span>}
        </td>
        <td style={{ maxWidth: 220 }}>
          <div style={{ fontWeight: 600, fontSize: ".88rem" }}>{p.title}</div>
          <SimilarityBadge warning={p.similarityWarning} />
        </td>
        <td style={{ fontSize: ".83rem" }}>
          <strong>{p.branch || "—"}</strong> / {p.section || "—"}
        </td>
        <td onClick={e => e.stopPropagation()}>
          <a href={p.githubLink} target="_blank" rel="noreferrer" className="table-link">
            🔗 Open
          </a>
        </td>
        <td>{getBadge(p.status)}</td>
        <td>
          {p.marks != null
            ? <span className="marks-value">
                {p.marks}
                <span style={{ fontSize: ".7rem", fontWeight: 400, color: "var(--text-muted)" }}>/100</span>
              </span>
            : <span style={{ color: "var(--text-muted)", fontSize: ".82rem" }}>—</span>
          }
        </td>
        <td style={{ minWidth: 140 }}>
          {p.status === "EVALUATED" && p.ideaScore != null ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <MiniScoreBar score={p.ideaScore} max={20} color="var(--blue-1)" />
              <MiniScoreBar score={p.codeScore} max={30} color="var(--blue-2)" />
              <MiniScoreBar score={p.docScore}  max={20} color="var(--blue-3)" />
              <MiniScoreBar score={p.implScore} max={30} color="var(--blue-4)" />
            </div>
          ) : (
            <span style={{ color: "var(--text-muted)", fontSize: ".8rem" }}>—</span>
          )}
        </td>
        <td style={{ fontSize: ".8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {p.submissionDate ? new Date(p.submissionDate).toLocaleDateString() : "—"}
        </td>
        <td onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {p.status === "SUBMITTED" && (
              <button className="btn btn-outline btn-sm" onClick={() => markUnderReview(p.id)}>
                Review
              </button>
            )}
            {p.status !== "EVALUATED" && (
              <>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setEvalModal({ id: p.id, marks: "", remarks: "" })}
                >
                  Evaluate
                </button>
                <button
                  className="btn btn-accent btn-sm"
                  onClick={() => aiEvaluate(p.id)}
                  disabled={aiLoading[p.id]}
                >
                  {aiLoading[p.id]
                    ? <span className="ai-loading">
                        <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
                      </span>
                    : "✨ AI"}
                </button>
              </>
            )}
            <button
              className="btn btn-ghost btn-sm"
              title="Re-run similarity check"
              onClick={() => recheckSimilarity(p.id)}
              disabled={simLoading[p.id]}
            >
              {simLoading[p.id]
                ? <span className="ai-loading"><div className="ai-dot" /><div className="ai-dot" /></span>
                : "🔍"}
            </button>
            {p.status === "EVALUATED" && (
              <span style={{ fontSize: ".8rem", color: "var(--success)", fontWeight: 600, padding: "6px 2px" }}>
                ✅ Done
              </span>
            )}
          </div>
        </td>
      </tr>

      {expandedRow === p.id && (
        <tr style={{ background: "rgba(0,150,199,.03)" }}>
          <td colSpan={9} style={{ padding: "0 16px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", paddingTop: "12px" }}>
              {p.remarks && (
                <div>
                  <p style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: ".07em", color: "var(--blue-3)", fontFamily: "var(--font-display)", marginBottom: "7px" }}>
                    AI Review
                  </p>
                  <p style={{ fontSize: ".87rem", color: "var(--text-primary)", lineHeight: 1.6 }}>
                    {p.remarks}
                  </p>
                </div>
              )}
              {p.suggestions && (
                <div>
                  <p style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: ".07em", color: "var(--blue-2)", fontFamily: "var(--font-display)", marginBottom: "7px" }}>
                    ✨ AI Suggestions
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0,
                    display: "flex", flexDirection: "column", gap: "6px" }}>
                    {p.suggestions.split("|").map(s => s.trim()).filter(Boolean).map((tip, i) => (
                      <li key={i} style={{ display: "flex", gap: "8px",
                        fontSize: ".84rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
                        <span style={{
                          width: "18px", height: "18px", borderRadius: "50%",
                          background: "var(--blue-1)", color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: ".65rem", fontWeight: 700, flexShrink: 0
                        }}>{i + 1}</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!p.remarks && !p.suggestions && (
                <p style={{ color: "var(--text-muted)", fontSize: ".85rem", gridColumn: "1/-1" }}>
                  No AI evaluation yet. Click ✨ AI to run evaluation.
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>
            </table>
          )}
        </div>

        <p style={{ marginTop: "10px", fontSize: ".78rem", color: "var(--text-muted)", textAlign: "right" }}>
          Showing {filtered.length} of {total} project{total !== 1 ? "s" : ""}
          {flagged > 0 && (
            <span style={{ marginLeft: "12px", color: "var(--warning)", fontWeight: 600 }}>
              ⚠ {flagged} flagged by AI
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export default TeacherDashboard;
