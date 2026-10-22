
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck, UserRound } from "lucide-react";

import LoginForm, {
  type LoginFormValues,
} from "../components/LoginForm";
import MsmeBranding from "../components/MsmеBranding";
import { authApi } from "../../../api/auth.api";
import { useAuthContext } from "../../../context/AuthProvider";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshSession } = useAuthContext();

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);

      const response = await authApi.login(values);

      if (!response.success) {
        toast.error(response.message || "Login failed");
        return;
      }

      // Verify the HttpOnly cookie through the backend session endpoint.
      await refreshSession();

      // The session endpoint is authoritative for authentication.
      const session = await authApi.getSession();

      if (session.user.role === "ADMIN") {
        window.location.replace("/admin");
      } else if (session.user.role === "TEACHER") {
        window.location.replace("/teacher");
      } else {
        toast.error("This account does not have an allowed role.");
      }
    } catch {
      toast.error("Unable to login. Check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF9F7] text-gray-900 lg:grid lg:grid-cols-2">
      <section className="relative overflow-hidden bg-[#921B25] px-6 py-8 text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-12">
        <div className="mx-auto max-w-md space-y-8">
          <MsmeBranding />

          <div className="hidden space-y-4 text-center lg:block">
            <h2 className="text-3xl font-bold">
              College ERP Portal
            </h2>
            <p className="text-sm leading-6 text-white/80">
              A unified portal for faculty and administration.
              Manage academic workflows securely in one place.
            </p>
          </div>
        </div>
      </section>

      <section className="relative -mt-4 rounded-t-[2rem] bg-[#FFF9F7] px-5 pb-10 pt-8 sm:px-10 lg:mt-0 lg:flex lg:items-center lg:justify-center lg:rounded-none">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <MsmeBranding compact />
          </div>

          <div className="mb-7">
            <h2 className="text-3xl font-bold text-[#921B25]">
              Login
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Access your account to continue
            </p>
          </div>

          <LoginForm
            onSubmit={handleLogin}
            isSubmitting={isSubmitting}
          />

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#921B25]/20" />
            <span className="text-sm text-gray-500">Login as</span>
            <div className="h-px flex-1 bg-[#921B25]/20" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-center gap-2 rounded-xl border border-[#921B25]/50 px-3 py-3 text-sm font-semibold text-[#921B25]">
              <UserRound size={19} />
              Faculty
            </div>

            <div className="flex items-center justify-center gap-2 rounded-xl border border-[#921B25]/50 px-3 py-3 text-sm font-semibold text-[#921B25]">
              <ShieldCheck size={19} />
              Admin
            </div>
          </div>

          <p className="mt-7 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#921B25] underline-offset-4 hover:underline"
            >
              Contact Administrator
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
