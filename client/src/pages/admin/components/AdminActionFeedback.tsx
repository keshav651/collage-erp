interface AdminActionFeedbackProps {
  success: string;
  error: string;
  showError?: boolean;
}

export default function AdminActionFeedback({
  success,
  error,
  showError = true,
}: AdminActionFeedbackProps) {
  return (
    <>
      {success && (
        <div
          role="status"
          className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
        >
          {success}
        </div>
      )}

      {showError && error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
    </>
  );
}