import { GitBranch, Users, CheckCircle2 } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  codePrefix: string;
}

interface AdminOverviewProps {
  pendingCount: number;
  pendingLoading: boolean;
  pendingError: boolean;

  branches: Branch[];
  branchCount: number;
  branchesLoading: boolean;
  branchesError: boolean;

  teacherCount: number;
  teachersLoading: boolean;
  teachersError: boolean;
}

export default function AdminOverview({
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
}: AdminOverviewProps) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Overview
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Pending Approvals */}
        <article className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Pending Approvals
            </p>

            <div className="rounded-lg bg-red-50 p-2 text-[#921B25]">
              <Users size={20} />
            </div>
          </div>

          {pendingLoading ? (
            <p className="mt-3 text-sm text-gray-500">Loading...</p>
          ) : pendingError ? (
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

        {/* Total Branches */}
        <article className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Total Branches
            </p>

            <div className="rounded-lg bg-red-50 p-2 text-[#921B25]">
              <GitBranch size={20} />
            </div>
          </div>

          {branchesLoading ? (
            <p className="mt-3 text-sm text-gray-500">Loading...</p>
          ) : branchesError ? (
            <p className="mt-3 text-sm text-red-600">
              Failed to load branches.
            </p>
          ) : (
            <>
              <p className="mt-3 text-3xl font-bold text-[#921B25]">
                {branchCount}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Academic branches registered
              </p>

              {branches.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                  {branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate text-gray-700">
                        {branch.name}
                      </span>

                      <span className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-[#921B25]">
                        {branch.codePrefix}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </article>

        {/* Total Teachers */}
        <article className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Total Teachers
            </p>

            <div className="rounded-lg bg-red-50 p-2 text-[#921B25]">
              <CheckCircle2 size={20} />
            </div>
          </div>

          {teachersLoading ? (
            <p className="mt-3 text-sm text-gray-500">Loading...</p>
          ) : teachersError ? (
            <p className="mt-3 text-sm text-red-600">
              Failed to load teachers.
            </p>
          ) : (
            <p className="mt-3 text-3xl font-bold text-[#921B25]">
              {teacherCount}
            </p>
          )}

          <p className="mt-2 text-sm text-gray-500">
            Teachers returned by the API
          </p>
        </article>
      </div>
    </section>
  );
}