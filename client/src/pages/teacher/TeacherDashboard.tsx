import { useAuth } from "../../context/AuthContext";
import useLogout from "../../hooks/useLogout";
import { useTeacherUnitTests } from "../../hooks/useTeacherUnitTests";
import DashboardHeader from "../../components/teacher/dashboard/DashboardHeader";
import WelcomeSection from "../../components/teacher/dashboard/WelcomeSection";
import QuickActions from "../../components/teacher/dashboard/QuickActions";
import UnitTestsList from "../../components/teacher/dashboard/UnitTestsList";
import AccountInformation from "../../components/teacher/dashboard/AccountInformation";

import {
  BookOpen,
  ClipboardCheck,
  FileText,
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
      <DashboardHeader
        onLogout={() => logout.mutate()}
        isLoggingOut={logout.isPending}
      />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Welcome Section */}
        <WelcomeSection
          name={user?.name}
          email={user?.email}
          role={user?.role}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Unit Tests */}
        <UnitTestsList
          unitTests={unitTests}
          isLoading={isUnitTestsLoading}
          isError={isUnitTestsError}
          onRefresh={() => void refetchUnitTests()}
        />

        {/* Account Information */}
        <AccountInformation
          name={user?.name}
          email={user?.email}
          role={user?.role}
          status={user?.status}
        />
      </main>
    </div>
  );
}