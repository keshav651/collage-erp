import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateSubject,
  type UpdateSubjectPayload,
} from "../api/subjectApi";

interface UpdateSubjectVariables {
  id: string;
  payload: UpdateSubjectPayload;
}

export default function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateSubjectVariables) =>
      updateSubject(id, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "subjects"],
      });
    },
  });
}