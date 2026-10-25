import usePendingTeachers from "../../hooks/usePendingTeachers";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";
import useLogout from "../../hooks/useLogout";

export default function AdminDashboard() {

  const { data, isLoading, isError } = usePendingTeachers();

  const { user } = useAuth();
  const logout = useLogout();

  const pendingTeachers = data?.data ?? [];
  const pendingCount = pendingTeachers.length;

  return (
    <main className="min-h-screen bg-[#FFF9F7] p-4 sm:p-6">
      <header className="rounded-2xl bg-[#921B25] p-5 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-red-100">
              MSME College ERP
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-red-100">
              Manage your college from one place.
            </p>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white font-bold text-[#921B25]">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="font-semibold">
                  {user?.name || "Admin"}
                </p>

                <p className="text-sm text-red-100">
                  {user?.email || "Email unavailable"}
                </p>

                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-red-100">
                  {user?.role || "ADMIN"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#921B25] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={16} />
            {logout.isPending ? "Logging out..." : "Logout"}
          </button>
          
        </div>
      </header>



      <section className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Overview
        </h2>

        {/* Pending Approvals Count */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Pending Approvals
            </p>

            {isLoading ? (
              <p className="mt-3 text-sm text-gray-500">Loading...</p>
            ) : isError ? (
              <p className="mt-3 text-sm text-red-600">
                Failed to load pending approvals.
              </p>
            ) : (
              <p className="mt-3 text-3xl font-bold text-[#921B25]">
                {pendingCount}
              </p>
            )}

            <p className="mt-2 text-sm text-gray-500">
              Teachers awaiting approval
            </p>
          </article>
        </div>

        {/* Pending Teachers List */}
        <div className="mt-6 overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Pending Teacher Approvals
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Review teachers waiting for administrator approval.
              </p>
            </div>

            {!isLoading && !isError && (
              <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                {pendingCount} Pending
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Loading pending teachers...
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-sm text-red-600">
              Unable to load teachers. Please try again later.
            </div>
          ) : pendingCount === 0 ? (
            <div className="p-8 text-center">
              <div className="text-3xl" aria-hidden="true">✓</div>

              <h4 className="mt-3 font-semibold text-gray-800">
                All caught up!
              </h4>

              <p className="mt-1 text-sm text-gray-500">
                There are no teachers waiting for approval.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingTeachers.map((teacher) => (
                <article
                  key={teacher.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 font-bold text-[#921B25]">
                      {(teacher.name || teacher.email || "T")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h4 className="break-words font-semibold text-gray-800">
                        {teacher.name || "Name unavailable"}
                      </h4>

                      <p className="break-all text-sm text-gray-500">
                        {teacher.email}
                      </p>

                      {teacher.createdAt && (
                        <p className="mt-1 text-xs text-gray-400">
                          Registered:{" "}
                          {new Date(teacher.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="w-fit shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Pending Approval
                  </span>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}