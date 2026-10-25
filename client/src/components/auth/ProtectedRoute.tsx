import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: Array<"ADMIN" | "TEACHER">;
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Session restore hone ka wait karo
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-900" />
          <p className="mt-4 text-sm text-gray-600">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  // User login nahi hai
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // User ke paas required role nahi hai
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "TEACHER") {
      return <Navigate to="/teacher/dashboard" replace />;
    }

    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}