
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import type { UserRole } from "../api/auth.api";

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuthContext();

  if (!user || !allowedRoles.includes(user.role)) {
    if (user?.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (user?.role === "TEACHER") {
      return <Navigate to="/teacher" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

