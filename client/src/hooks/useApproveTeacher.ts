import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveTeacher } from "../api/adminApi";

export default function useApproveTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      branchId,
    }: {
      userId: string;
      branchId: string;
    }) => approveTeacher(userId, branchId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin", "pending-teachers"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin", "teachers"],
        }),
      ]);
    },
  });
}