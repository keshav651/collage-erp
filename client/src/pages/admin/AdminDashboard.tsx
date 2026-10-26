import { Link } from "react-router-dom";

import AdminHeader from "../../components/admin/AdminHeader";
import AdminOverview from "../../components/admin/AdminOverview";

import usePendingTeachers from "../../hooks/usePendingTeachers";
import useBranches from "../../hooks/useBranches";
import useTeachers from "../../hooks/useTeachers";
import useLogout from "../../hooks/useLogout";

import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  // Overview queries
  const {
    data: pendingData,
    isLoading: pendingLoading,
    isError: pendingError,
  } = usePendingTeachers();

  const {
    data: branchesData,
    isLoading: branchesLoading,
    isError: branchesError,
  } = useBranches();

  const {
    data: teachersData,
    isLoading: teachersLoading,
    isError: teachersError,
  } = useTeachers();

  // Authentication
  const { user } = useAuth();
  const logout = useLogout();

  // Overview counts
  const pendingCount = pendingData?.data?.length ?? 0;

  const branches = branchesData?.data ?? [];
  const branchCount = branchesData?.count ?? branches.length;

  const activeTeachers = teachersData?.data ?? [];
  const teacherCount = teachersData?.count ?? activeTeachers.length;

  return (
    <main className="min-h-screen bg-[#FFF9F7] p-4 sm:p-6">
      <AdminHeader
        user={user}
        onLogout={() => logout.mutate()}
        isLoggingOut={logout.isPending}
      />

      {/* Admin navigation */}
      <nav
        aria-label="Admin navigation"
        className="my-6 flex flex-wrap gap-3"
      >
        <Link
          to="/admin/dashboard"
          className="rounded-lg bg-[#921B25] px-5 py-3 font-semibold text-white transition hover:bg-[#75151D]"
        >
          Dashboard Overview
        </Link>

        <Link
          to="/admin/students"
          className="rounded-lg bg-white px-5 py-3 font-semibold text-[#921B25] shadow-sm ring-1 ring-[#921B25]/20 transition hover:bg-red-50"
        >
          Student Management
        </Link>

        <Link
          to="/admin/teachers"
          className="rounded-lg bg-white px-5 py-3 font-semibold text-[#921B25] shadow-sm ring-1 ring-[#921B25]/20 transition hover:bg-red-50"
        >
          Teacher Management
        </Link>

        <Link
          to="/admin/branches"
          className="rounded-lg bg-white px-5 py-3 font-semibold text-[#921B25] shadow-sm ring-1 ring-[#921B25]/20 transition hover:bg-red-50"
        >
          Branch Management
        </Link>
      </nav>

      {/* Dashboard overview */}
      <AdminOverview
        pendingCount={pendingCount}
        pendingLoading={pendingLoading}
        pendingError={pendingError}
        branches={branches}
        branchCount={branchCount}
        branchesLoading={branchesLoading}
        branchesError={branchesError}
        teacherCount={teacherCount}
        teachersLoading={teachersLoading}
        teachersError={teachersError}
      />
    </main>
  );
}