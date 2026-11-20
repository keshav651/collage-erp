
type AccountInformationProps = {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
};

export default function AccountInformation({
  name,
  email,
  role,
  status,
}: AccountInformationProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="font-semibold text-gray-900">
        Account Information
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="mt-1 break-words font-medium text-gray-800">
            {name || "Not available"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="mt-1 break-all font-medium text-gray-800">
            {email || "Not available"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="mt-1 font-medium text-gray-800">
            {role || "Not available"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Account Status</p>
          <p className="mt-1 font-medium text-gray-800">
            {status || "Not available"}
          </p>
        </div>
      </div>
    </section>
  );
}
