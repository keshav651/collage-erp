
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  UserRound,
} from "lucide-react";

import { Link } from "react-router-dom";

const quickActions = [
  {
    title: "Unit Tests",
    description: "View and manage unit test marks.",
    icon: ClipboardCheck,
    path: "/teacher/unit-tests",
    available: true,
  },
  {
    title: "Attendance",
    description: "Manage classroom attendance.",
    icon: UserRound,
    path: "/teacher/attendance",
    available: false,
  },
  {
    title: "Subjects",
    description: "View your assigned subjects.",
    icon: BookOpen,
    path: "/teacher/subjects",
    available: false,
  },
  {
    title: "Assignments",
    description: "Manage classroom assignments.",
    icon: FileText,
    path: "/teacher/assignments",
    available: false,
  },
];

export default function QuickActions() {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Quick Actions
        </h2>

        <Link
          to="/teacher/unit-tests"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
        >
          📊 Enter Unit Test Marks
        </Link>

        <p className="mt-1 text-sm text-gray-500">
          Choose a module to continue your work.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <article
              key={action.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-900">
                <Icon size={22} />
              </div>

              <h3 className="font-semibold text-gray-900">
                {action.title}
              </h3>

              <p className="mt-2 min-h-10 text-sm leading-5 text-gray-500">
                {action.description}
              </p>

              <p
                className={`mt-4 text-xs font-medium ${
                  action.available
                    ? "text-green-700"
                    : "text-gray-500"
                }`}
              >
                {action.available
                  ? "API integration in progress"
                  : "Module setup pending"}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
