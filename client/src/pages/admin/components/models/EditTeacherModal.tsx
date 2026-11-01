import { Save, X } from "lucide-react";
import type { Subject } from "../../../../api/subjectApi";

interface Semester {
  id: string;
  number: number;
}

interface SemesterSubjectsState {
  subjects: Subject[];
  isLoading: boolean;
  isError: boolean;
}

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

  semesters: Semester[];
  semestersLoading: boolean;
  semestersError: boolean;

  selectedSemesterIds: string[];
  onToggleSemester: (semesterId: string) => void;

  academicYear: string;
  setAcademicYear: (value: string) => void;

  subjectsBySemester: Record<string, SemesterSubjectsState>;
  selectedSubjectsBySemester: Record<string, string[]>;
  onToggleSubject: (semesterId: string, subjectId: string) => void;

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
  selectedSemesterIds,
  onToggleSemester,
  academicYear,
  setAcademicYear,
  subjectsBySemester,
  selectedSubjectsBySemester,
  onToggleSubject,
  isPending,
  error,
  onClose,
  onSubmit,
}: EditTeacherModalProps) {
  const sortedSemesters = [...semesters].sort(
    (a, b) => a.number - b.number,
  );

  const invalidAcademicYear = !/^\d{4}-\d{4}$/.test(
    academicYear.trim(),
  );

  const selectedSubjectsCount = selectedSemesterIds.reduce(
    (total, semesterId) =>
      total +
      (selectedSubjectsBySemester[semesterId]?.length ?? 0),
    0,
  );

  const selectedSemesterData = sortedSemesters.filter((semester) =>
    selectedSemesterIds.includes(semester.id),
  );

  const subjectsAreLoading = selectedSemesterIds.some(
    (semesterId) => subjectsBySemester[semesterId]?.isLoading,
  );

  const subjectsHaveError = selectedSemesterIds.some(
    (semesterId) => subjectsBySemester[semesterId]?.isError,
  );

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
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-3xl sm:rounded-2xl sm:p-6"
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
                {branchesLoading
                  ? "Loading branches..."
                  : "Select a branch"}
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
          <section className="rounded-xl border border-[#921B25]/20 bg-[#FFF9F7] p-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                Subject Assignments
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                Select multiple semesters and assign subjects separately
                for each semester.
              </p>
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

              {academicYear.trim() && invalidAcademicYear && (
                <p className="mt-1 text-xs text-red-600">
                  Enter the academic year in YYYY-YYYY format.
                </p>
              )}
            </div>

            {/* Semester selection */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Select Semesters
                </label>

                <span className="text-xs text-gray-500">
                  {selectedSemesterIds.length} selected
                </span>
              </div>

              {semestersLoading ? (
                <p className="rounded-lg bg-white p-4 text-sm text-gray-500">
                  Loading semesters...
                </p>
              ) : semestersError ? (
                <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                  Unable to load semesters.
                </p>
              ) : sortedSemesters.length === 0 ? (
                <p className="rounded-lg bg-white p-4 text-sm text-gray-500">
                  No semesters found.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {sortedSemesters.map((semester) => {
                    const checked = selectedSemesterIds.includes(
                      semester.id,
                    );

                    return (
                      <label
                        key={semester.id}
                        className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition ${
                          checked
                            ? "border-[#921B25] bg-[#921B25]/5 text-[#921B25]"
                            : "border-gray-200 bg-white text-gray-700 hover:border-[#921B25]/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleSemester(semester.id)}
                          className="h-4 w-4 accent-[#921B25]"
                        />

                        <span className="font-semibold">
                          Semester {semester.number}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Subject cards */}
            <div className="mt-5 space-y-4">
              {selectedSemesterData.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                  Select one or more semesters to view and assign their
                  subjects.
                </p>
              ) : (
                selectedSemesterData.map((semester) => {
                  const semesterSubjects =
                    subjectsBySemester[semester.id];

                  const selectedIds =
                    selectedSubjectsBySemester[semester.id] ?? [];

                  return (
                    <section
                      key={semester.id}
                      className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="font-bold text-gray-800">
                          Semester {semester.number}
                        </h4>

                        <span className="rounded-full bg-[#921B25]/10 px-3 py-1 text-xs font-semibold text-[#921B25]">
                          {selectedIds.length} selected
                        </span>
                      </div>

                      {!branchId ? (
                        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                          Select a branch to load subjects.
                        </p>
                      ) : !semesterSubjects ||
                        semesterSubjects.isLoading ? (
                        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                          Loading subjects...
                        </p>
                      ) : semesterSubjects.isError ? (
                        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                          Unable to load subjects for this semester.
                        </p>
                      ) : semesterSubjects.subjects.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-500">
                          No subjects found for this branch and semester.
                        </p>
                      ) : (
                        <div className="max-h-60 space-y-1 overflow-y-auto">
                          {semesterSubjects.subjects.map((subject) => (
                            <label
                              key={subject.id}
                              className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-red-50"
                            >
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(subject.id)}
                                onChange={() =>
                                  onToggleSubject(semester.id, subject.id)
                                }
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
                    </section>
                  );
                })
              )}
            </div>

            <div className="mt-4 rounded-lg bg-white p-3 text-sm text-gray-600 ring-1 ring-gray-200">
              <p className="font-semibold text-gray-800">
                {selectedSemesterIds.length} semesters · {selectedSubjectsCount} subjects
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Only the semesters selected above will be synchronized for
                this academic year. Assignments in other semesters and
                academic years will remain unchanged.
              </p>
            </div>

            {(subjectsAreLoading || subjectsHaveError) && (
              <p className="mt-2 text-xs text-gray-500">
                {subjectsAreLoading
                  ? "Wait for the selected semesters' subjects to load before saving."
                  : "A subject list failed to load. Resolve the loading error before saving assignments."}
              </p>
            )}
          </section>

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
                semestersLoading ||
                semestersError ||
                (selectedSemesterIds.length > 0 &&
                  (!branchId ||
                    invalidAcademicYear ||
                    subjectsAreLoading ||
                    subjectsHaveError))
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