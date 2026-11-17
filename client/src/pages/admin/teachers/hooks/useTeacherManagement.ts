
import { useState } from "react";
import { useQueries } from "@tanstack/react-query";

import usePendingTeachers from "../../../../hooks/usePendingTeachers";
import useBranches from "../../../../hooks/useBranches";
import useTeachers from "../../../../hooks/useTeachers";
import useApproveTeacher from "../../../../hooks/useApproveTeacher";
import useLogout from "../../../../hooks/useLogout";
import useUpdateTeacher from "../../../../hooks/useUpdateTeacher";
import useDeactivateTeacher from "../../../../hooks/useDeactivateTeacher";
import useSemesters from "../../../../hooks/useSemesters";

import { getSubjects } from "../../../../api/subjectApi";
import type { Subject } from "../../../../api/subjectApi";

import type {
  PendingTeacher,
  Teacher,
  UpdateTeacherPayload,
} from "../../../../api/adminApi";

import { useAuth } from "../../../../context/AuthContext";

import type { ApprovedTeacherCredentials } from
  "../components/TeacherCredentialsModal";

function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 6 ? year : year - 1;

  return `${startYear}-${startYear + 1}`;
}

function getAssignmentsForYear(
  teacher: Teacher,
  academicYear: string,
): {
  semesterIds: string[];
  subjectsBySemester: Record<string, string[]>;
} {
  const semesterIds: string[] = [];
  const subjectsBySemester: Record<string, string[]> = {};

  for (const assignment of teacher.assignments ?? []) {
    if (
      assignment.active === false ||
      assignment.academicYear !== academicYear
    ) {
      continue;
    }

    const semesterId = assignment.subject.semesterId;

    if (!semesterId || !assignment.subjectId) {
      continue;
    }

    if (!semesterIds.includes(semesterId)) {
      semesterIds.push(semesterId);
    }

    if (!subjectsBySemester[semesterId]) {
      subjectsBySemester[semesterId] = [];
    }

    if (
      !subjectsBySemester[semesterId].includes(
        assignment.subjectId,
      )
    ) {
      subjectsBySemester[semesterId].push(
        assignment.subjectId,
      );
    }
  }

  return {
    semesterIds,
    subjectsBySemester,
  };
}

