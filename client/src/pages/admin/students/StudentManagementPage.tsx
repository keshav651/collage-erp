
import StudentManagement from "./StudentManagement";

export default function StudentManagementPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Student Management
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Manage student records, import and export data.
        </p>
      </div>

      <StudentManagement />
    </section>
  );
}
