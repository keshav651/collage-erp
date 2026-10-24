
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logoutUser } from "../api/authApi";

export default function useLogout() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUser,

    onSuccess: (response) => {
      toast.success(response.message || "Logout successful!");
      navigate("/", { replace: true });
    },

    onError: () => {
      toast.error("Logout failed. Please try again.");
    },
  });
}
