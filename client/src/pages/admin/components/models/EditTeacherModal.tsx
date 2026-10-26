import { Save, X } from "lucide-react";

interface EditTeacherModalProps {
  teacherName: string;
  name: string;
  setName: (value: string) => void;

  branchId: string;
  setBranchId: (value: string) => void;

  status: "ACTIVE" | "INACTIVE";
  setStatus: (value: "ACTIVE" | "INACTIVE") => void;

  password: string;
  setPassword: (value: string) => void;

  branches: {
    id: string;
    name: string;
    codePrefix: string;
  }[];

  branchesLoading: boolean;
  branchesError: boolean;
  isPending: boolean;

  error: string;

  onClose: () => void;
  onSubmit: () => void;
}

export default function EditTeacherModal({
  teacherName,
  name,
  setName,
  branchId,
  setBranchId,
  status,
  setStatus,
  password,
  setPassword,
  branches,
  branchesLoading,
  branchesError,
  isPending,
  error,
  onClose,
  onSubmit,
}: EditTeacherModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-teacher-title"
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2
              id="edit-teacher-title"
              className="text-xl font-bold text-gray-800"
            >
              Edit Teacher
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update teacher information for {teacherName}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close edit teacher dialog"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="edit-teacher-name"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Teacher Name
            </label>

            <input
              id="edit-teacher-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="min-h-12 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Branch */}
          <div>
            <label
              htmlFor="edit-teacher-branch"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Branch
            </label>

            <select
              id="edit-teacher-branch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              disabled={branchesLoading || branchesError}
              className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
            >
              <option value="">
                {branchesLoading ? "Loading branches..." : "Select a branch"}
              </option>

              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.codePrefix})
                </option>
              ))}
            </select>

            {branchesError && (
              <p className="mt-2 text-sm text-red-600">
                Unable to load branches.
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="edit-teacher-password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              New Password
            </label>

            <input
              id="edit-teacher-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Leave blank to keep current password"
              minLength={10}
              maxLength={72}
              autoComplete="new-password"
              className="min-h-12 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
            />

            <p className="mt-1 text-xs text-gray-500">
              Optional. Enter 10–72 characters to change the password.
            </p>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="edit-teacher-status"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Status
            </label>

            <select
              id="edit-teacher-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "ACTIVE" | "INACTIVE")
              }
              className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={
                isPending ||
                branchesLoading ||
                branchesError ||
                branches.length === 0
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#921B25] px-4 py-2 text-sm font-semibold text-white hover:bg-[#75151D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}