import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUnitTestCycle, deleteUnitTestCycle, getUnitTestCycles, exportUnitTestMarks, type UnitTestCyclePayload, type UnitTestExportFilters } from "../../../../api/unitTestApi";
import { getAllBranches } from "../../../../api/adminApi";
import useSemesters from "../../../../hooks/useSemesters";
import { type Semester, type UnitTestSubject, type UnitTestCycle, type CyclesResponse, type BranchesResponse, type CreateCycleResponse, type FormState, type ExportFilterState, initialForm, initialExportFilters } from "../types";
import { getErrorMessage, downloadExcel } from "../utils";

export function useUnitTestManagement() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [exportFilters, setExportFilters] =
    useState<ExportFilterState>(initialExportFilters);
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportMode, setExportMode] = useState<
    "all" | "filtered" | null
  >(null);
  const cyclesQuery = useQuery({
    queryKey: ["admin", "unit-test-cycles"],
    queryFn: getUnitTestCycles,
  });
  const semestersQuery = useSemesters();
  const branchesQuery = useQuery({
    queryKey: ["admin", "branches"],
    queryFn: getAllBranches,
  });
  const semesters: Semester[] = semestersQuery.data?.data ?? [];
  const branches =
    (branchesQuery.data as BranchesResponse | undefined)?.data ?? [];
  const cyclesResponse =
    cyclesQuery.data as CyclesResponse | undefined;
  const cycles = cyclesResponse?.data ?? [];
  const selectedSemester = semesters.find(
    (semester) => semester.id === form.semesterId,
  );
  const isFirstYear =
    selectedSemester?.number === 1 ||
    selectedSemester?.number === 2;
