import { useAuth } from "../../context/AuthContext";
import useLogout from "../../hooks/useLogout";
import { useTeacherUnitTests } from "../../hooks/useTeacherUnitTests";

import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  LogOut,
  RefreshCw,
  UserRound,
} from "lucide-react";

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

export default function TeacherDashboard() {
  const { user } = useAuth();
  const logout = useLogout();

  const {
    data: unitTestsResponse,
    isLoading: isUnitTestsLoading,
    isError: isUnitTestsError,
    refetch: refetchUnitTests,
  } = useTeacherUnitTests();

  const unitTests = Array.isArray(unitTestsResponse?.data)
    ? unitTestsResponse.data
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-bold text-red-900 sm:text-2xl">
              MSME College ERP
            </h1>
            <p className="text-sm text-gray-500">Teacher Dashboard</p>
          </div>

          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={17} />

            <span>
              {logout.isPending ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Welcome Section */}
        <section className="rounded-2xl bg-red-900 p-5 text-white shadow-sm sm:p-8">
          <p className="text-sm text-red-100">Welcome back,</p>

          <h2 className="mt-1 break-words text-2xl font-bold sm:text-3xl">
            {user?.name || "Teacher"}
          </h2>

          <p className="mt-2 break-all text-sm text-red-100">
            {user?.email}
          </p>

          <span className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            {user?.role || "TEACHER"}
          </span>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Quick Actions
            </h2>

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

        {/* Unit Tests */}
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
              onClick={() => void refetchUnitTests()}
              disabled={isUnitTestsLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  isUnitTestsLoading ? "animate-spin" : ""
                }
              />

              Refresh
            </button>
          </div>

          {/* Loading State */}
          {isUnitTestsLoading && (
            <div className="flex items-center justify-center gap-3 py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-red-900" />

              <p className="text-sm text-gray-600">
                Loading unit tests...
              </p>
            </div>
          )}

          {/* Error State */}
          {!isUnitTestsLoading && isUnitTestsError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2 text-red-800">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

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
                onClick={() => void refetchUnitTests()}
                className="mt-3 text-sm font-semibold text-red-900 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isUnitTestsLoading &&
            !isUnitTestsError &&
            unitTests.length === 0 && (
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
          {!isUnitTestsLoading &&
            !isUnitTestsError &&
            unitTests.length > 0 && (
              <div className="mt-5 space-y-3">
                {unitTests.map((test: any) => (
                  <article
                    key={test.id}
                    className="rounded-xl border border-gray-200 p-4 transition hover:border-red-200 hover:shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <h3 className="break-words font-semibold text-gray-900">
                          {test.title ||
                            `Unit Test ${test.testNumber}`}
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                          Subject:{" "}
                          {test.subject?.name || "Not available"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Maximum marks: {test.maxMarks}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Test date:{" "}
                          {test.testDate
                            ? new Date(
                                test.testDate
                              ).toLocaleDateString("en-IN")
                            : "Not scheduled"}
                        </p>

                        {test.cycle?.semester?.number && (
                          <p className="mt-1 text-sm text-gray-500">
                            Semester:{" "}
                            {test.cycle.semester.number}
                          </p>
                        )}

                        {test.cycle?.academicYear && (
                          <p className="mt-1 text-sm text-gray-500">
                            Academic year:{" "}
                            {test.cycle.academicYear}
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

        {/* Account Information */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="font-semibold text-gray-900">
            Account Information
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Name</p>

              <p className="mt-1 break-words font-medium text-gray-800">
                {user?.name || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>

              <p className="mt-1 break-all font-medium text-gray-800">
                {user?.email || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Role</p>

              <p className="mt-1 font-medium text-gray-800">
                {user?.role || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Account Status</p>

              <p className="mt-1 font-medium text-gray-800">
                {user?.status || "Not available"}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}