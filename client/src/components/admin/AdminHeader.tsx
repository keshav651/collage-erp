import { LogOut } from "lucide-react";

interface AdminUser {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface AdminHeaderProps {
  user: AdminUser | null | undefined;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export default function AdminHeader({
  user,
  onLogout,
  isLoggingOut,
}: AdminHeaderProps) {
  return (
    <header className="rounded-2xl bg-[#921B25] p-5 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-red-100">MSME College ERP</p>

          <h1 className="mt-2 text-2xl font-bold">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-red-100">
            Manage your college from one place.
          </p>
        </div>

        <div className="rounded-xl border border-white/20 bg-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white font-bold text-[#921B25]">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="font-semibold">
                {user?.name || "Admin"}
              </p>

              <p className="text-sm text-red-100">
                {user?.email || "Email unavailable"}
              </p>

              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-red-100">
                {user?.role || "ADMIN"}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#921B25] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={16} />

          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}