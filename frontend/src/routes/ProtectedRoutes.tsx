import { Outlet } from "react-router-dom";
import { AuthGuard } from "../auth0/AuthGuard";

export default function ProtectedRoutes() {
  return (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  );
}