
import { FilterX, Search } from "lucide-react";

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

  selectedBranch: string;
  selectedSemester: string;
  search: string;

  onBranchChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClear: () => void;

  semestersLoading: boolean;
  semestersError: boolean;
  showSearch: boolean;
};

const selectClassName =
  "min-h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100";

export default function StudentFilters({
  branches,
  semesters,
  selectedBranch,
  selectedSemester,
  search,
  onBranchChange,
  onSemesterChange,
  onSearchChange,
  onClear,
  semestersLoading,
  semestersError,
  showSearch,
}: Props) {
  const hasAnyFilter =
    Boolean(selectedBranch) || Boolean(selectedSemester) || Boolean(search);

  return (
    <div className="border-b border-gray-100 bg-gray-50/50 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Filter Students
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Select branch and semester to view student records.
          </p>
        </div>

        {hasAnyFilter && (
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
            htmlFor="student-list-branch"
            className="mb-1.5 block text-xs font-medium text-gray-600"
          >
            Branch
          </label>

          <select
            id="student-list-branch"
            value={selectedBranch}
            onChange={(event) => onBranchChange(event.target.value)}
            className={selectClassName}
          >
            <option value="">Select Branch</option>

            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="student-list-semester"
            className="mb-1.5 block text-xs font-medium text-gray-600"
          >
            Semester
          </label>

          <select
            id="student-list-semester"
            value={selectedSemester}
            onChange={(event) => onSemesterChange(event.target.value)}
            disabled={semestersLoading || semestersError}
            className={selectClassName}
          >
            <option value="">
              {semestersLoading
                ? "Loading semesters..."
                : semestersError
                  ? "Unable to load semesters"
                  : "Select Semester"}
            </option>

            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                Semester {semester.number}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showSearch && (
        <div className="relative mt-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by student name or father's name..."
            aria-label="Search students"
            className="min-h-10 w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
          />
        </div>
      )}
    </div>
  );
}
