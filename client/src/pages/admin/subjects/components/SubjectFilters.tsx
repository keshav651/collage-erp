
import { Filter, FilterX } from "lucide-react";

type Branch = {
  id: string;
  name: string;
};

type Semester = {
  id: string;
  number: number;
};

type Props = {
  branches: Branch[];
  semesters: Semester[];
  branchFilter: string;
  semesterFilter: string;
  requiresBranchFilter: boolean;
  onBranchChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onClear: () => void;
};

const selectClassName =
  "min-h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100 disabled:bg-gray-100";

export default function SubjectFilters({
  branches,
  semesters,
  branchFilter,
  semesterFilter,
  requiresBranchFilter,
  onBranchChange,
  onSemesterChange,
  onClear,
}: Props) {
  const hasFilters = Boolean(semesterFilter || branchFilter);

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Filter size={17} className="text-[#921B25]" />
          <h2 className="text-sm font-semibold text-gray-900">
            Filter Subjects
          </h2>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#921B25] hover:underline"
          >
            <FilterX size={15} />
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="filter-semester"
            className="mb-1.5 block text-xs font-medium text-gray-700"
          >
            Semester
          </label>

          <select
            id="filter-semester"
            value={semesterFilter}
            onChange={(event) => onSemesterChange(event.target.value)}
            className={selectClassName}
          >
            <option value="">Select Semester</option>

            {[...semesters]
              .sort((a, b) => a.number - b.number)
              .map((semester) => (
                <option key={semester.id} value={semester.id}>
                  Semester {semester.number}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-branch"
            className="mb-1.5 block text-xs font-medium text-gray-700"
          >
            Branch {requiresBranchFilter ? "*" : "(Common)"}
          </label>

          <select
            id="filter-branch"
            value={branchFilter}
            onChange={(event) => onBranchChange(event.target.value)}
            disabled={!semesterFilter || !requiresBranchFilter}
            className={selectClassName}
          >
            <option value="">
              {!semesterFilter
                ? "Select semester first"
                : requiresBranchFilter
                  ? "Select Branch"
                  : "Common Subjects"}
            </option>

            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Semester 1–2 subjects are common. Semester 3 onwards
        requires a branch.
      </p>
    </div>
  );
}
