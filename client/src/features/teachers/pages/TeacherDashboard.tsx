
import { ClipboardList, FileText, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";

const teacherActions = [
  {
    title: "Unit Tests",
    description: "View tests assigned to your subjects.",
    icon: ClipboardList,
    to: "/teacher/unit-tests",
  },
  {
    title: "Marks Entry",
    description: "Open a unit test to enter or update marks.",
    icon: FileText,
    to: "/teacher/unit-tests",
  },
  {
    title: "Change Password",
    description: "Update your account password.",
    icon: KeyRound,
    to: "/teacher/change-password",
  },
];

export default function TeacherDashboard() {
  return (
    <main className="space-y-6">
      <header>
        <p className="text-sm font-medium text-[#921B25]">
          FACULTY PORTAL
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Teacher Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your available academic tasks.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {teacherActions.map(({ title, description, icon: Icon, to }) => (
          <Link
            key={title}
            to={to}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#921B25]/40"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#921B25]/10 text-[#921B25]">
              <Icon size={22} />
            </div>
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <p className="mt-2 text-sm leading-5 text-gray-500">
              {description}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
