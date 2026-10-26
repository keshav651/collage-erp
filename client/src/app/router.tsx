
import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignUpPage";
import PendingApprovalPage from "../pages/auth/PendingApprovalPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import StudentManagementPage from "../pages/admin/students/StudentManagementPage";
import TeacherManagementPage from "../pages/admin/teachers/TeacherManagementPage";
import BranchManagementPage from "../pages/admin/branches/BranchManagementPage";




export const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/pending-approval",
    element: <PendingApprovalPage />,
  },

  // Admin-only routes
  {
    element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
    children: [
      {
        path: "/admin/dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "/admin/students",
        element: <StudentManagementPage />,
      },
      {
        path: "/admin/teachers",
        element: <TeacherManagementPage />
      },
      {
        path: "/admin/branches",
        element: <BranchManagementPage />
      },
    ],
  },

  // Teacher-only routes
  {
    element: <ProtectedRoute allowedRoles={["TEACHER"]} />,
    children: [
      {
        path: "/teacher/dashboard",
        element: <TeacherDashboard />,
      },
    ],
  },
]);
