
import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

import useLogout from "../hooks/useLogout";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user } = useAuth();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-[#FFF9F7] lg:flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          user={user}
          onLogout={() => logout.mutate()}
          isLoggingOut={logout.isPending}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
