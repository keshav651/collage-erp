import type { UnitTestManagement } from "../hooks/useUnitTestManagement";
import { Plus } from "lucide-react";

export default function UnitTestCycleHeader({ management }: { management: UnitTestManagement }) {
  const { showForm, formError, successMessage, cycles, openCreateForm } = management;
  return (
    <>
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
    </>
  );
}
