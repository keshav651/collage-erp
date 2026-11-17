
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Building2,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Users,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation: {
  label: string;
  to: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    to: "/admin/students",
    icon: Users,
  },
  {
    label: "Teachers",
    to: "/admin/teachers",
    icon: UserRound,
  },
  {
    label: "Branches",
    to: "/admin/branches",
    icon: Building2,
  },
  {
    label: "Unit Tests",
    to: "/admin/unit-tests",
    icon: ClipboardList,
  },
  {
    label: "Subjects",
    to: "/admin/subjects",
    icon: BookOpen,
  },
];

export default function AdminSidebar({
  isOpen,
  onClose,
}: AdminSidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        aria-label="Admin sidebar"
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-60 flex-col
          border-r border-gray-200
          bg-white transition-transform duration-200
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#921B25] text-white">
              <GraduationCap size={18} />
            </div>
            <span className="text-sm font-bold text-gray-900">
              MSME College ERP
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav
          aria-label="Admin navigation"
          className="flex-1 space-y-1 overflow-y-auto p-3"
        >
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-[#FCECEE] font-semibold text-[#921B25]"
                    : "font-medium text-gray-600 hover:bg-gray-50 hover:text-[#921B25]"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
