import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStudent } from "../api/studentApi";

export default function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        rollNo?: string;
        name?: string;
        branchId?: string;
        semesterId?: string;
      };
    }) => updateStudent(id, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "students"],
      });
    },
  });
}