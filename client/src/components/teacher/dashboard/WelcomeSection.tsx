
type WelcomeSectionProps = {
  name?: string;
  email?: string;
  role?: string;
};

export default function WelcomeSection({
  name,
  email,
  role,
}: WelcomeSectionProps) {
  return (
    <section className="rounded-2xl bg-red-900 p-5 text-white shadow-sm sm:p-8">
      <p className="text-sm text-red-100">
        Welcome back,
      </p>

      <h2 className="mt-1 break-words text-2xl font-bold sm:text-3xl">
        {name || "Teacher"}
      </h2>

      <p className="mt-2 break-all text-sm text-red-100">
        {email}
      </p>

      <span className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
        {role || "TEACHER"}
      </span>
    </section>
  );
}
