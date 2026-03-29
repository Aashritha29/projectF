import { Link, useNavigate } from "react-router-dom";
import "../styles.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const name    = localStorage.getItem("studentName")    || "Student";
  const branch  = localStorage.getItem("studentBranch")  || "";
  const section = localStorage.getItem("studentSection") || "";
  const roll    = localStorage.getItem("studentRoll")    || "";

  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-dot">🎓</div>
          <span>Project <em>Portal</em></span>
        </div>
        <div className="topbar-right">
          <div className="topbar-user">
            <div className="topbar-avatar">{initials}</div>
            <span>{name}</span>
          </div>
          <button className="btn btn-ghost btn-sm"
            style={{ color: "rgba(255,255,255,.75)", borderColor: "rgba(255,255,255,.2)" }}
            onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="student-hero">
        <div className="student-hero-header">
          <h1>Hello, {name.split(" ")[0]} 👋</h1>
          <p>Manage your project submissions and track evaluation status from here.</p>
          <div className="info-chips" style={{ justifyContent: "center", marginTop: "14px" }}>
            {roll    && <div className="info-chip">Roll No <span>{roll}</span></div>}
            {branch  && <div className="info-chip">Branch <span>{branch}</span></div>}
            {section && <div className="info-chip">Section <span>{section}</span></div>}
          </div>
        </div>

        <div className="student-cards">
          <Link to="/submit-project" className="dash-card">
            <div className="dash-icon submit">📤</div>
            <h3>Submit Project</h3>
            <p>Upload your project title, abstract, and GitHub / Drive link for evaluation.</p>
          </Link>

          <Link to="/my-projects" className="dash-card">
            <div className="dash-icon view">📂</div>
            <h3>My Projects</h3>
            <p>View all your submissions, check status, marks, AI feedback, and suggestions.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
