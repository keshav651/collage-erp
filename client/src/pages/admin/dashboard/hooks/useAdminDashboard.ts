
import usePendingTeachers from "../../../../hooks/usePendingTeachers";
import useBranches from "../../../../hooks/useBranches";
import useTeachers from "../../../../hooks/useTeachers";

export default function useAdminDashboard() {
  const {
    data: pendingData,
    isLoading: pendingLoading,
    isError: pendingError,
  } = usePendingTeachers();

  const {
    data: branchesData,
    isLoading: branchesLoading,
    isError: branchesError,
  } = useBranches();

  const {
    data: teachersData,
    isLoading: teachersLoading,
    isError: teachersError,
  } = useTeachers();

  const pendingCount = pendingData?.data?.length ?? 0;

  const branches = branchesData?.data ?? [];
  const branchCount =
    branchesData?.count ?? branches.length;

  const activeTeachers = teachersData?.data ?? [];
  const teacherCount =
    teachersData?.count ?? activeTeachers.length;

  return {
    pendingCount,
    pendingLoading,
    pendingError,

    branches,
    branchCount,
    branchesLoading,
    branchesError,

    teacherCount,
    teachersLoading,
    teachersError,
  };
}
