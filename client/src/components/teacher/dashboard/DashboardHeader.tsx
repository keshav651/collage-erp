
import { LogOut } from "lucide-react";

type DashboardHeaderProps = {
  onLogout: () => void;
  isLoggingOut: boolean;
};

export default function DashboardHeader({
  onLogout,
  isLoggingOut,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-bold text-red-900 sm:text-2xl">
            MSME College ERP
          </h1>
          <p className="text-sm text-gray-500">
            Teacher Dashboard
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={17} />

          <span>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </header>
  );
}
