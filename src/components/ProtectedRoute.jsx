import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({
  children,
  adminOnly = false,
  blockAdmin = false,
  loginPath = "/login",
}) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="centered">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (blockAdmin && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
