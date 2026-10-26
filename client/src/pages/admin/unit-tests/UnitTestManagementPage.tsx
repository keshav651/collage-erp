import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, RefreshCw, X } from "lucide-react";

import {
  createUnitTestCycle,
  getUnitTestCycles,
  type UnitTestCyclePayload,
} from "../../../api/unitTestApi";
import { getAllBranches } from "../../../api/adminApi";
import useSemesters from "../../../hooks/useSemesters";

interface Branch {
  id: string;
  name: string;
  codePrefix?: string;
}

interface UnitTest {
  id: string;
  title: string;
  testNumber: number;
  maxMarks: number;
  testDate: string;
  subject?: {
    id: string;
    name: string;
  };
}

interface UnitTestCycle {
  id: string;
  name: string;
  academicYear: string;
  startTestNumber: number;
  endTestNumber: number;
  marksEntryDeadline: string;
  correctionDeadline?: string | null;
  branchId?: string | null;
  semesterId: string;
  branch?: Branch | null;
  semester?: {
    id: string;
    number: number;
  };
  tests: UnitTest[];
  createdAt: string;
}

interface CyclesResponse {
  message?: string;
  count: number;
  data: UnitTestCycle[];
}

interface BranchesResponse {
  success: boolean;
  count: number;
  data: Branch[];
}

interface CreateCycleResponse {
  message: string;
  data: UnitTestCycle;
  summary?: {
    subjectCount: number;
    testNumbers: number;
    totalTests: number;
  };
}

interface FormState {
  name: string;
  academicYear: string;
  semesterId: string;
  branchId: string;
  startTestNumber: string;
  endTestNumber: string;
  maxMarks: string;
  testDate: string;
  marksEntryDeadline: string;
  correctionDeadline: string;
}

