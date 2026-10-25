import { useQuery } from "@tanstack/react-query";
import { getPendingTeachers } from "../api/adminApi";

export default function usePendingTeachers() {
  return useQuery({
    queryKey: ["admin", "pending-teachers"],
    queryFn: getPendingTeachers,
  });
}