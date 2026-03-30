import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

export default function ProtectedRoutes() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // If not logged in, redirect to login page. Otherwise, render the route.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}