
import { useEffect, useRef, useState } from "react";
import {
  EllipsisVertical,
  LogOut,
  Menu,
  ShieldCheck,
} from "lucide-react";

interface AdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  onLogout: () => void;
  isLoggingOut: boolean;
  onMenuClick?: () => void;
}

export default function AdminHeader({
  user,
  onLogout,
  isLoggingOut,
  onMenuClick,
}: AdminHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="relative z-30 flex min-h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FCECEE] text-xs font-bold text-[#921B25]">
          {(user?.name || "A").charAt(0).toUpperCase()}
        </div>

        <span className="max-w-32 truncate text-sm font-semibold text-gray-800 sm:max-w-48">
          {user?.name || "Admin"}
        </span>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Admin options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <EllipsisVertical size={19} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
            >
              <div className="border-b border-gray-100 px-3 py-2">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user?.name || "Admin"}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {user?.email || "Email unavailable"}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#921B25]">
                  <ShieldCheck size={13} />
                  {user?.role || "ADMIN"}
                </p>
              </div>

              <button
                type="button"
                role="menuitem"
                disabled={isLoggingOut}
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#921B25] hover:bg-red-50 disabled:opacity-50"
              >
                <LogOut size={17} />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
