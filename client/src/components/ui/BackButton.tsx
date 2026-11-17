import { Link } from "react-router-dom";

interface BackButtonProps {
  to?: string;
  className?: string;
}

export default function BackButton({
  to = "/admin/dashboard",
  className = "",
}: BackButtonProps) {
  return (
    <Link
      to={to}
      aria-label="Go back"
      title="Go back"
      className={`
        inline-flex h-11 w-11 shrink-0
        items-center justify-center
        rounded-full bg-[#921B25]
        text-white transition-all duration-200
        hover:bg-[#75151D]
        hover:scale-105
        active:scale-95
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-[#921B25]
        ${className}
      `}
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}