
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateTeacher,
  type UpdateTeacherPayload,
} from "../api/adminApi";

export default function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateTeacherPayload;
    }) => updateTeacher(userId, payload),

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