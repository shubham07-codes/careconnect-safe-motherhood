import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    const routes = {
      mother: "/mother",
      field_worker: "/field-worker",
      doctor: "/doctor",
      officer: "/officer",
    };

    return <Navigate to={routes[user?.role] || "/login"} replace />;
  }

  return children;
}