import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentRegister from "./pages/StudentRegister";
import StudentDashboard from "./pages/StudentDashboard";
import SubmitProject from "./pages/SubmitProject";
import TeacherDashboard from "./pages/TeacherDashboard";
import MyProjects from "./pages/MyProjects";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<StudentRegister />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/submit-project" element={<SubmitProject />} />
        <Route path="/my-projects" element={<MyProjects />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;