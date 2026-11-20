
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function MarksEntryHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-xl font-bold text-red-900">
            Unit Test Marks Entry
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Excel-style subject-wise marks sheet
          </p>
        </div>

        <Link
          to="/teacher/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
      </div>
    </header>
  );
}
