import type { ChangeEvent, FormEvent } from "react";
import type {
  Student,
  StudentPayload,
  StudentBranch,
  StudentSemester,
} from "../../../api/studentApi";

interface StudentFormModalProps {
  selectedStudent: Student | null;
  formData: StudentPayload;
  branches: StudentBranch[];
  semesters: StudentSemester[];
  semestersLoading: boolean;
  semestersError: boolean;
  semestersErrorDetails: unknown;
  isSaving: boolean;
  onClose: () => void;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function StudentFormModal({
  selectedStudent,
  formData,
  branches,
  semesters,
  semestersLoading,
  semestersError,
  semestersErrorDetails,
  isSaving,
  onClose,
  onInputChange,
  onSubmit,
}: StudentFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-form-title"
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6"
      >
        <div className="mb-5">
          <h3
            id="student-form-title"
            className="text-xl font-bold text-gray-800"
          >
            {selectedStudent ? "Edit Student" : "Add Student"}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Enter the student's details below.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Student Name */}
          <div>
            <label
              htmlFor="student-name"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Student Name
            </label>

            <input
              id="student-name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={onInputChange}
              placeholder="Enter student name"
              className="min-h-11 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Roll Number */}
          <div>
            <label
              htmlFor="student-roll-no"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Roll Number
            </label>

            <input
              id="student-roll-no"
              name="rollNo"
              type="text"
              required
              value={formData.rollNo}
              onChange={onInputChange}
              placeholder="Enter roll number"
              className="min-h-11 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Branch */}
          <div>
            <label
              htmlFor="student-branch"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Branch
            </label>

            <select
              id="student-branch"
              name="branchId"
              required
              value={formData.branchId}
              onChange={onInputChange}
              className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
            >
              <option value="">Select branch</option>

              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label
              htmlFor="student-semester"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Semester
            </label>

            <select
              id="student-semester"
              name="semesterId"
              value={formData.semesterId}
              onChange={onInputChange}
              required
              className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
            >
              <option value="">
                {semestersLoading
                  ? "Loading semesters..."
                  : semestersError
                    ? "Failed to load semesters"
                    : semesters.length === 0
                      ? "No semesters available"
                      : "Select Semester"}
              </option>

              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  Semester {semester.number}
                </option>
              ))}
            </select>

            {semestersError && (
              <p className="mt-1 text-sm text-red-600">
                {semestersErrorDetails instanceof Error
                  ? semestersErrorDetails.message
                  : "Unable to load semesters."}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="min-h-11 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="min-h-11 rounded-lg bg-[#921B25] px-5 py-2 text-sm font-semibold text-white hover:bg-[#74151d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : selectedStudent
                  ? "Update Student"
                  : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}