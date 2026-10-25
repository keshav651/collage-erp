import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStudentStatus } from "../api/studentApi";

export default function useUpdateStudentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }) => updateStudentStatus(id, isActive),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "students"],
      });
    },
  });
}