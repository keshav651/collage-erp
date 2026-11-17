import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useUnitTestManagement } from "./hooks/useUnitTestManagement";
import UnitTestExport from "./components/UnitTestExport";
import UnitTestCycleHeader from "./components/UnitTestCycleHeader";
import UnitTestCycleForm from "./components/UnitTestCycleForm";
import UnitTestCycleList from "./components/UnitTestCycleList";

export default function UnitTestManagementPage() {
  const management = useUnitTestManagement();
  return (
    <main className="min-h-screen bg-[#FFF9F7] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#921B25] sm:text-3xl">
              Unit Test Management
            </h1>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Create unit test cycles and export subject-wise marks.
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
        <UnitTestExport management={management} />
        <UnitTestCycleHeader management={management} />
        <UnitTestCycleForm management={management} />
        <UnitTestCycleList management={management} />
      </div>
    </main>
  );
}
