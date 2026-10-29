import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateTeacher } from "../api/adminApi";

export default function useDeactivateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deactivateTeacher(userId),

    onSuccess: async (_response, userId) => {
      // Update the cached list immediately.
      queryClient.setQueryData(
        ["admin", "teachers"],
        (oldData: any) => {
          if (!oldData?.data) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((teacher: any) =>
              teacher.userId === userId
                ? {
                    ...teacher,
                    user: {
                      ...teacher.user,
                      status: "INACTIVE",
                    },
                  }
                : teacher
            ),
          };
        }
      );

      // Refetch from the backend to keep the list in sync.
      await queryClient.invalidateQueries({
        queryKey: ["admin", "teachers"],
      });
    },
  });
}