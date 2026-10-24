import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignUpPage";
import PendingApprovalPage from "../pages/auth/PendingApprovalPage";

function AdminDashboardPlaceholder() {
    return <h1>Admin Dashboard</h1>;
}

function TeacherDashboardPlaceholder() {
    return <h1>Teacher Dashboard</h1>;
}

export const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />,
    },
    {
        path: "/admin/dashboard",
        element: <AdminDashboardPlaceholder />,
    },
    {
        path: "/teacher/dashboard",
        element: <TeacherDashboardPlaceholder />,
    },
    {
        path: "/signup",
        element: <SignupPage />,
    },
    {
        path: "/pending-approval",
        element: <PendingApprovalPage />,
    },
]);