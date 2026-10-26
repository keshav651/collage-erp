import { CheckCircle2, X } from "lucide-react";

interface PendingTeacher {
  id: string;
  name: string;
  email: string;
}

interface Branch {
  id: string;
  name: string;
  codePrefix: string;
}

interface ApprovalModalProps {
  teacher: PendingTeacher;
  branches: Branch[];
  selectedBranchId: string;
  setSelectedBranchId: (branchId: string) => void;
  branchesLoading: boolean;
  branchesError: boolean;
  isPending: boolean;
  error: string;
  onClose: () => void;
  onApprove: () => void;
}

export default function ApprovalModal({
  teacher,
  branches,
  selectedBranchId,
  setSelectedBranchId,
  branchesLoading,
  branchesError,
  isPending,
  error,
  onClose,
  onApprove,
}: ApprovalModalProps) {
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
        aria-labelledby="approval-modal-title"
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="approval-modal-title"
              className="text-xl font-bold text-gray-800"
            >
              Approve Teacher
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review the teacher and assign a branch.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close approval dialog"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-[#FFF9F7] p-4">
          <p className="font-semibold text-gray-800">
            {teacher.name || "Name unavailable"}
          </p>

          <p className="mt-1 break-all text-sm text-gray-500">
            {teacher.email}
          </p>
        </div>

        <div className="mt-5">
          <label
            htmlFor="teacher-branch"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Assign Branch <span className="text-red-600">*</span>
          </label>

          <select
            id="teacher-branch"
            value={selectedBranchId}
            onChange={(event) => setSelectedBranchId(event.target.value)}
            disabled={branchesLoading || isPending}
            className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
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
              Unable to load branches. Please try again later.
            </p>
          )}

          {!branchesLoading &&
            !branchesError &&
            branches.length === 0 && (
              <p className="mt-2 text-sm text-red-600">
                No branches are available. Add a branch before approving this
                teacher.
              </p>
            )}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
            onClick={onApprove}
            disabled={
              isPending ||
              branchesLoading ||
              branchesError ||
              branches.length === 0
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#921B25] px-4 py-2 text-sm font-semibold text-white hover:bg-[#75151D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 size={17} />
            {isPending ? "Approving..." : "Confirm Approval"}
          </button>
        </div>
      </section>
    </div>
  );
}