
import { AlertCircle, RefreshCw } from "lucide-react";

type MarksEntryAlertsProps = {
    message: string;
    error: string;
    testsLoading: boolean;
    testsError: boolean;
    testsCount: number;
    groupsCount: number;
    marksLoading: boolean;
    marksError: boolean;
    hasSelectedTests: boolean;
    onRetryTests: () => void;
};

export default function MarksEntryAlerts({
    message,
    error,
    testsLoading,
    testsError,
    testsCount,
    groupsCount,
    marksLoading,
    marksError,
    hasSelectedTests,
    onRetryTests,
}: MarksEntryAlertsProps) {
    return (
        <>
            {message && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    {message}
                </div>
            )}

            {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {testsLoading && (
                <div className="rounded-xl border bg-white p-8 text-center text-gray-600">
                    <RefreshCw className="mx-auto mb-2 animate-spin" />
                    Loading unit tests...
                </div>
            )}

            {!testsLoading && testsError && (
                <div className="rounded-xl border border-red-200 bg-white p-6">
                    <p className="text-sm text-red-800">
                        Unit Tests load nahi ho sake.
                    </p>
                    <button
                        type="button"
                        onClick={onRetryTests}
                        className="mt-3 rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!testsLoading && !testsError && testsCount === 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                    <h2 className="font-semibold text-gray-800">
                        No Unit Tests found
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Tests appear here when they are assigned to your subjects.
                    </p>
                </div>
            )}

            {!testsLoading &&
                !testsError &&
                testsCount > 0 &&
                groupsCount === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                        Tests ka response mila, lekin subject/cycle details
                        incomplete hain. API response check karna hoga.
                    </div>
                )}

            {marksLoading && hasSelectedTests && (
                <div className="rounded-xl border bg-white p-8 text-center text-gray-600">
                    <RefreshCw className="mx-auto mb-2 animate-spin" />
                    Loading students and marks...
                </div>
            )}

            {!marksLoading && marksError && hasSelectedTests && (
                <div className="rounded-xl border border-red-200 bg-white p-6 text-sm text-red-800">
                    Marks sheet load nahi ho saki. Page refresh karke dobara
                    try karein.
                </div>
            )}
        </>
    );
}
