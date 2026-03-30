import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

export default function AdminRoutes() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // If not logged in, OR if they are logged in but NOT an admin, kick them to home.
  if (!isAuthenticated || !user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}