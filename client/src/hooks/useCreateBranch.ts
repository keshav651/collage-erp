
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBranch,
  type CreateBranchPayload,
} from "../api/adminApi";

export default function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBranchPayload) => createBranch(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "branches"],
      });
    },
  });
}
