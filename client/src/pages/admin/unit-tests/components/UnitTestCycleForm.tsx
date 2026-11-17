import type { UnitTestManagement } from "../hooks/useUnitTestManagement";
import { inputClass, labelClass } from "../utils";
import { RefreshCw, X } from "lucide-react";

export default function UnitTestCycleForm({ management }: { management: UnitTestManagement }) {
  const { showForm, form, formError, semestersQuery, branchesQuery, semesters, branches, selectedSemester, isFirstYear, createMutation, updateField, closeCreateForm, handleSubmit, loadingReferenceData, setForm, setFormError, setSuccessMessage } = management;
  return (
    <>
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
                  <span className={labelClass}>Cycle Name *</span>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Example: Unit Test Cycle 1"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Academic Year *</span>
                  <input
                    type="text"
                    required
                    value={form.academicYear}
                    onChange={(event) =>
                      updateField("academicYear", event.target.value)
                    }
                    placeholder="Example: 2026-27"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Semester *</span>
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
                    className={inputClass}
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
                  <span className={labelClass}>
                    Branch {selectedSemester && !isFirstYear ? "*" : ""}
                  </span>
                  <select
                    value={form.branchId}
                    disabled={!selectedSemester || isFirstYear}
                    required={Boolean(selectedSemester && !isFirstYear)}
                    onChange={(event) =>
                      updateField("branchId", event.target.value)
                    }
                    className={inputClass}
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
                  <span className={labelClass}>Start Test Number *</span>
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
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>End Test Number *</span>
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
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>
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
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Test Date *</span>
                  <input
                    type="date"
                    required
                    value={form.testDate}
                    onChange={(event) =>
                      updateField("testDate", event.target.value)
                    }
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>
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
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>
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
                    className={inputClass}
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
                    The backend creates tests for applicable subjects and each number in the selected range.
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
                  disabled={
                    createMutation.isPending || loadingReferenceData
                  }
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
    </>
  );
}
