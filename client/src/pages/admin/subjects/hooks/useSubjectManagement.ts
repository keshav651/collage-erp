
import { useState, type FormEvent } from "react";

import useBranches from "../../../../hooks/useBranches";
import useSemesters from "../../../../hooks/useSemesters";
import useSubjects from "../../../../hooks/useSubjects";
import useCreateSubject from "../../../../hooks/useCreateSubject";
import useUpdateSubject from "../../../../hooks/useUpdateSubject";
import useDeleteSubject from "../../../../hooks/useDeleteSubject";

import type {
  Subject,
  CreateSubjectPayload,
} from "../../../../api/subjectApi";

export type SubjectTab = "subjects" | "form";

const initialForm = {
  name: "",
  code: "",
  branchId: "",
  semesterId: "",
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = error.response;

    if (response && typeof response === "object" && "data" in response) {
      const data = response.data;

      if (
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        return data.message;
      }
    }
  }

  return fallback;
}

export default function useSubjectManagement() {
  const [activeTab, setActiveTab] = useState<SubjectTab>("subjects");

  // List filters
  const [branchFilter, setBranchFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  // Create/Edit form
  const [form, setForm] = useState({ ...initialForm });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Feedback
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Existing API hooks
  const branchesQuery = useBranches();
  const semestersQuery = useSemesters();

  const subjectsQuery = useSubjects(
    branchFilter || undefined,
    semesterFilter || undefined,
  );

  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();

  const branches = branchesQuery.data?.data ?? [];
  const semesters = semestersQuery.data?.data ?? [];
  const subjects = subjectsQuery.data?.data ?? [];

  // Semester rules for create/edit
  const selectedSemester = semesters.find(
    (semester) => semester.id === form.semesterId,
  );

  const requiresBranch =
    selectedSemester !== undefined && selectedSemester.number > 2;

  const isCommonSemester =
    selectedSemester !== undefined && selectedSemester.number <= 2;

  // Semester rules for list filters
  const selectedFilterSemester = semesters.find(
    (semester) => semester.id === semesterFilter,
  );

  const requiresBranchFilter =
    selectedFilterSemester !== undefined &&
    selectedFilterSemester.number > 2;

  const hasSelectedFilters =
    selectedFilterSemester !== undefined &&
    (!requiresBranchFilter || Boolean(branchFilter));

  // Show only matching records
  const visibleSubjects = !hasSelectedFilters
    ? []
    : subjects.filter((subject) => {
        if (selectedFilterSemester?.number !== undefined &&
            selectedFilterSemester.number <= 2) {
          return (
            subject.semesterId === semesterFilter &&
            !subject.branchId
          );
        }

        return (
          subject.semesterId === semesterFilter &&
          subject.branchId === branchFilter
        );
      });

  const handleSemesterFilterChange = (semesterId: string) => {
    setSemesterFilter(semesterId);
    setBranchFilter("");
  };

  const clearFilters = () => {
    setSemesterFilter("");
    setBranchFilter("");
  };

  const updateForm = (
    field: keyof typeof initialForm,
    value: string,
  ) => {
    setForm((previous) => {
      if (field === "semesterId") {
        return {
          ...previous,
          semesterId: value,
          branchId: "",
        };
      }

      return {
        ...previous,
        [field]: value,
      };
    });
  };

  const resetForm = () => {
    setForm({ ...initialForm });
    setEditingSubject(null);
  };

  const clearForm = () => {
    resetForm();
    setMessage("");
    setErrorMessage("");
  };

  const openCreateForm = () => {
    clearForm();
    setActiveTab("form");
  };

  const closeForm = () => {
    resetForm();
    setActiveTab("subjects");
  };

  const startEditing = (subject: Subject) => {
    setEditingSubject(subject);

    setForm({
      name: subject.name,
      code: subject.code,
      branchId: subject.branchId ?? "",
      semesterId: subject.semesterId,
    });

    setMessage("");
    setErrorMessage("");
    setActiveTab("form");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    const payload: CreateSubjectPayload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      semesterId: form.semesterId,
      branchId: isCommonSemester ? null : form.branchId || null,
    };

    if (!payload.name || !payload.code || !payload.semesterId) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (!selectedSemester) {
      setErrorMessage("Please select a valid semester.");
      return;
    }

    if (requiresBranch && !form.branchId) {
      setErrorMessage(
        "Branch selection is required for Semester 3 onwards.",
      );
      return;
    }

    try {
      if (editingSubject) {
        await updateMutation.mutateAsync({
          id: editingSubject.id,
          payload,
        });

        setMessage("Subject updated successfully.");
      } else {
        await createMutation.mutateAsync(payload);

        setMessage("Subject created successfully.");
      }

      resetForm();
      setActiveTab("subjects");
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to save subject. Please try again.",
        ),
      );
    }
  };

  const handleDelete = async (subject: Subject) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subject.name}"?`,
    );

    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");

    try {
      await deleteMutation.mutateAsync(subject.id);

      setMessage("Subject deleted successfully.");

      if (editingSubject?.id === subject.id) {
        resetForm();
      }
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to delete subject. It may be linked to other records.",
        ),
      );
    }
  };

  const isSaving =
    createMutation.isPending || updateMutation.isPending;

  return {
    activeTab,
    setActiveTab,

    branches,
    semesters,
    subjects,
    visibleSubjects,

    branchFilter,
    setBranchFilter,
    semesterFilter,
    handleSemesterFilterChange,
    clearFilters,
    hasSelectedFilters,
    requiresBranchFilter,

    form,
    updateForm,
    editingSubject,
    requiresBranch,
    isCommonSemester,

    message,
    errorMessage,

    resetForm,
    clearForm,
    openCreateForm,
    closeForm,
    startEditing,
    handleSubmit,
    handleDelete,

    isSaving,
    isDeleting: deleteMutation.isPending,

    branchesLoading: branchesQuery.isLoading,
    branchesError: branchesQuery.isError,
    semestersLoading: semestersQuery.isLoading,
    semestersError: semestersQuery.isError,

    subjectsLoading: subjectsQuery.isLoading,
    subjectsError: subjectsQuery.isError,
    refetchSubjects: subjectsQuery.refetch,
  };
}
