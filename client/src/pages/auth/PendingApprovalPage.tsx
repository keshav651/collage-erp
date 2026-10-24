
import useLogout from "../../hooks/useLogout";

export default function PendingApprovalPage() {

    const logoutMutation = useLogout();

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#FFF9F7] px-4 py-8">
            <section className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-sm sm:p-8">
                <div className="text-4xl" aria-hidden="true">
                    ⏳
                </div>

                <h1 className="mt-4 text-2xl font-bold text-[#921B25]">
                    Approval Pending
                </h1>

                <p className="mt-3 text-gray-600">
                    Your account has been registered successfully.
                    An administrator must approve your account before
                    you can access the Teacher Dashboard.
                </p>

                <button
                    type="button"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="mt-6 w-full rounded-lg bg-[#921B25] px-4 py-3 font-semibold text-white hover:bg-[#75151D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </button>
            </section>
        </main>
    );
}
