import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSubject,
  type CreateSubjectPayload,
} from "../api/subjectApi";

export default function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSubjectPayload) =>
      createSubject(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "subjects"],
      });
    },
  });
}