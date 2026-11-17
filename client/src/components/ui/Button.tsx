import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[#921B25] text-white hover:bg-[#75151D]",
    secondary:
      "bg-white text-[#921B25] ring-1 ring-[#921B25]/20 hover:bg-red-50",
    danger:
      "bg-red-700 text-white hover:bg-red-800",
    ghost:
      "bg-transparent text-[#921B25] hover:bg-red-50",
  };

  return (
    <button
      {...props}
      type={type}
      disabled={disabled || isLoading}
      className={`
        inline-flex min-h-11 items-center justify-center
        gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold
        transition-colors focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-[#921B25]
        disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]}
        ${className}
      `}
    >
      {isLoading ? "Please wait..." : children}
    </button>
  );
}