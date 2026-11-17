export function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;
    const data = response?.data;
    if (data?.message) {
      return data.message;
    }
// Axios may receive a JSON error as a Blob because// the request uses responseType: "blob".
    if (data instanceof Blob) {
      return "Export failed. Please check the selected filters and try again.";
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
export function downloadExcel(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}
export const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100";
export const labelClass =
  "mb-2 block text-sm font-semibold text-gray-700";
