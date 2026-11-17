
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";

import useDeleteStudent from "../../../../hooks/useDeleteStudent";
import useStudents from "../../../../hooks/useStudents";
import useBranches from "../../../../hooks/useBranches";
import useSemesters from "../../../../hooks/useSemesters";
import useCreateStudent from "../../../../hooks/useCreateStudent";
import useUpdateStudent from "../../../../hooks/useUpdateStudent";
import useUpdateStudentStatus from "../../../../hooks/useUpdateStudentStatus";
import useImportStudents from "../../../../hooks/useImportStudents";
import useExportStudents from "../../../../hooks/useExportStudents";
import useDownloadStudentTemplate from "../../../../hooks/useDownloadStudentTemplate";

import type {
  Student,
  StudentPayload,
  StudentImportResponse,
} from "../../../../api/studentApi";

export type StudentTab = "students" | "excel";

const emptyStudentForm = (): StudentPayload => ({
  name: "",
  fatherName: "",
  branchId: "",
  semesterId: "",
});

export default function useStudentManagement() {
  const [activeTab, setActiveTab] = useState<StudentTab>("students");

  const [studentSearch, setStudentSearch] = useState("");
  const [selectedListBranch, setSelectedListBranch] = useState("");
  const [selectedListSemester, setSelectedListSemester] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<StudentPayload>(
    emptyStudentForm,
  );

  const [importResults, setImportResults] =
    useState<StudentImportResponse | null>(null);

  const [selectedExportBranch, setSelectedExportBranch] = useState("");
  const [selectedExportSemester, setSelectedExportSemester] = useState("");

  // Existing queries
  const {
    data: studentsData,
    isLoading: studentsLoading,
    isError: studentsError,
  } = useStudents();

  const { data: branchesData } = useBranches();

  const {
    data: semestersData,
    isLoading: semestersLoading,
    isError: semestersError,
    error: semestersErrorDetails,
  } = useSemesters();

  // Existing mutations
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const updateStudentStatusMutation = useUpdateStudentStatus();
  const deleteStudentMutation = useDeleteStudent();

  const importStudentsMutation = useImportStudents();
  const exportStudentsMutation = useExportStudents();
  const downloadTemplateMutation = useDownloadStudentTemplate();

  const students = studentsData?.data ?? [];
  const branches = branchesData?.data ?? [];
  const semesters = semestersData?.data ?? [];

  const hasSelectedFilters =
    Boolean(selectedListBranch) && Boolean(selectedListSemester);

  // Search + branch/semester filtering
  const filteredStudents = useMemo(() => {
    if (!hasSelectedFilters) return [];

    const search = studentSearch.trim().toLowerCase();

    return students.filter((student) => {
      const matchesBranch = student.branchId === selectedListBranch;
      const matchesSemester = student.semesterId === selectedListSemester;

      const matchesSearch =
        !search ||
        student.name.toLowerCase().includes(search) ||
        (student.fatherName ?? "").toLowerCase().includes(search);

      return matchesBranch && matchesSemester && matchesSearch;
    });
  }, [
    students,
    studentSearch,
    selectedListBranch,
    selectedListSemester,
    hasSelectedFilters,
  ]);

  const clearListFilters = () => {
    setSelectedListBranch("");
    setSelectedListSemester("");
    setStudentSearch("");
  };

  const openCreateStudentModal = () => {
    setSelectedStudent(null);
    setFormData(emptyStudentForm());
    setIsFormOpen(true);
  };

  const openEditStudentModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      fatherName: student.fatherName ?? "",
      branchId: student.branchId,
      semesterId: student.semesterId,
    });
    setIsFormOpen(true);
  };

  const closeStudentModal = () => {
    setIsFormOpen(false);
    setSelectedStudent(null);
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleStudentSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const payload: StudentPayload = {
      name: formData.name.trim(),
      fatherName: formData.fatherName.trim(),
      branchId: formData.branchId,
      semesterId: formData.semesterId,
    };

    if (
      !payload.name ||
      !payload.fatherName ||
      !payload.branchId ||
      !payload.semesterId
    ) {
      toast.error("Please fill in all student details.");
      return;
    }

    try {
      if (selectedStudent) {
        await updateStudentMutation.mutateAsync({
          id: selectedStudent.id,
          payload,
        });

        toast.success("Student updated successfully.");
      } else {
        await createStudentMutation.mutateAsync(payload);
        toast.success("Student created successfully.");
      }

      closeStudentModal();
    } catch {
      toast.error(
        "Unable to save student. Please check the details and try again.",
      );
    }
  };

  const handleToggleStudentStatus = async (student: Student) => {
    try {
      await updateStudentStatusMutation.mutateAsync({
        id: student.id,
        isActive: !student.isActive,
      });

      toast.success(
        student.isActive
          ? "Student deactivated successfully."
          : "Student activated successfully.",
      );
    } catch {
      toast.error("Unable to update student status.");
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${student.name} (Father: ${student.fatherName})? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteStudentMutation.mutateAsync(student.id);
      toast.success("Student deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete student.",
      );
    }
  };

  const handleImportStudents = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!/\.xlsx$/i.test(file.name)) {
      toast.error("Please select an Excel .xlsx file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must not exceed 5 MB.");
      return;
    }

    setImportResults(null);

    try {
      const result = await importStudentsMutation.mutateAsync(file);
      setImportResults(result);

      if (result.successfulRecords > 0) {
        toast.success(
          `${result.successfulRecords} student(s) imported successfully.`,
        );
      }

      if (result.failedRecords > 0) {
        toast.warning(
          `${result.failedRecords} student(s) could not be imported. Check the report below.`,
        );
      } else if (result.successfulRecords === 0) {
        toast.info("No students were imported.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to import students. Please try again.",
      );
    }
  };

  const handleExportStudents = async () => {
    try {
      await exportStudentsMutation.mutateAsync({
        ...(selectedExportBranch
          ? { branchId: selectedExportBranch }
          : {}),
        ...(selectedExportSemester
          ? { semesterId: selectedExportSemester }
          : {}),
      });

      toast.success("Student Excel file downloaded.");
    } catch {
      toast.error("Unable to export students. Please try again.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplateMutation.mutateAsync();
      toast.success("Excel template downloaded.");
    } catch {
      toast.error("Unable to download the Excel template.");
    }
  };

  const isSaving =
    createStudentMutation.isPending || updateStudentMutation.isPending;

  return {
    activeTab,
    setActiveTab,

    students,
    branches,
    semesters,

    studentsLoading,
    studentsError,
    semestersLoading,
    semestersError,
    semestersErrorDetails,

    studentSearch,
    setStudentSearch,
    selectedListBranch,
    setSelectedListBranch,
    selectedListSemester,
    setSelectedListSemester,
    hasSelectedFilters,
    filteredStudents,
    clearListFilters,

    selectedStudent,
    isFormOpen,
    formData,
    isSaving,

    openCreateStudentModal,
    openEditStudentModal,
    closeStudentModal,
    handleInputChange,
    handleStudentSubmit,
    handleToggleStudentStatus,
    handleDeleteStudent,

    isUpdatingStatus: updateStudentStatusMutation.isPending,
    isDeleting: deleteStudentMutation.isPending,

    importResults,
    setImportResults,
    selectedExportBranch,
    setSelectedExportBranch,
    selectedExportSemester,
    setSelectedExportSemester,
    handleImportStudents,
    handleExportStudents,
    handleDownloadTemplate,

    isImporting: importStudentsMutation.isPending,
    isExporting: exportStudentsMutation.isPending,
    isDownloadingTemplate: downloadTemplateMutation.isPending,
  };
}
