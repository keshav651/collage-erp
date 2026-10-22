
import { Users, BookOpen, ClipboardCheck, Settings } from "lucide-react";

const adminActions = [
  {
    title: "Teacher Management",
    description: "Manage teacher accounts and approvals.",
    icon: Users,
  },
  {
    title: "Subjects",
    description: "View and manage available subjects.",
    icon: BookOpen,
  },
  {
    title: "Unit Tests & Marks",
    description: "Access unit-test management.",
    icon: ClipboardCheck,
  },
  {
    title: "Settings",
    description: "Manage your account settings.",
    icon: Settings,
  },
];

export default function AdminDashboard() {
  return (
    <main className="space-y-6">
      <header>
        <p className="text-sm font-medium text-[#921B25]">
          ADMINISTRATION
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Welcome to the MSME College ERP Portal.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {adminActions.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#921B25]/40"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#921B25]/10 text-[#921B25]">
              <Icon size={22} />
            </div>
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <p className="mt-2 text-sm leading-5 text-gray-500">
              {description}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
