
export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-[#FFF9F7] p-4 sm:p-6">
      <header className="rounded-2xl bg-[#921B25] p-5 text-white">
        <p className="text-sm text-red-100">
          MSME College ERP
        </p>

        <h1 className="mt-2 text-2xl font-bold">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-red-100">
          Manage your college from one place.
        </p>
      </header>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Overview
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Your college management overview will appear here.
        </p>
      </section>
    </main>
  );
}