export default function useTeacherManagement() {
  // 1. Existing API hooks
  const {
    data: pendingData,
    isLoading: pendingLoading,
    isError: pendingError,
  } = usePendingTeachers();

  const {
    data: branchesData,
    isLoading: branchesLoading,
    isError: branchesError,
  } = useBranches();

  const {
    data: teachersData,
    isLoading: teachersLoading,
    isError: teachersError,
  } = useTeachers();

  const {
    data: semestersData,
    isLoading: semestersLoading,
    isError: semestersError,
  } = useSemesters();

  const { user } = useAuth();
  const logout = useLogout();
  const approveMutation = useApproveTeacher();
  const updateTeacherMutation = useUpdateTeacher();
  const deactivateTeacherMutation = useDeactivateTeacher();

  // 2. Approval modal state
  const [selectedTeacher, setSelectedTeacher] =
    useState<PendingTeacher | null>(null);

  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [approvalError, setApprovalError] = useState("");

  // 3. Edit modal state
  const [editingTeacher, setEditingTeacher] =
    useState<Teacher | null>(null);

  const [editName, setEditName] = useState("");
  const [editBranchId, setEditBranchId] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const [editStatus, setEditStatus] =
    useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [editAcademicYear, setEditAcademicYear] =
    useState(getCurrentAcademicYear);

  const [selectedSemesterIds, setSelectedSemesterIds] =
    useState<string[]>([]);

  const [
    selectedSubjectsBySemester,
    setSelectedSubjectsBySemester,
  ] = useState<Record<string, string[]>>({});

  // 4. Subjects query
  const semesterSubjectQueries = useQueries({
    queries: selectedSemesterIds.map((semesterId) => ({
      queryKey: [
        "admin",
        "subjects",
        editBranchId,
        semesterId,
      ],
      queryFn: () =>
        getSubjects({
          branchId: editBranchId,
          semesterId,
        }),
      enabled: Boolean(
        editingTeacher && editBranchId && semesterId,
      ),
    })),
  });

  // 5. Feedback state
  const [
    approvedTeacherCredentials,
    setApprovedTeacherCredentials,
  ] = useState<ApprovedTeacherCredentials | null>(null);

  const [teacherActionError, setTeacherActionError] =
    useState("");

  const [teacherActionSuccess, setTeacherActionSuccess] =
    useState("");

  // 6. Data
  const pendingTeachers = pendingData?.data ?? [];
  const branches = branchesData?.data ?? [];
  const activeTeachers = teachersData?.data ?? [];
  const semesters = semestersData?.data ?? [];

  const subjectsBySemester: Record<
    string,
    {
      subjects: Subject[];
      isLoading: boolean;
      isError: boolean;
    }
  > = {};

  selectedSemesterIds.forEach((semesterId, index) => {
    const query = semesterSubjectQueries[index];

    subjectsBySemester[semesterId] = {
      subjects: (query?.data?.data ?? []) as Subject[],
      isLoading: Boolean(query?.isLoading),
      isError: Boolean(query?.isError),
    };
  });

  const loadedAssignmentsAreValid =
    selectedSemesterIds.every((semesterId) => {
      const query = subjectsBySemester[semesterId];

      if (!query || query.isLoading || query.isError) {
        return false;
      }

      const validSubjectIds = new Set(
        query.subjects.map((subject) => subject.id),
      );

      return (
        selectedSubjectsBySemester[semesterId] ?? []
      ).every((id) => validSubjectIds.has(id));
    });

  // 7. Assignment helpers
  const initializeAssignmentsForYear = (
    teacher: Teacher,
    academicYear: string,
  ) => {
    const assignments = getAssignmentsForYear(
      teacher,
      academicYear,
    );

    setSelectedSemesterIds(assignments.semesterIds);
    setSelectedSubjectsBySemester(
      assignments.subjectsBySemester,
    );
  };

  // 8. Modal handlers
  const closeEditTeacherModal = () => {
    setEditingTeacher(null);
    setEditName("");
    setEditBranchId("");
    setEditPassword("");
    setEditStatus("ACTIVE");
    setEditAcademicYear(getCurrentAcademicYear());
    setSelectedSemesterIds([]);
    setSelectedSubjectsBySemester({});
    setTeacherActionError("");
  };

  const openApprovalModal = (teacher: PendingTeacher) => {
    setSelectedTeacher(teacher);
    setSelectedBranchId("");
    setApprovalError("");
  };

  const closeApprovalModal = () => {
    setSelectedTeacher(null);
    setSelectedBranchId("");
    setApprovalError("");
  };

  const openEditTeacherModal = (teacher: Teacher) => {
    const firstAssignment = teacher.assignments?.find(
      (assignment) => assignment.active !== false,
    );

    const academicYear =
      firstAssignment?.academicYear ??
      getCurrentAcademicYear();

    setEditingTeacher(teacher);
    setEditName(teacher.name ?? "");
    setEditBranchId(teacher.branchId ?? "");
    setEditStatus(
      teacher.user.status === "INACTIVE"
        ? "INACTIVE"
        : "ACTIVE",
    );
    setEditPassword("");
    setEditAcademicYear(academicYear);

    initializeAssignmentsForYear(
      teacher,
      academicYear,
    );

    setTeacherActionError("");
    setTeacherActionSuccess("");
  };

  // 9. Form handlers
  const handleBranchChange = (branchId: string) => {
    setEditBranchId(branchId);
    setSelectedSubjectsBySemester({});
    setTeacherActionError("");
  };

  const handleAcademicYearChange = (
    academicYear: string,
  ) => {
    setEditAcademicYear(academicYear);

    if (editingTeacher) {
      initializeAssignmentsForYear(
        editingTeacher,
        academicYear,
      );
    }

    setTeacherActionError("");
  };

  const handleToggleSemester = (semesterId: string) => {
    setSelectedSemesterIds((current) => {
      if (current.includes(semesterId)) {
        return current.filter(
          (id) => id !== semesterId,
        );
      }

      return [...current, semesterId];
    });

    setTeacherActionError("");
  };

  const handleToggleSubject = (
    semesterId: string,
    subjectId: string,
  ) => {
    setSelectedSubjectsBySemester((current) => {
      const currentSubjectIds =
        current[semesterId] ?? [];

      const nextSubjectIds =
        currentSubjectIds.includes(subjectId)
          ? currentSubjectIds.filter(
              (id) => id !== subjectId,
            )
          : [...currentSubjectIds, subjectId];

      return {
        ...current,
        [semesterId]: nextSubjectIds,
      };
    });

    setTeacherActionError("");
  };

  // 10. Approve teacher
  const handleApproveTeacher = async (payload: {
    branchId: string;
    semesterId: string;
    subjectIds: string[];
    academicYear: string;
  }) => {
    if (!selectedTeacher) return;

    setApprovalError("");
    setApprovedTeacherCredentials(null);

    try {
      const response =
        await approveMutation.mutateAsync({
          userId: selectedTeacher.id,
          payload,
        });

      if (!response.success) {
        setApprovalError(
          "Teacher approval failed.",
        );
        return;
      }

      setApprovedTeacherCredentials({
        name:
          response.data.name ??
          selectedTeacher.name,
        email:
          response.data.email ??
          selectedTeacher.email,
        teacherCode: response.data.teacherCode,
        temporaryPassword:
          response.data.temporaryPassword,
      });

      closeApprovalModal();
    } catch (error: unknown) {
      setApprovalError(
        error instanceof Error
          ? error.message
          : "Failed to approve teacher. Please try again.",
      );
    }
  };

  // 11. Deactivate teacher
  const handleDeactivateTeacher = async (
    teacher: Teacher,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${
        teacher.name || "this teacher"
      }?`,
    );

    if (!confirmed) return;

    setTeacherActionError("");
    setTeacherActionSuccess("");

    try {
      await deactivateTeacherMutation.mutateAsync(
        teacher.userId,
      );

      setTeacherActionSuccess(
        `${
          teacher.name || "Teacher"
        } has been deactivated.`,
      );
    } catch (error: unknown) {
      setTeacherActionError(
        error instanceof Error
          ? error.message
          : "Failed to deactivate teacher.",
      );
    }
  };

  // 12. Update teacher
  const handleUpdateTeacher = async () => {
    if (!editingTeacher) return;

    const name = editName.trim();
    const academicYear = editAcademicYear.trim();

    if (!name) {
      setTeacherActionError(
        "Teacher name is required.",
      );
      return;
    }

    if (!editBranchId) {
      setTeacherActionError(
        "Please select a branch.",
      );
      return;
    }

    if (
      editPassword.length > 0 &&
      (editPassword.length < 10 ||
        editPassword.length > 72)
    ) {
      setTeacherActionError(
        "Password must be between 10 and 72 characters.",
      );
      return;
    }

    if (selectedSemesterIds.length > 0) {
      if (!/^\d{4}-\d{4}$/.test(academicYear)) {
        setTeacherActionError(
          "Enter the academic year in YYYY-YYYY format.",
        );
        return;
      }

      if (semestersLoading || semestersError) {
        setTeacherActionError(
          "Please wait until semesters are loaded successfully.",
        );
        return;
      }

      if (!loadedAssignmentsAreValid) {
        setTeacherActionError(
          "Please wait for all selected semester subjects to load. Ensure every selected subject belongs to its semester.",
        );
        return;
      }
    }

    setTeacherActionError("");
    setTeacherActionSuccess("");

    const payload: UpdateTeacherPayload = {
      name,
      branchId: editBranchId,
      status: editStatus,
    };

    if (editPassword.length > 0) {
      payload.password = editPassword;
    }

    if (selectedSemesterIds.length > 0) {
      payload.academicYear = academicYear;

      payload.semesterAssignments =
        selectedSemesterIds.map((semesterId) => ({
          semesterId,
          subjectIds:
            selectedSubjectsBySemester[semesterId] ??
            [],
        }));
    }

    try {
      await updateTeacherMutation.mutateAsync({
        userId: editingTeacher.userId,
        payload,
      });

      setTeacherActionSuccess(
        "Teacher updated successfully.",
      );
      closeEditTeacherModal();
    } catch (error: unknown) {
      setTeacherActionError(
        error instanceof Error
          ? error.message
          : "Failed to update teacher.",
      );
    }
  };

  // 13. Expose state and handlers to page
  return {
    user,
    logout,

    pendingTeachers,
    branches,
    activeTeachers,
    semesters,
    subjectsBySemester,

    pendingLoading,
    pendingError,
    branchesLoading,
    branchesError,
    teachersLoading,
    teachersError,
    semestersLoading,
    semestersError,

    approveMutation,
    updateTeacherMutation,

    selectedTeacher,
    selectedBranchId,
    editingTeacher,
    approvedTeacherCredentials,

    editName,
    editBranchId,
    editPassword,
    editStatus,
    editAcademicYear,
    selectedSemesterIds,
    selectedSubjectsBySemester,

    approvalError,
    teacherActionError,
    teacherActionSuccess,

    setSelectedBranchId,
    setApprovalError,
    setEditName,
    setEditPassword,
    setEditStatus,
    setApprovedTeacherCredentials,

    openApprovalModal,
    closeApprovalModal,
    openEditTeacherModal,
    closeEditTeacherModal,

    handleBranchChange,
    handleAcademicYearChange,
    handleToggleSemester,
    handleToggleSubject,
    handleApproveTeacher,
    handleDeactivateTeacher,
    handleUpdateTeacher,
  };
}
