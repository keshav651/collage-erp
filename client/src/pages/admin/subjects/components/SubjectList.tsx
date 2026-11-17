
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import type { Subject } from "../../../../api/subjectApi";

type Semester = {
  id: string;
  number: number;
};

type Props = {
  subjects: Subject[];
  semesters: Semester[];
  isLoading: boolean;
  isError: boolean;
  isDeleting: boolean;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
  onRetry: () => void;
};

export default function SubjectList({
  subjects,
  semesters,
  isLoading,
  isError,
  isDeleting,
  onEdit,
  onDelete,
  onRetry,
}: Props) {
  const semesterMap = new Map(
    semesters.map((semester) => [semester.id, semester.number]),
  );

  return (
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-[#921B25]">
            <BookOpen size={19} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Subject List
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              View, edit or delete existing subjects.
            </p>
          </div>
        </div>

        {!isLoading && !isError && (
          <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#921B25]">
            {subjects.length} Subjects
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-sm text-gray-500">
          Loading subjects...
        </div>
      ) : isError ? (
        <div className="p-8 text-center">
          <p className="text-sm text-red-600">
            Failed to load subjects.
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#921B25]">
            <BookOpen size={22} />
          </div>

          <p className="text-sm font-semibold text-gray-800">
            No subjects found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Add a subject or change the selected filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Branch</th>
                <th className="px-4 py-3 font-semibold">Semester</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {subjects.map((subject) => {
                const semesterNumber =
                  subject.semester?.number ??
                  semesterMap.get(subject.semesterId);

                return (
                  <tr
                    key={subject.id}
                    className="border-t border-gray-100 transition hover:bg-red-50/30"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {subject.name}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs text-gray-700">
                        {subject.code}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {subject.branch?.name ?? "Common"}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {semesterNumber !== undefined
                        ? `Semester ${semesterNumber}`
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(subject)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-[#921B25] hover:bg-red-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => onDelete(subject)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
