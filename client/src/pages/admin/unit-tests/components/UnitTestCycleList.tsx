import type { UnitTestManagement } from "../hooks/useUnitTestManagement";
import { formatDate, getErrorMessage } from "../utils";
import { Plus, RefreshCw, Trash2 } from "lucide-react";

export default function UnitTestCycleList({ management }: { management: UnitTestManagement }) {
  const { cyclesQuery, cycles, deleteMutation, handleDeleteCycle, openCreateForm } = management;
  return (
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
                  Create your first cycle to generate unit tests for applicable subjects.
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
                  const subjectNames = [...subjectMap.values()];
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
                        <button
                          type="button"
                          onClick={() => handleDeleteCycle(cycle)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleteMutation.isPending ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          {deleteMutation.isPending ? "Deleting..." : "Delete Cycle"}
                        </button>
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
  );
}
