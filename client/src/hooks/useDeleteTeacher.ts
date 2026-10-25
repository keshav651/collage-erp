
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateTeacher } from "../api/adminApi";

export default function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deactivateTeacher(userId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin", "teachers"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin", "pending-teachers"],
        }),
      ]);
    },
  });
}
