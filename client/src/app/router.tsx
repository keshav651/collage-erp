
import { Navigate, createBrowserRouter } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import TeacherDashboard from "../features/teachers/pages/TeacherDashboard";

import AdminLayout from "../layouts/AdminLayout";
import TeacherLayout from "../layouts/TeacherLayout";

import ProtectedRoute from "../routes/Protected.routes";
import RoleRoute from "../routes/Role.route";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={["ADMIN"]} />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: <AdminDashboard />,
              },
            ],
          },
        ],
      },
      {
        element: <RoleRoute allowedRoles={["TEACHER"]} />,
        children: [
          {
            path: "/teacher",
            element: <TeacherLayout />,
            children: [
              {
                index: true,
                element: <TeacherDashboard />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
