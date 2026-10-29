import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

import useSemesters from "../../../../hooks/useSemesters";
import useSubjects from "../../../../hooks/useSubjects";

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

interface ApprovalPayload {
  branchId: string;
  semesterId: string;
  subjectIds: string[];
  academicYear: string;
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
  onApprove: (payload: ApprovalPayload) => void;
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
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [formError, setFormError] = useState("");

  const {
    data: semestersData,
    isLoading: semestersLoading,
    isError: semestersError,
  } = useSemesters();

  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = useSubjects(selectedBranchId || undefined, selectedSemesterId || undefined);

  const semesters = semestersData?.data ?? [];
  const allSubjects = subjectsData?.data ?? [];

  // Branch ya semester change hone par purane subject selections reset karo.
  useEffect(() => {
    setSelectedSubjectIds([]);
  }, [selectedBranchId, selectedSemesterId]);

  // Sirf selected semester aur selected branch ke subjects dikhayein.
  // branchId null hone par subject common hai.
  const availableSubjects = allSubjects.filter(
    (subject) =>
      subject.semesterId === selectedSemesterId &&
      (subject.branchId === null || subject.branchId === selectedBranchId),
  );

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    setSelectedSubjectIds((previous) =>
      checked
        ? [...previous, subjectId]
        : previous.filter((id) => id !== subjectId),
    );
    setFormError("");
  };

  const handleSubmit = () => {
    setFormError("");

    if (!selectedBranchId) {
      setFormError("Please select a branch.");
      return;
    }

    if (!selectedSemesterId) {
      setFormError("Please select a semester.");
      return;
    }

    if (selectedSubjectIds.length === 0) {
      setFormError("Please select at least one subject.");
      return;
    }

    const yearPattern = /^\d{4}-\d{4}$/;
    const years = academicYear.split("-").map(Number);

    if (
      !yearPattern.test(academicYear) ||
      years[1] !== years[0] + 1
    ) {
      setFormError("Enter a valid academic year, such as 2026-2027.");
      return;
    }

    onApprove({
      branchId: selectedBranchId,
      semesterId: selectedSemesterId,
      subjectIds: selectedSubjectIds,
      academicYear,
    });
  };

  const isFormLoading = branchesLoading || semestersLoading;
  const hasNoBranches = !branchesLoading && branches.length === 0;
  const hasNoSemesters = !semestersLoading && semesters.length === 0;

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
        aria-labelledby="approval-modal-title"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="approval-modal-title"
              className="text-xl font-bold text-gray-800"
            >
              Approve Teacher
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select the branch, semester, subjects and academic year.
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

        {/* Teacher information */}
        <div className="mt-5 rounded-xl bg-[#FFF9F7] p-4">
          <p className="font-semibold text-gray-800">
            {teacher.name || "Name unavailable"}
          </p>

          <p className="mt-1 break-all text-sm text-gray-500">
            {teacher.email}
          </p>
        </div>

        {/* Branch */}
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
            onChange={(event) => {
              setSelectedBranchId(event.target.value);
              setSelectedSemesterId("");
              setSelectedSubjectIds([]);
              setFormError("");
            }}
            disabled={isFormLoading || isPending}
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

          {hasNoBranches && (
            <p className="mt-2 text-sm text-red-600">
              No branches available. Add a branch before approving this teacher.
            </p>
          )}
        </div>

        {/* Semester */}
        <div className="mt-4">
          <label
            htmlFor="teacher-semester"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Assign Semester <span className="text-red-600">*</span>
          </label>

          <select
            id="teacher-semester"
            value={selectedSemesterId}
            onChange={(event) => {
              setSelectedSemesterId(event.target.value);
              setSelectedSubjectIds([]);
              setFormError("");
            }}
            disabled={!selectedBranchId || semestersLoading || isPending}
            className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
          >
            <option value="">
              {semestersLoading ? "Loading semesters..." : "Select a semester"}
            </option>

            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                Semester {semester.number}
              </option>
            ))}
          </select>

          {semestersError && (
            <p className="mt-2 text-sm text-red-600">
              Unable to load semesters. Please try again.
            </p>
          )}

          {hasNoSemesters && (
            <p className="mt-2 text-sm text-red-600">
              No semesters found. Please check your semester records.
            </p>
          )}
        </div>

        {/* Subjects */}
        <div className="mt-4">
          <p className="mb-2 block text-sm font-semibold text-gray-700">
            Assign Subjects <span className="text-red-600">*</span>
          </p>

          <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-200 p-3">
            {!selectedBranchId || !selectedSemesterId ? (
              <p className="text-sm text-gray-500">
                Select a branch and semester to see available subjects.
              </p>
            ) : subjectsLoading ? (
              <p className="text-sm text-gray-500">Loading subjects...</p>
            ) : subjectsError ? (
              <p className="text-sm text-red-600">
                Unable to load subjects. Please try again.
              </p>
            ) : availableSubjects.length === 0 ? (
              <p className="text-sm text-gray-500">
                No subjects found for this branch and semester.
              </p>
            ) : (
              <div className="space-y-3">
                {availableSubjects.map((subject) => (
                  <label
                    key={subject.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-[#FFF9F7]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubjectIds.includes(subject.id)}
                      onChange={(event) =>
                        handleSubjectChange(subject.id, event.target.checked)
                      }
                      disabled={isPending}
                      className="mt-1 h-4 w-4 accent-[#921B25]"
                    />

                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-800">
                        {subject.name}
                      </span>

                      <span className="block text-xs text-gray-500">
                        {subject.code}
                        {subject.branchId === null ? " · Common subject" : ""}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <p className="mt-1 text-xs text-gray-500">
            Selected subjects: {selectedSubjectIds.length}
          </p>
        </div>

        {/* Academic Year */}
        <div className="mt-4">
          <label
            htmlFor="teacher-academic-year"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Academic Year <span className="text-red-600">*</span>
          </label>

          <input
            id="teacher-academic-year"
            type="text"
            value={academicYear}
            onChange={(event) => {
              setAcademicYear(event.target.value);
              setFormError("");
            }}
            placeholder="2026-2027"
            pattern="[0-9]{4}-[0-9]{4}"
            disabled={isPending}
            className="min-h-12 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
          />

          <p className="mt-1 text-xs text-gray-500">
            Format: YYYY-YYYY (for example, 2026-2027)
          </p>
        </div>

        {/* Error messages */}
        {(formError || error) && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {formError || error}
          </p>
        )}

        {/* Actions */}
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
            onClick={handleSubmit}
            disabled={
              isPending ||
              isFormLoading ||
              branchesError ||
              semestersError ||
              subjectsLoading ||
              subjectsError ||
              branches.length === 0 ||
              semesters.length === 0
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