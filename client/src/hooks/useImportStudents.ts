import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importStudents } from "../api/studentApi";

export default function useImportStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importStudents,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "students"],
      });
    },
  });
}