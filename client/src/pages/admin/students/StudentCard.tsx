import { Pencil, Trash2 } from "lucide-react";
import type { Student } from "../../../api/studentApi";

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onToggleStatus: (student: Student) => void;
  isUpdatingStatus: boolean;
   onDelete: (student: Student) => void;
  isDeleting: boolean;
}

export default function StudentCard({
  student,
  onEdit,
  onToggleStatus,
  isUpdatingStatus,
    onDelete,
     isDeleting
}: StudentCardProps) {
  return (
    <article className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 font-bold text-[#921B25]">
          {(student.name || "S").charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <h4 className="break-words font-semibold text-gray-800">
            {student.name}
          </h4>

          <p className="mt-1 break-all text-sm text-gray-500">
            Roll No: {student.rollNo}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Branch: {student.branch?.name || "Not assigned"}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Semester: {student.semester?.number ?? "Not assigned"}
          </p>

          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              student.isActive
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {student.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
        <button
          type="button"
          onClick={() => onEdit(student)}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-[#921B25] hover:bg-red-50 sm:flex-none"
        >
          <Pencil size={15} />
          Edit
        </button>

        <button
          type="button"
          onClick={() => onToggleStatus(student)}
          disabled={isUpdatingStatus}
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          {student.isActive ? "Deactivate" : "Activate"}
        </button>
        <button
  type="button"
  onClick={() => onDelete(student)}
  disabled={isDeleting}
  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
>
  <Trash2 size={16} />
  {isDeleting ? "Deleting..." : "Delete"}
</button>
      </div>
    </article>
  );
}