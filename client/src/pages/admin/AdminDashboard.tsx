
import AdminOverview from "../../components/admin/AdminOverview";
import useAdminDashboard from "./dashboard/hooks/useAdminDashboard";

export default function AdminDashboard() {
  const {
    pendingCount,
    pendingLoading,
    pendingError,
    branches,
    branchCount,
    branchesLoading,
    branchesError,
    teacherCount,
    teachersLoading,
    teachersError,
  } = useAdminDashboard();

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          Dashboard Overview
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          College statistics and management overview.
        </p>
      </div>

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
    </section>
  );
}
