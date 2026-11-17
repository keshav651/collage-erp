
import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignUpPage";
import PendingApprovalPage from "../pages/auth/PendingApprovalPage";

import AdminDashboard from "../pages/admin/AdminDashboard";
import StudentManagementPage from "../pages/admin/students/StudentManagementPage";
import TeacherManagementPage from "../pages/admin/teachers/TeacherManagementPage";
import BranchManagementPage from "../pages/admin/branches/BranchManagementPage";
import UnitTestManagementPage from "../pages/admin/unit-tests/UnitTestManagementPage";
import SubjectManagementPage from "../pages/admin/subjects/SubjectManagementPage";

import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import UnitTestMarksEntryPage from "../pages/teacher/UnitTestMarksEntryPage";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

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
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <AdminDashboard />,
          },
          {
            path: "students",
            element: <StudentManagementPage />,
          },
          {
            path: "teachers",
            element: <TeacherManagementPage />,
          },
          {
            path: "branches",
            element: <BranchManagementPage />,
          },
          {
            path: "unit-tests",
            element: <UnitTestManagementPage />,
          },
          {
            path: "subjects",
            element: <SubjectManagementPage />,
          },
        ],
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
      {
        path: "/teacher/unit-tests",
        element: <UnitTestMarksEntryPage />,
      },
    ],
  },
]);
