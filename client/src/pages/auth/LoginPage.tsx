import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: loginUser,

        onSuccess: (response) => {
            const role = response.data.user.role;
            toast.success("Login successful!");

            if (role === "ADMIN") {
                navigate("/admin/dashboard", { replace: true });
            } else if (role === "TEACHER") {
                navigate("/teacher/dashboard", { replace: true });
            }
        },

        onError: (response) => {
            toast.error(response.message || "Login failed. Try again later.");
        }
    });

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        loginMutation.mutate({
            email,
            password,
        });;
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#FFF9F7] px-4 py-8">
            <section className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-[#921B25]">
                        MSME College ERP
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Email address
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            autoComplete="username"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                        />
                    </div>


                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((previous) => !previous)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                aria-pressed={showPassword}
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-[#921B25] focus:outline-none"
                            >
                                {showPassword ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="21"
                                        height="21"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M3 3l18 18" />
                                        <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                                        <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 9 5 10 7a12.5 12.5 0 01-3 3.8" />
                                        <path d="M6.6 6.6C4.2 8 2.5 10.2 2 12c.6 1.5 2 3.4 4.1 4.9A10 10 0 0012 19c1 0 2-.2 2.9-.5" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="21"
                                        height="21"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>


                    {loginMutation.isError && (
                        <p className="text-sm text-red-600" role="alert">
                            {loginMutation.error instanceof Error
                                ? loginMutation.error.message
                                : "Login failed. Please try again."}
                        </p>
                    )}

                    < button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full rounded-lg bg-[#921B25] px-4 py-3 font-semibold text-white transition hover:bg-[#75151D] focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                    </button>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-semibold text-[#9B1C31] hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>

                </form>
            </section>
        </main >
    );
}
