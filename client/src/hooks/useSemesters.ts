import { useQuery } from "@tanstack/react-query";
import { getSemesters } from "../api/semesterApi";

export default function useSemesters() {
  return useQuery({
    queryKey: ["admin", "semesters"],
    queryFn: getSemesters,
  });
}