import { Save, X } from "lucide-react";
import type { Subject } from "../../../../api/subjectApi";

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

  semesters: {
    id: string;
    number: number;
  }[];

  semestersLoading: boolean;
  semestersError: boolean;

  semesterId: string;
  setSemesterId: (value: string) => void;

  academicYear: string;
  setAcademicYear: (value: string) => void;

  subjects: Subject[];
  subjectsLoading: boolean;
  subjectsError: boolean;

  selectedSubjectIds: string[];
  onToggleSubject: (subjectId: string) => void;

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
  semesters,
  semestersLoading,
  semestersError,
  semesterId,
  setSemesterId,
  academicYear,
  setAcademicYear,
  subjects,
  subjectsLoading,
  subjectsError,
  selectedSubjectIds,
  onToggleSubject,
  isPending,
  error,
  onClose,
  onSubmit,
}: EditTeacherModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-teacher-title"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-2xl sm:rounded-2xl sm:p-6"
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

        <div className="mt-5 space-y-5">
          {/* Teacher name */}
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

          {/* Subject assignments */}
          <div className="rounded-xl border border-[#921B25]/20 bg-[#FFF9F7] p-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                Subject Assignments
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Select a semester and academic year, then choose the subjects
                assigned to this teacher.
              </p>
            </div>

            {/* Semester */}
            <div className="mt-4">
              <label
                htmlFor="edit-teacher-semester"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Semester
              </label>
              <select
                id="edit-teacher-semester"
                value={semesterId}
                onChange={(event) => setSemesterId(event.target.value)}
                disabled={semestersLoading || semestersError}
                className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
              >
                <option value="">
                  {semestersLoading ? "Loading semesters..." : "Select semester"}
                </option>
                {semesters
                  .slice()
                  .sort((a, b) => a.number - b.number)
                  .map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      Semester {semester.number}
                    </option>
                  ))}
              </select>

              {semestersError && (
                <p className="mt-2 text-sm text-red-600">
                  Unable to load semesters.
                </p>
              )}
            </div>

            {/* Academic year */}
            <div className="mt-4">
              <label
                htmlFor="edit-teacher-academic-year"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Academic Year
              </label>
              <input
                id="edit-teacher-academic-year"
                type="text"
                value={academicYear}
                onChange={(event) => setAcademicYear(event.target.value)}
                placeholder="2026-2027"
                pattern="^\d{4}-\d{4}$"
                maxLength={9}
                className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
              />
            </div>

            {/* Subject list */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Assigned Subjects
                </label>
                <span className="text-xs text-gray-500">
                  {selectedSubjectIds.length} selected
                </span>
              </div>

              {!branchId || !semesterId ? (
                <p className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                  Select a branch and semester to view subjects.
                </p>
              ) : subjectsLoading ? (
                <p className="rounded-lg bg-white p-4 text-sm text-gray-500">
                  Loading subjects...
                </p>
              ) : subjectsError ? (
                <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                  Unable to load subjects. Please try again.
                </p>
              ) : subjects.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                  No subjects found for this branch and semester.
                </p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3">
                  {subjects.map((subject) => (
                    <label
                      key={subject.id}
                      className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-red-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubjectIds.includes(subject.id)}
                        onChange={() => onToggleSubject(subject.id)}
                        className="mt-1 h-4 w-4 accent-[#921B25]"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-gray-800">
                          {subject.name}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          Code: {subject.code}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xs text-gray-500">
                Saving updates the assignments for the selected semester and
                academic year. Assignments for other semesters are not included
                in this update.
              </p>
            </div>
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
                branches.length === 0 ||
                (Boolean(semesterId) &&
                  (semestersLoading ||
                    semestersError ||
                    subjectsLoading ||
                    subjectsError ||
                    !/^\d{4}-\d{4}$/.test(academicYear)))
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