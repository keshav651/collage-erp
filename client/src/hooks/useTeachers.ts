import { useQuery } from "@tanstack/react-query";
import { getAllTeachers } from "../api/adminApi";

export default function useTeachers() {
  return useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: getAllTeachers,
  });
}