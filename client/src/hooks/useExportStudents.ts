import { useMutation } from "@tanstack/react-query";
import {
  exportStudents,
  type StudentExportFilters,
} from "../api/studentApi";

export default function useExportStudents() {
  return useMutation({
    mutationFn: async (filters: StudentExportFilters = {}) => {
      const blob = await exportStudents(filters);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "students_export.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      return true;
    },
  });
}