import type { Teacher } from "../../../api/adminApi";

interface TeacherManagementSectionProps {
  teachers: Teacher[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (teacher: Teacher) => void;
  onDeactivate: (teacher: Teacher) => void;
}

export default function TeacherManagementSection({
  teachers,
  isLoading,
  isError,
  onEdit,
  onDeactivate,
}: TeacherManagementSectionProps) {
  return (
    <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          Teacher Management
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          View, edit and deactivate existing teachers.
        </p>
      </div>

      {isLoading && (
        <p className="py-6 text-center text-sm text-gray-500">
          Loading teachers...
        </p>
      )}

      {isError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          Unable to load teachers. Please try again later.
        </p>
      )}

      {!isLoading && !isError && teachers.length === 0 && (
        <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
          No teachers found.
        </p>
      )}

      {!isLoading && !isError && teachers.length > 0 && (
        <div className="space-y-3">
          {teachers.map((teacher) => {
            const isActive = teacher.user.status === "ACTIVE";

            return (
              <article
                key={teacher.id}
                className="rounded-xl border border-gray-100 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold text-gray-800">
                      {teacher.name || "Name unavailable"}
                    </h3>

                    <p className="mt-1 break-all text-sm text-gray-500">
                      {teacher.user.email}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Teacher Code: {teacher.teacherCode}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Branch: {teacher.branch.name} (
                      {teacher.branch.codePrefix})
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      Status:{" "}
                      <span
                        className={`inline-flex rounded-full px-2 py-1 font-semibold ${
                          isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {teacher.user.status}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:min-w-28">
                    <button
                      type="button"
                      onClick={() => onEdit(teacher)}
                      className="min-h-10 rounded-lg border border-[#921B25] px-4 py-2 text-sm font-semibold text-[#921B25] transition hover:bg-red-50"
                    >
                      Edit
                    </button>

                    {isActive && (
                      <button
                        type="button"
                        onClick={() => onDeactivate(teacher)}
                        className="min-h-10 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}