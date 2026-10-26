import { Link } from "react-router-dom";
import StudentManagement from "./StudentManagement";

export default function StudentManagementPage() {
  return (
    <main className="min-h-screen bg-[#FFF9F7] p-4 sm:p-6">
      {/* Page Navigation */}
      <div className="mx-auto mb-6 flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Student Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage student records, import and export data.
          </p>
        </div>

        <Link
          to="/admin/dashboard"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#921B25] px-5 py-3 font-semibold text-white transition hover:bg-[#75151D]"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <StudentManagement />
    </main>
  );
}