const initialForm: FormState = {
  name: "",
  academicYear: "",
  semesterId: "",
  branchId: "",
  startTestNumber: "1",
  endTestNumber: "3",
  maxMarks: "20",
  testDate: "",
  marksEntryDeadline: "",
  correctionDeadline: "",
};

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function UnitTestManagementPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const cyclesQuery = useQuery({
    queryKey: ["admin", "unit-test-cycles"],
    queryFn: getUnitTestCycles,
  });

  const semestersQuery = useSemesters();

  const branchesQuery = useQuery({
    queryKey: ["admin", "branches"],
    queryFn: getAllBranches,
  });

  const semesters = semestersQuery.data?.data ?? [];

  const branches =
    (branchesQuery.data as BranchesResponse | undefined)?.data ?? [];

  const cyclesResponse =
    cyclesQuery.data as CyclesResponse | undefined;

  const cycles = cyclesResponse?.data ?? [];

  const selectedSemester = semesters.find(
    (semester) => semester.id === form.semesterId,
  );

  const isFirstYear =
    selectedSemester?.number === 1 ||
    selectedSemester?.number === 2;

  const createMutation = useMutation({
    mutationFn: (payload: UnitTestCyclePayload) =>
      createUnitTestCycle(payload),

    onSuccess: async (result: CreateCycleResponse) => {
      setSuccessMessage(
        result.message || "Unit Test Cycle created successfully.",
      );

      setForm(initialForm);
      setFormError("");
      setShowForm(false);

      await queryClient.invalidateQueries({
        queryKey: ["admin", "unit-test-cycles"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["teacher", "unit-tests"],
      });
    },

    onError: (error: unknown) => {
      setFormError(getErrorMessage(error));
    },
  });

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFormError("");
    setSuccessMessage("");
  }

  function openCreateForm() {
    setForm(initialForm);
    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  }

  function closeCreateForm() {
    setShowForm(false);
    setFormError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    const start = Number(form.startTestNumber);
    const end = Number(form.endTestNumber);
    const maxMarks = Number(form.maxMarks);

    if (!form.name.trim()) {
      setFormError("Please enter a cycle name.");
      return;
    }

    if (!form.academicYear.trim()) {
      setFormError("Please enter the academic year.");
      return;
    }

    if (!form.semesterId) {
      setFormError("Please select a semester.");
      return;
    }

    if (!selectedSemester) {
      setFormError("The selected semester is invalid.");
      return;
    }

    if (!isFirstYear && !form.branchId) {
      setFormError(
        "Please select a branch for Semester 3 and above.",
      );
      return;
    }

    if (
      isFirstYear &&
      form.branchId
    ) {
      setFormError(
        "Semester 1 and 2 use a common cycle without a branch.",
      );
      return;
    }

    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 1 ||
      end < start ||
      end - start > 49
    ) {
      setFormError(
        "Enter a valid test range. You can create at most 50 tests per cycle.",
      );
      return;
    }

    if (!Number.isFinite(maxMarks) || maxMarks <= 0) {
      setFormError("Maximum marks must be greater than zero.");
      return;
    }

    if (!form.testDate) {
      setFormError("Please select the test date.");
      return;
    }

    if (!form.marksEntryDeadline) {
      setFormError("Please select the marks entry deadline.");
      return;
    }

    if (
      Number.isNaN(new Date(form.testDate).getTime()) ||
      Number.isNaN(
        new Date(form.marksEntryDeadline).getTime(),
      )
    ) {
      setFormError("Please enter valid dates.");
      return;
    }

    if (
      form.correctionDeadline &&
      Number.isNaN(
        new Date(form.correctionDeadline).getTime(),
      )
    ) {
      setFormError("Please enter a valid correction deadline.");
      return;
    }

    const payload: UnitTestCyclePayload = {
      name: form.name.trim(),
      academicYear: form.academicYear.trim(),
      semesterId: form.semesterId,
      branchId: isFirstYear ? null : form.branchId,
      startTestNumber: start,
      endTestNumber: end,
      maxMarks,
      testDate: new Date(form.testDate).toISOString(),
      marksEntryDeadline: new Date(
        form.marksEntryDeadline,
      ).toISOString(),
      correctionDeadline: form.correctionDeadline
        ? new Date(form.correctionDeadline).toISOString()
        : null,
    };

    createMutation.mutate(payload);
  }

  const loadingReferenceData =
    semestersQuery.isLoading || branchesQuery.isLoading;

  return (
    <main className="min-h-screen bg-[#FFF9F7] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#921B25] sm:text-3xl">
              Unit Test Management
            </h1>

            <p className="mt-2 text-gray-600">
              Create unit test cycles and manage subject-wise tests.
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>
        </header>

        <section className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Unit Test Cycles
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {cycles.length} cycle{cycles.length === 1 ? "" : "s"} found
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#921B25] px-5 py-3 font-semibold text-white transition hover:bg-[#75151D]"
          >
            <Plus size={19} />
            Create New Cycle
          </button>
        </section>

        {successMessage && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800"
          >
            {successMessage}
          </div>
        )}

        {formError && !showForm && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {formError}
          </div>
        )}

        {showForm && (
          <section className="mt-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create Unit Test Cycle
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Tests will be generated for applicable subjects automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateForm}
                aria-label="Close form"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                <X size={21} />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {formError}
              </div>
            )}

            {loadingReferenceData && (
              <p className="mb-4 text-sm text-gray-500">
                Loading semesters and branches...
              </p>
            )}

            {(semestersQuery.isError || branchesQuery.isError) && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Could not load semesters or branches. Refresh the page and try again.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">
                    Cycle Name *
                  </span>

                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Example: Unit Test Cycle 1"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">
                    Academic Year *
                  </span>

                  <input
                    type="text"
                    required
                    value={form.academicYear}
                    onChange={(event) =>
                      updateField("academicYear", event.target.value)
                    }
                    placeholder="Example: 2026-27"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">
                    Semester *
                  </span>

                  <select
                    required
                    value={form.semesterId}
                    onChange={(event) => {
                      const semesterId = event.target.value;

                      const semester = semesters.find(
                        (item) => item.id === semesterId,
                      );

                      const commonSemester =
                        semester?.number === 1 ||
                        semester?.number === 2;

                      setForm((previous) => ({
                        ...previous,
                        semesterId,
                        branchId: commonSemester
                          ? ""
                          : previous.branchId,
                      }));

                      setFormError("");
                      setSuccessMessage("");
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                  >
                    <option value="">Select semester</option>

                    {semesters
                      .slice()
                      .sort((a, b) => a.number - b.number)
                      .map((semester) => (
                        <option
                          key={semester.id}
                          value={semester.id}
                        >
                          Semester {semester.number}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">
                    Branch {selectedSemester && !isFirstYear ? "*" : ""}
                  </span>

                  <select
                    value={form.branchId}
                    disabled={!selectedSemester || isFirstYear}
                    required={Boolean(selectedSemester && !isFirstYear)}
                    onChange={(event) =>
                      updateField("branchId", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">
                      {!selectedSemester
                        ? "Select semester first"
                        : isFirstYear
                          ? "Common cycle — no branch"
                          : "Select branch"}
                    </option>

                    {!isFirstYear &&
                      branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                          {branch.codePrefix
                            ? ` (${branch.codePrefix})`
                            : ""}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">
                    Start Test Number *
                  </span>

                  <input
                    type="number"
                    min={1}
                    max={50}
                    step={1}
                    required
                    value={form.startTestNumber}
                    onChange={(event) =>
                      updateField(
                        "startTestNumber",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">
                    End Test Number *
                  </span>

                  <input
                    type="number"
                    min={Number(form.startTestNumber) || 1}
                    max={Number(form.startTestNumber) + 49 || 50}
                    step={1}
                    required
                    value={form.endTestNumber}
                    onChange={(event) =>
                      updateField(
                        "endTestNumber",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">
                    Maximum Marks per Test *
                  </span>

                  <input
                    type="number"
                    min={0.01}
                    step="any"
                    required
                    value={form.maxMarks}
                    onChange={(event) =>
                      updateField("maxMarks", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">
                    Test Date *
                  </span>

                  <input
                    type="date"
                    required
                    value={form.testDate}
                    onChange={(event) =>
                      updateField("testDate", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">
                    Marks Entry Deadline *
                  </span>

                  <input
                    type="datetime-local"
                    required
                    value={form.marksEntryDeadline}
                    onChange={(event) =>
                      updateField(
                        "marksEntryDeadline",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">
                    Correction Deadline (Optional)
                  </span>

                  <input
                    type="datetime-local"
                    value={form.correctionDeadline}
                    onChange={(event) =>
                      updateField(
                        "correctionDeadline",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Before creating the cycle</p>

                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    Applicable subjects must already exist for the selected semester and branch.
                  </li>
                  <li>
                    Semester 1 and 2 use a common cycle. Semester 3 and above require a branch.
                  </li>
                  <li>
                    The backend creates a test for every applicable subject and each number in the selected range.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateForm}
                  disabled={createMutation.isPending}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={createMutation.isPending || loadingReferenceData}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#921B25] px-6 py-3 font-semibold text-white transition hover:bg-[#75151D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createMutation.isPending && (
                    <RefreshCw size={18} className="animate-spin" />
                  )}

                  {createMutation.isPending
                    ? "Creating Cycle..."
                    : "Create Unit Test Cycle"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-6">
          {cyclesQuery.isLoading && (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
              Loading Unit Test Cycles...
            </div>
          )}

          {cyclesQuery.isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
              <p className="font-semibold">
                Failed to load Unit Test Cycles.
              </p>

              <p className="mt-1 text-sm">
                {getErrorMessage(cyclesQuery.error)}
              </p>

              <button
                type="button"
                onClick={() => cyclesQuery.refetch()}
                className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold transition hover:bg-red-100"
              >
                Try Again
              </button>
            </div>
          )}

          {!cyclesQuery.isLoading &&
            !cyclesQuery.isError &&
            cycles.length === 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white px-5 py-14 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#921B25]">
                  <Plus size={26} />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No Unit Test Cycles Found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                  Create your first cycle to automatically generate unit tests for applicable subjects.
                </p>

                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-5 rounded-lg bg-[#921B25] px-5 py-3 font-semibold text-white transition hover:bg-[#75151D]"
                >
                  Create Your First Cycle
                </button>
              </div>
            )}

          {!cyclesQuery.isLoading &&
            !cyclesQuery.isError &&
            cycles.length > 0 && (
              <div className="space-y-4">
                {cycles.map((cycle) => {
                  const subjectMap = new Map<string, string>();

                  cycle.tests?.forEach((test) => {
                    if (test.subject) {
                      subjectMap.set(
                        test.subject.id,
                        test.subject.name,
                      );
                    }
                  });

                  const subjectNames = Array.from(
                    subjectMap.values(),
                  );

                  return (
                    <article
                      key={cycle.id}
                      className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm"
                    >
                      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-start">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {cycle.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Academic Year: {cycle.academicYear}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-[#921B25]">
                            Semester {cycle.semester?.number ?? "—"}
                          </span>

                          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                            {cycle.branch?.name ?? "Common Cycle"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Test Range
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            UT-{cycle.startTestNumber} to UT-{cycle.endTestNumber}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Total Tests
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {cycle.tests?.length ?? 0}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Subjects
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {subjectNames.length}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Marks Entry Deadline
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {formatDate(cycle.marksEntryDeadline)}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                        <p className="text-sm font-semibold text-gray-700">
                          Applicable Subjects
                        </p>

                        {subjectNames.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {subjectNames.map((name) => (
                              <span
                                key={name}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500">
                            No subject details available.
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
        </section>
      </div>
    </main>
  );
}