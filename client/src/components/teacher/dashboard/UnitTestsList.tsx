
import {
  AlertCircle,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

type UnitTestsListProps = {
  unitTests: any[];
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
};

export default function UnitTestsList({
  unitTests,
  isLoading,
  isError,
  onRefresh,
}: UnitTestsListProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            My Unit Tests
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            View unit tests assigned to your subjects.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={isLoading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-red-900" />
          <p className="text-sm text-gray-600">
            Loading unit tests...
          </p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2 text-red-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-medium">
                Unable to load unit tests.
              </p>

              <p className="mt-1 text-sm">
                Please check your connection and try again.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="mt-3 text-sm font-semibold text-red-900 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && unitTests.length === 0 && (
        <div className="mt-5 rounded-lg bg-gray-50 p-6 text-center">
          <CalendarDays
            size={30}
            className="mx-auto text-gray-400"
          />

          <p className="mt-3 font-medium text-gray-800">
            No unit tests found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Tests will appear here when they are available
            for your assigned subjects.
          </p>
        </div>
      )}

      {/* Unit Tests List */}
      {!isLoading && !isError && unitTests.length > 0 && (
        <div className="mt-5 space-y-3">
          {unitTests.map((test: any) => (
            <article
              key={test.id}
              className="rounded-xl border border-gray-200 p-4 transition hover:border-red-200 hover:shadow-sm sm:p-5"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <h3 className="break-words font-semibold text-gray-900">
                    {test.title || `Unit Test ${test.testNumber}`}
                  </h3>

                  <p className="mt-1 text-sm text-gray-600">
                    Subject: {test.subject?.name || "Not available"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Maximum marks: {test.maxMarks}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Test date:{" "}
                    {test.testDate
                      ? new Date(test.testDate).toLocaleDateString("en-IN")
                      : "Not scheduled"}
                  </p>

                  {test.cycle?.semester?.number && (
                    <p className="mt-1 text-sm text-gray-500">
                      Semester: {test.cycle.semester.number}
                    </p>
                  )}

                  {test.cycle?.academicYear && (
                    <p className="mt-1 text-sm text-gray-500">
                      Academic year: {test.cycle.academicYear}
                    </p>
                  )}
                </div>

                <span className="inline-flex w-fit shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-900">
                  Test {test.testNumber}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
