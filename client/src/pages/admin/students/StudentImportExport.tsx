import type { ChangeEvent } from "react";
import {
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";

import type {
  StudentBranch,
  StudentSemester,
  StudentImportResponse,
} from "../../../api/studentApi";

interface StudentImportExportProps {
  branches: StudentBranch[];
  semesters: StudentSemester[];

  selectedExportBranch: string;
  selectedExportSemester: string;

  onExportBranchChange: (value: string) => void;
  onExportSemesterChange: (value: string) => void;

  onDownloadTemplate: () => void;
  onImportStudents: (event: ChangeEvent<HTMLInputElement>) => void;
  onExportStudents: () => void;

  isDownloadingTemplate: boolean;
  isImporting: boolean;
  isExporting: boolean;

  importResults: StudentImportResponse | null;
  onDismissImportResults: () => void;
}

export default function StudentImportExport({
  branches,
  semesters,
  selectedExportBranch,
  selectedExportSemester,
  onExportBranchChange,
  onExportSemesterChange,
  onDownloadTemplate,
  onImportStudents,
  onExportStudents,
  isDownloadingTemplate,
  isImporting,
  isExporting,
  importResults,
  onDismissImportResults,
}: StudentImportExportProps) {
  return (
    <>
      {/* Excel Import / Export */}
      <div className="space-y-4 border-b border-gray-100 bg-gray-50/70 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <FileSpreadsheet
            size={20}
            className="text-[#921B25]"
          />

          <div>
            <h4 className="font-semibold text-gray-800">
              Excel Import & Export
            </h4>

            <p className="text-xs text-gray-500">
              Import multiple students or export student records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Download Template */}
          <button
            type="button"
            onClick={onDownloadTemplate}
            disabled={isDownloadingTemplate}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#921B25]/30 bg-white px-4 py-2 text-sm font-semibold text-[#921B25] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={17} />

            {isDownloadingTemplate
              ? "Downloading..."
              : "Download Template"}
          </button>

          {/* Import Excel */}
          <label
            className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#921B25] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#74151d] ${
              isImporting
                ? "pointer-events-none opacity-50"
                : ""
            }`}
          >
            <Upload size={17} />

            {isImporting ? "Importing..." : "Import Excel"}

            <input
              type="file"
              accept=".xlsx"
              onChange={onImportStudents}
              disabled={isImporting}
              className="hidden"
            />
          </label>

          {/* Export Excel */}
          <button
            type="button"
            onClick={onExportStudents}
            disabled={isExporting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet size={17} />

            {isExporting ? "Exporting..." : "Export Excel"}
          </button>
        </div>

        {/* Export Filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="export-branch"
              className="mb-1 block text-xs font-medium text-gray-600"
            >
              Export by branch
            </label>

            <select
              id="export-branch"
              value={selectedExportBranch}
              onChange={(event) =>
                onExportBranchChange(event.target.value)
              }
              className="min-h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
            >
              <option value="">All branches</option>

              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="export-semester"
              className="mb-1 block text-xs font-medium text-gray-600"
            >
              Export by semester
            </label>

            <select
              id="export-semester"
              value={selectedExportSemester}
              onChange={(event) =>
                onExportSemesterChange(event.target.value)
              }
              className="min-h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
            >
              <option value="">All semesters</option>

              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  Semester {semester.number}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Excel Import Results */}
      {importResults && (
        <div className="border-b border-gray-100 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="font-semibold text-gray-800">
              Import Report
            </h4>

            <button
              type="button"
              onClick={onDismissImportResults}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100"
            >
              Dismiss
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-xs text-gray-500">
                Total Records
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800">
                {importResults.totalRecords}
              </p>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-xs text-green-700">
                Imported Successfully
              </p>

              <p className="mt-1 text-2xl font-bold text-green-700">
                {importResults.successfulRecords}
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs text-red-700">
                Failed Records
              </p>

              <p className="mt-1 text-2xl font-bold text-red-700">
                {importResults.failedRecords}
              </p>
            </div>
          </div>

          {/* Failed Records */}
          {importResults.errors.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-lg border border-red-200">
              <div className="bg-red-50 px-4 py-3">
                <h5 className="text-sm font-semibold text-red-800">
                  Records Requiring Attention
                </h5>
              </div>

              <div className="max-h-64 overflow-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="sticky top-0 bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">
                        Row
                      </th>

                      <th className="px-3 py-2 font-medium">
                        Roll Number
                      </th>

                      <th className="px-3 py-2 font-medium">
                        Reason
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {importResults.errors.map((error, index) => (
                      <tr key={`${error.row}-${index}`}>
                        <td className="px-3 py-2 text-gray-700">
                          {error.row}
                        </td>

                        <td className="px-3 py-2 text-gray-700">
                          {error.rollNo || "—"}
                        </td>

                        <td className="px-3 py-2 text-red-700">
                          {error.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}