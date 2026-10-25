import { useQuery } from "@tanstack/react-query";
import { getTeacherUnitTests } from "../api/teacherUnitTestsApi";

export function useTeacherUnitTests() {
  return useQuery({
    queryKey: ["teacher", "unit-tests"],
    queryFn: getTeacherUnitTests,
    retry: false,
    staleTime: 60_000,
  });
}