
import {
  Building2,
  Plus,
  GitBranch,
} from "lucide-react";

import useBranchManagement from "./hooks/useBranchManagement";

export default function BranchManagementPage() {
  const {
    name,
    setName,
    codePrefix,
    handleCodePrefixChange,
    branches,
    isLoading,
    isError,
    errorMessage,
    handleSubmit,
    isCreating,
    createError,
    createSuccess,
  } = useBranchManagement();

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Branch Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Create and manage college branches.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Create branch */}
        <section className="rounded-xl border border-red-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-[#921B25]">
              <Plus size={19} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Add New Branch
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Register a new academic branch.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div>
              <label
                htmlFor="branch-name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Branch Name
              </label>

              <input
                id="branch-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Computer Science"
                maxLength={100}
                required
                disabled={isCreating}
                className="min-h-10 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="branch-code"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Branch Code Prefix
              </label>

              <input
                id="branch-code"
                type="text"
                value={codePrefix}
                onChange={(event) =>
                  handleCodePrefixChange(event.target.value)
                }
                placeholder="e.g. CS"
                minLength={2}
                maxLength={10}
                pattern="[A-Za-z0-9]{2,10}"
                title="Enter 2–10 letters or numbers."
                required
                disabled={isCreating}
                className="min-h-10 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100 disabled:opacity-60"
              />

              <p className="mt-1.5 text-xs text-gray-500">
                Use 2–10 letters or numbers, such as ME, CS or CSE01.
              </p>
            </div>

            {createError && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {createError}
              </div>
            )}

            {createSuccess && (
              <div
                role="status"
                className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
              >
                Branch created successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#921B25] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#75151D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={17} />
              {isCreating ? "Creating Branch..." : "Create Branch"}
            </button>
          </form>
        </section>

        {/* Existing branches */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-[#921B25]">
                <Building2 size={19} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Existing Branches
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Branches registered in the system.
                </p>
              </div>
            </div>

            <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#921B25]">
              {branches.length} Branches
            </span>
          </div>

          {isLoading ? (
            <div className="py-14 text-center text-sm text-gray-500">
              Loading branches...
            </div>
          ) : isError ? (
            <div
              role="alert"
              className="m-4 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              Failed to load branches: {errorMessage}
            </div>
          ) : branches.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-14 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#921B25]">
                <GitBranch size={21} />
              </div>

              <h3 className="text-sm font-semibold text-gray-800">
                No branches found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Create your first branch using the form.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px] text-left">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-500">
                    <th className="px-4 py-3 font-semibold">
                      Branch Name
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Code Prefix
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {branches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="border-t border-gray-100 transition hover:bg-red-50/40"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {branch.name}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs font-semibold text-gray-700">
                          {branch.codePrefix}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
