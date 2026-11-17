import type { UnitTestManagement } from "../hooks/useUnitTestManagement";
import { inputClass, labelClass } from "../utils";
import { RefreshCw, FileSpreadsheet, Download, Filter } from "lucide-react";

export default function UnitTestExport({ management }: { management: UnitTestManagement }) {
  const { exportFilters, exportError, exportSuccess, exporting, exportMode, semesters, branches, exportSubjects, academicYears, exportCycleOptions, updateExportFilter, resetExportFilters, handleExport, loadingReferenceData } = management;
  return (
<section className="mt-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet
                  className="text-[#921B25]"
                  size={23}
                />
                <h2 className="text-lg font-bold text-gray-900">
                  Export Unit Test Marks
                </h2>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Select the filters to export marks for a particular
                semester, branch, subject, academic year or test cycle.
              </p>
            </div>
            <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#921B25]">
              Excel Workbook (.xlsx)
            </span>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label>
              <span className={labelClass}>Semester</span>
              <select
                value={exportFilters.semesterId}
                onChange={(event) =>
                  updateExportFilter("semesterId", event.target.value)
                }
                className={inputClass}
                disabled={loadingReferenceData}
              >
                <option value="">All semesters</option>
                {semesters
                  .slice()
                  .sort((a, b) => a.number - b.number)
                  .map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      Semester {semester.number}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span className={labelClass}>Branch</span>
              <select
                value={exportFilters.branchId}
                onChange={(event) =>
                  updateExportFilter("branchId", event.target.value)
                }
                className={inputClass}
                disabled={loadingReferenceData}
              >
                <option value="">All branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                    {branch.codePrefix
                      ? ` (${branch.codePrefix})`
                      : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={labelClass}>Subject</span>
              <select
                value={exportFilters.subjectId}
                onChange={(event) =>
                  updateExportFilter("subjectId", event.target.value)
                }
                className={inputClass}
              >
                <option value="">All subjects</option>
                {exportSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code
                      ? `${subject.code} - ${subject.name}`
                      : subject.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={labelClass}>Academic Year</span>
              <select
                value={exportFilters.academicYear}
                onChange={(event) =>
                  updateExportFilter(
                    "academicYear",
                    event.target.value,
                  )
                }
                className={inputClass}
              >
                <option value="">All academic years</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2 lg:col-span-2">
              <span className={labelClass}>Unit Test Cycle</span>
              <select
                value={exportFilters.cycleId}
                onChange={(event) =>
                  updateExportFilter("cycleId", event.target.value)
                }
                className={inputClass}
              >
                <option value="">All matching cycles</option>
                {exportCycleOptions.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name} — {cycle.academicYear} — Semester{" "}
                    {cycle.semester?.number ?? "—"} —{" "}
                    {cycle.branch?.name ?? "Common Cycle"}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => handleExport("filtered")}
              disabled={exporting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#921B25] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#75151D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exporting && exportMode === "filtered" ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Filter size={18} />
              )}
              {exporting && exportMode === "filtered"
                ? "Exporting..."
                : "Export Filtered Excel"}
            </button>
            <button
              type="button"
              onClick={() => handleExport("all")}
              disabled={exporting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-5 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exporting && exportMode === "all" ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {exporting && exportMode === "all"
                ? "Exporting..."
                : "Download All Excel"}
            </button>
            <button
              type="button"
              onClick={resetExportFilters}
              disabled={exporting}
              className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              Reset Filters
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-gray-500">
            Download All creates a workbook with separate worksheets for
            semester and branch combinations. Filtered export applies only
            the filters selected above.
          </p>
          {exportSuccess && (
            <div
              role="status"
              className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800"
            >
              {exportSuccess}
            </div>
          )}
          {exportError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {exportError}
            </div>
          )}
        </section>
  );
}
