import { useMutation } from "@tanstack/react-query";
import { downloadStudentTemplate } from "../api/studentApi";

export default function useDownloadStudentTemplate() {
  return useMutation({
    mutationFn: async () => {
      const blob = await downloadStudentTemplate();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "student_import_template.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      return true;
    },
  });
}