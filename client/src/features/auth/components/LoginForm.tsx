
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export default function LoginForm({
  onSubmit,
  isSubmitting = false,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
          Email address
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 focus-within:border-[#921B25] focus-within:ring-2 focus-within:ring-[#921B25]/10">
          <Mail size={19} className="shrink-0 text-gray-500" />
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="Enter your email"
            {...register("email")}
            aria-invalid={Boolean(errors.email)}
            className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none"
          />
        </div>

        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
          Password
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 focus-within:border-[#921B25] focus-within:ring-2 focus-within:ring-[#921B25]/10">
          <LockKeyhole size={19} className="shrink-0 text-gray-500" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
            className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="rounded-md p-1 text-gray-500 hover:text-[#921B25]"
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#921B25] px-4 py-3.5 font-semibold text-white transition hover:bg-[#78151E] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Login"}
        {!isSubmitting && <ArrowRight size={19} />}
      </button>
    </form>
  );
}
