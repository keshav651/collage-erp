
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import useBranches from "../../../hooks/useBranches";
import useCreateBranch from "../../../hooks/useCreateBranch";

export default function BranchManagementPage() {
    const { data, isLoading, isError, error } = useBranches();
    const createBranchMutation = useCreateBranch();

    const [name, setName] = useState("");
    const [codePrefix, setCodePrefix] = useState("");

    const branches = data?.data ?? [];

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        createBranchMutation.mutate(
            {
                name: name.trim(),
                codePrefix: codePrefix.trim().toUpperCase(),
            },
            {
                onSuccess: () => {
                    setName("");
                    setCodePrefix("");
                },
            }
        );
    };

    const mutationError = createBranchMutation.error;

    const getErrorMessage = (value: unknown): string => {
        if (value && typeof value === "object" && "response" in value) {
            const response = value.response;

            if (
                response &&
                typeof response === "object" &&
                "data" in response
            ) {
                const responseData = response.data;

                if (
                    responseData &&
                    typeof responseData === "object" &&
                    "message" in responseData &&
                    typeof responseData.message === "string"
                ) {
                    return responseData.message;
                }
            }
        }

        if (value instanceof Error) {
            return value.message;
        }

        return "Something went wrong. Please try again.";
    };

    return (
        <main className="min-h-screen bg-[#FFF9F7] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl">
                <Link
                    to="/admin/dashboard"
                    className="rounded-lg bg-[#921B25] px-5 py-3 font-semibold text-white transition hover:bg-[#75151D]"
                >
                    ← Back to Dashboard
                </Link>

                <header className="mt-5 mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#921B25]">
                        Administration
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        Branch Management
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Create and view college branches.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
                    <section className="h-fit rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900">
                            Add New Branch
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Enter the branch name and its unique code prefix.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            <div>
                                <label
                                    htmlFor="branch-name"
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                >
                                    Branch Name
                                </label>

                                <input
                                    id="branch-name"
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="e.g. Computer Science"
                                    maxLength={100}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="branch-code"
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                >
                                    Branch Code Prefix
                                </label>

                                <input
                                    id="branch-code"
                                    type="text"
                                    value={codePrefix}
                                    onChange={(event) =>
                                        setCodePrefix(
                                            event.target.value.toUpperCase().replace(/\s/g, "")
                                        )
                                    }
                                    placeholder="e.g. CS"
                                    minLength={2}
                                    maxLength={10}
                                    pattern="[A-Za-z0-9]{2,10}"
                                    title="Enter 2–10 letters or numbers."
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 uppercase outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                                />

                                <p className="mt-2 text-xs text-gray-500">
                                    Use 2–10 letters or numbers, such as CS or CSE01.
                                </p>
                            </div>

                            {createBranchMutation.isError && (
                                <div
                                    role="alert"
                                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                                >
                                    {getErrorMessage(mutationError)}
                                </div>
                            )}

                            {createBranchMutation.isSuccess && (
                                <div
                                    role="status"
                                    className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
                                >
                                    Branch created successfully.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={createBranchMutation.isPending}
                                className="w-full rounded-lg bg-[#921B25] px-4 py-3 font-semibold text-white transition hover:bg-[#75151D] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {createBranchMutation.isPending
                                    ? "Creating Branch..."
                                    : "Create Branch"}
                            </button>
                        </form>
                    </section>

                    <section className="min-w-0 rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Existing Branches
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Branches currently registered in the system.
                                </p>
                            </div>

                            <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-[#921B25]">
                                {branches.length} branches
                            </span>
                        </div>

                        {isLoading ? (
                            <p className="py-12 text-center text-gray-500">
                                Loading branches...
                            </p>
                        ) : isError ? (
                            <div
                                role="alert"
                                className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
                            >
                                Failed to load branches: {getErrorMessage(error)}
                            </div>
                        ) : branches.length === 0 ? (
                            <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-4 py-12 text-center">
                                <p className="font-semibold text-gray-700">
                                    No branches found
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Create your first branch using the form.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 overflow-x-auto">
                                <table className="w-full min-w-[420px] text-left">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-sm text-gray-500">
                                            <th className="px-4 py-3 font-semibold">
                                                Branch Name
                                            </th>

                                            <th className="px-4 py-3 font-semibold">
                                                Code Prefix
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {branches.map((branch) => (
                                            <tr
                                                key={branch.id}
                                                className="border-b border-gray-100 last:border-0 hover:bg-red-50/40"
                                            >
                                                <td className="px-4 py-4 font-medium text-gray-800">
                                                    {branch.name}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className="rounded-md bg-gray-100 px-3 py-1 font-mono text-sm font-semibold text-gray-700">
                                                        {branch.codePrefix}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