// Export filters are derived from existing cycle data.// No additional subject API is required for this page.
  const exportCycles = useMemo(() => {
    return cycles.filter((cycle) => {
      if (
        exportFilters.semesterId &&
        cycle.semesterId !== exportFilters.semesterId
      ) {
        return false;
      }
      if (
        exportFilters.branchId &&
        cycle.branchId &&
        cycle.branchId !== exportFilters.branchId
      ) {
        return false;
      }
      if (
        exportFilters.academicYear &&
        cycle.academicYear !== exportFilters.academicYear
      ) {
        return false;
      }
      if (
        exportFilters.cycleId &&
        cycle.id !== exportFilters.cycleId
      ) {
        return false;
      }
      if (
        exportFilters.subjectId &&
        !cycle.tests?.some(
          (test) => test.subject?.id === exportFilters.subjectId,
        )
      ) {
        return false;
      }
      return true;
    });
  }, [cycles, exportFilters]);
  const exportSubjects = useMemo(() => {
    const subjectMap = new Map<string, UnitTestSubject>();
    for (const cycle of exportCycles) {
      for (const test of cycle.tests ?? []) {
        if (test.subject) {
          subjectMap.set(test.subject.id, test.subject);
        }
      }
    }
    return [...subjectMap.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [exportCycles]);
  const academicYears = useMemo(() => {
    return [
      ...new Set(
        cycles
          .filter((cycle) => {
            if (
              exportFilters.semesterId &&
              cycle.semesterId !== exportFilters.semesterId
            ) {
              return false;
            }
            if (
              exportFilters.branchId &&
              cycle.branchId &&
              cycle.branchId !== exportFilters.branchId
            ) {
              return false;
            }
            return true;
          })
          .map((cycle) => cycle.academicYear),
      ),
    ].sort((a, b) => b.localeCompare(a));
  }, [cycles, exportFilters.semesterId, exportFilters.branchId]);
  const exportCycleOptions = useMemo(() => {
    return exportCycles.filter((cycle) => {
      if (
        exportFilters.subjectId &&
        !cycle.tests?.some(
          (test) => test.subject?.id === exportFilters.subjectId,
        )
      ) {
        return false;
      }
      return true;
    });
  }, [exportCycles, exportFilters.subjectId]);
  const createMutation = useMutation({
    mutationFn: (payload: UnitTestCyclePayload) =>
      createUnitTestCycle(payload),
    onSuccess: async (result: CreateCycleResponse) => {
      setSuccessMessage(
        result.message || "Unit Test Cycle created successfully.",
      );
      setForm(initialForm);
      setFormError("");
      setShowForm(false);
      await queryClient.invalidateQueries({
        queryKey: ["admin", "unit-test-cycles"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["teacher", "unit-tests"],
      });
    },
    onError: (error: unknown) => {
      setFormError(getErrorMessage(error));
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (cycle: UnitTestCycle) => {
      try {
        return await deleteUnitTestCycle(cycle.id, false);
      } catch (error) {
        const response = (
          error as {
            response?: {
              status?: number;
              data?: {
                requiresConfirmation?: boolean;
                totalTests?: number;
                totalMarks?: number;
              };
            };
          }
        ).response;
        const data = response?.data;
        if (response?.status === 409 && data?.requiresConfirmation) {
          const confirmed = window.confirm(
            `WARNING: This cycle contains student marks.\n\n` +
            `Tests: ${data.totalTests ?? 0}\n` +
            `Student mark records: ${data.totalMarks ?? 0}\n\n` +
            `Deleting this cycle will permanently delete its tests ` +
            `and associated marks.\n\nContinue with deletion?`,
          );
          if (!confirmed) {
            throw new Error("Deletion cancelled.");
          }
          return await deleteUnitTestCycle(cycle.id, true);
        }
        throw error;
      }
    },
    onSuccess: async (result) => {
      setSuccessMessage(
        result.message || "Unit Test Cycle deleted successfully.",
      );
      setFormError("");
      await queryClient.invalidateQueries({
        queryKey: ["admin", "unit-test-cycles"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["teacher", "unit-tests"],
      });
    },
    onError: (error: unknown) => {
      if (error instanceof Error && error.message === "Deletion cancelled.") {
        return;
      }
      setFormError(getErrorMessage(error));
    },
  });
  function handleDeleteCycle(cycle: UnitTestCycle) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${cycle.name}"?\n\n` +
      `Academic Year: ${cycle.academicYear}\n` +
      `Semester: ${cycle.semester?.number ?? "—"}\n` +
      `Branch: ${cycle.branch?.name ?? "Common Cycle"}\n\n` +
      `This action cannot be undone.`,
    );
    if (!confirmed) return;
    setFormError("");
    setSuccessMessage("");
    deleteMutation.mutate(cycle);
  }
  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setFormError("");
    setSuccessMessage("");
  }
  function updateExportFilter<K extends keyof ExportFilterState>(
    field: K,
    value: ExportFilterState[K],
  ) {
    setExportFilters((previous) => {
      const next = {
        ...previous,
        [field]: value,
      };
// Reset dependent filters when their parent changes.
      if (field === "semesterId") {
        next.branchId = "";
        next.subjectId = "";
        next.academicYear = "";
        next.cycleId = "";
      }
      if (field === "branchId") {
        next.subjectId = "";
        next.academicYear = "";
        next.cycleId = "";
      }
      if (field === "academicYear") {
        next.cycleId = "";
      }
      if (field === "subjectId") {
        next.cycleId = "";
      }
      return next;
    });
    setExportError("");
    setExportSuccess("");
  }
  function resetExportFilters() {
    setExportFilters(initialExportFilters);
    setExportError("");
    setExportSuccess("");
  }
  function openCreateForm() {
    setForm(initialForm);
    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  }
  function closeCreateForm() {
    setShowForm(false);
    setFormError("");
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");
    const start = Number(form.startTestNumber);
    const end = Number(form.endTestNumber);
    const maxMarks = Number(form.maxMarks);
    if (!form.name.trim()) {
      setFormError("Please enter a cycle name.");
      return;
    }
    if (!form.academicYear.trim()) {
      setFormError("Please enter the academic year.");
      return;
    }
    if (!form.semesterId) {
      setFormError("Please select a semester.");
      return;
    }
    if (!selectedSemester) {
      setFormError("The selected semester is invalid.");
      return;
    }
    if (!isFirstYear && !form.branchId) {
      setFormError(
        "Please select a branch for Semester 3 and above.",
      );
      return;
    }
    if (isFirstYear && form.branchId) {
      setFormError(
        "Semester 1 and 2 use a common cycle without a branch.",
      );
      return;
    }
    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 1 ||
      end < start ||
      end - start > 49
    ) {
      setFormError(
        "Enter a valid test range. You can create at most 50 tests per cycle.",
      );
      return;
    }
    if (!Number.isFinite(maxMarks) || maxMarks <= 0) {
      setFormError("Maximum marks must be greater than zero.");
      return;
    }
    if (!form.testDate) {
      setFormError("Please select the test date.");
      return;
    }
    if (!form.marksEntryDeadline) {
      setFormError("Please select the marks entry deadline.");
      return;
    }
    if (
      Number.isNaN(new Date(form.testDate).getTime()) ||
      Number.isNaN(new Date(form.marksEntryDeadline).getTime())
    ) {
      setFormError("Please enter valid dates.");
      return;
    }
    if (
      form.correctionDeadline &&
      Number.isNaN(new Date(form.correctionDeadline).getTime())
    ) {
      setFormError("Please enter a valid correction deadline.");
      return;
    }
    const payload: UnitTestCyclePayload = {
      name: form.name.trim(),
      academicYear: form.academicYear.trim(),
      semesterId: form.semesterId,
      branchId: isFirstYear ? null : form.branchId,
      startTestNumber: start,
      endTestNumber: end,
      maxMarks,
      testDate: new Date(form.testDate).toISOString(),
      marksEntryDeadline: new Date(
        form.marksEntryDeadline,
      ).toISOString(),
      correctionDeadline: form.correctionDeadline
        ? new Date(form.correctionDeadline).toISOString()
        : null,
    };
    createMutation.mutate(payload);
  }
  async function handleExport(mode: "all" | "filtered") {
    setExportError("");
    setExportSuccess("");
    setExporting(true);
    setExportMode(mode);
    try {
      let filters: UnitTestExportFilters = {};
      if (mode === "filtered") {
        if (
          !exportFilters.semesterId &&
          !exportFilters.branchId &&
          !exportFilters.subjectId &&
          !exportFilters.academicYear &&
          !exportFilters.cycleId
        ) {
          setExportError(
            "Please select at least one filter before exporting.",
          );
          return;
        }
        filters = {
          ...(exportFilters.semesterId
            ? { semesterId: exportFilters.semesterId }
            : {}),
          ...(exportFilters.branchId
            ? { branchId: exportFilters.branchId }
            : {}),
          ...(exportFilters.subjectId
            ? { subjectId: exportFilters.subjectId }
            : {}),
          ...(exportFilters.academicYear
            ? { academicYear: exportFilters.academicYear }
            : {}),
          ...(exportFilters.cycleId
            ? { cycleId: exportFilters.cycleId }
            : {}),
        };
      }
      const blob = await exportUnitTestMarks(filters);
      if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error("The Excel file is empty.");
      }
// Axios may return an error JSON as a Blob.
      if (blob.type.includes("application/json")) {
        const message = await blob.text();
        throw new Error(message || "Excel export failed.");
      }
      const filename =
        mode === "all"
          ? "Unit_Test_Marks_All.xlsx"
          : "Unit_Test_Marks_Filtered.xlsx";
      downloadExcel(blob, filename);
      setExportSuccess(
        mode === "all"
          ? "All unit test marks exported successfully."
          : "Filtered unit test marks exported successfully.",
      );
    } catch (error) {
      setExportError(getErrorMessage(error));
    } finally {
      setExporting(false);
      setExportMode(null);
    }
  }
  const loadingReferenceData =
    semestersQuery.isLoading || branchesQuery.isLoading;

  return { showForm, form, formError, successMessage, exportFilters, exportError, exportSuccess, exporting, exportMode, cyclesQuery, semestersQuery, branchesQuery, semesters, branches, cycles, selectedSemester, isFirstYear, exportCycles, exportSubjects, academicYears, exportCycleOptions, createMutation, deleteMutation, handleDeleteCycle, updateField, updateExportFilter, resetExportFilters, openCreateForm, closeCreateForm, handleSubmit, handleExport, loadingReferenceData, setForm, setFormError, setSuccessMessage };
}

export type UnitTestManagement = ReturnType<typeof useUnitTestManagement>;
