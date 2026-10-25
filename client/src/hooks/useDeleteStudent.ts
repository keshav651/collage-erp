import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStudent } from "../api/studentApi";

export default function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });
    },
  });
}