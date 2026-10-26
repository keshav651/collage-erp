
import type { PendingTeacher } from "../../../api/adminApi";

interface PendingTeacherSectionProps {
  teachers: PendingTeacher[];
  isLoading: boolean;
  isError: boolean;
  onApprove: (teacher: PendingTeacher) => void;
}

export default function PendingTeacherSection({
  teachers,
  isLoading,
  isError,
  onApprove,
}: PendingTeacherSectionProps) {
  return (
    <section className="mt-6 rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Pending Teacher Approvals
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review teacher registration requests.
          </p>
        </div>

        <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-[#921B25]">
          {teachers.length}
        </span>
      </div>

      {isLoading && (
        <p className="py-6 text-center text-sm text-gray-500">
          Loading pending teachers...
        </p>
      )}

      {isError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Unable to load pending teachers. Please try again later.
        </p>
      )}

      {!isLoading && !isError && teachers.length === 0 && (
        <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
          No pending teacher approvals.
        </p>
      )}

      {!isLoading && !isError && teachers.length > 0 && (
        <div className="space-y-3">
          {teachers.map((teacher) => (
            <article
              key={teacher.id}
              className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <h3 className="break-words font-semibold text-gray-800">
                  {teacher.name || "Name unavailable"}
                </h3>

                <p className="mt-1 break-all text-sm text-gray-500">
                  {teacher.email}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Status: {teacher.status ?? "Pending"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onApprove(teacher)}
                className="min-h-11 w-full rounded-lg bg-[#921B25] px-4 py-2 text-sm font-semibold text-white hover:bg-[#75151D] sm:w-auto"
              >
                Review & Approve
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
