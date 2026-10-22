
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#FFF9F7]">
      <header className="bg-[#921B25] px-5 py-4 text-white shadow-sm">
        <p className="text-xs font-semibold tracking-widest">
          MSME TECHNOLOGY CENTRE
        </p>
        <p className="mt-1 font-semibold">Admin Portal</p>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}
