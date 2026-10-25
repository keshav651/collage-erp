
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "../api/studentApi";

export default function useStudents() {
  return useQuery({
    queryKey: ["admin", "students"],
    queryFn: getStudents,
  });
}
