import { useQuery } from "@tanstack/react-query";
import { getAllBranches } from "../api/adminApi";

export default function useBranches() {
  return useQuery({
    queryKey: ["admin", "branches"],
    queryFn: getAllBranches,
  });
}