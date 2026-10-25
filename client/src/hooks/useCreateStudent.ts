import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStudent } from "../api/studentApi";

export default function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "students"],
      });
    },
  });
}