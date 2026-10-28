import { useQuery } from "@tanstack/react-query";
import { getSubjects } from "../api/subjectApi";

export default function useSubjects(
  branchId?: string,
  semesterId?: string
) {
  return useQuery({
    queryKey: ["admin", "subjects", branchId, semesterId],
    queryFn: () =>
      getSubjects({
        branchId,
        semesterId,
      }),
  });
}