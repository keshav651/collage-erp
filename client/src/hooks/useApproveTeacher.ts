
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveTeacher,
  type ApproveTeacherPayload,
} from "../api/adminApi";

interface ApproveTeacherVariables {
  userId: string;
  payload: ApproveTeacherPayload;
}

export default function useApproveTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: ApproveTeacherVariables) =>
      approveTeacher(userId, payload),

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
