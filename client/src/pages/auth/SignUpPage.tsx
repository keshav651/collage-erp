import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../../api/authApi";
import axios from "axios";

export default function SignupPage() {
    const navigate = useNavigate();

    const signupMutation = useMutation({
        mutationFn: googleLogin,

        onSuccess: (response) => {
            const user = response.data?.user;
            toast.success("Registration successful! Awaiting admin approval.");

            if (user?.status === "PENDING") {
                navigate("/pending-approval", { replace: true });
            } else if (user?.role === "ADMIN") {
                navigate("/admin/dashboard", { replace: true });
            } else if (
                user?.role === "TEACHER" &&
                user?.status === "APPROVED"
            ) {
                navigate("/teacher/dashboard", { replace: true });
            }
        },

        onError: (error: unknown) => {
            if (axios.isAxiosError(error)) {
                const backendMessage = error.response?.data?.message;

                toast.error(
                    typeof backendMessage === "string"
                        ? backendMessage
                        : "Registration failed. Please try again."
                );
            } else {
                toast.error("Registration failed. Please try again.");
            }
        },
    });

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#FFF9F7] px-4 py-8">
            <section className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm sm:p-8">
                <h1 className="text-2xl font-bold text-[#921B25]">
                    MSME College ERP
                </h1>

                <h2 className="mt-5 text-xl font-semibold text-gray-800">
                    Create your account
                </h2>

                <p className="mt-2 mb-6 text-sm text-gray-500">
                    Register as a teacher using your Google account.
                </p>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={(credentialResponse) => {
                            if (credentialResponse.credential) {
                                signupMutation.mutate(
                                    credentialResponse.credential
                                );
                            }
                        }}
                        onError={() => {
                            toast.error("Google sign-up failed. Please try again.");
                        }}
                    />
                </div>

                {signupMutation.isPending && (
                    <p className="mt-4 text-sm text-gray-600">
                        Creating your account...
                    </p>
                )}


                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mt-6 text-sm font-medium text-[#921B25] hover:underline"
                >
                    Back to Login
                </button>
            </section>
        </main>
    );
}
