import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSubject } from "../api/subjectApi";

export default function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSubject(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "subjects"],
      });
    },
  });
}