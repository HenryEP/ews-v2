import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import OwnerDashboard from "./pages/owner/Dashboard";
import OwnerProjects from "./pages/owner/Projects";
import ProjectNew from "./pages/owner/ProjectNew";
import ProjectDetail from "./pages/owner/ProjectDetail";
import FinanceDashboard from "./pages/finance/Dashboard";
import FinanceProjects from "./pages/finance/Projects";
import SiteManagerDashboard from "./pages/site-manager/Dashboard";

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "owner": return <Navigate to="/owner" replace />;
    case "finance": return <Navigate to="/finance" replace />;
    case "site_manager": return <Navigate to="/site-manager" replace />;
    default: return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/owner" element={<ProtectedRoute roles={["owner"]}><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute roles={["finance"]}><FinanceDashboard /></ProtectedRoute>} />
      <Route path="/site-manager" element={<ProtectedRoute roles={["site_manager"]}><SiteManagerDashboard /></ProtectedRoute>} />
      <Route path="/owner/projects" element={<ProtectedRoute roles={["owner"]}><OwnerProjects /></ProtectedRoute>} />
      <Route path="/owner/projects/new" element={<ProtectedRoute roles={["owner"]}><ProjectNew /></ProtectedRoute>} />
      <Route path="/owner/projects/:id" element={<ProtectedRoute roles={["owner"]}><ProjectDetail /></ProtectedRoute>} />
      <Route path="/finance/projects" element={<ProtectedRoute roles={["finance"]}><FinanceProjects /></ProtectedRoute>} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
