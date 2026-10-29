import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import AdminHeader from "../../../components/admin/AdminHeader";
import AdminActionFeedback from "../components/AdminActionFeedback";
import PendingTeacherSection from "../components/PendingTeacherSection";
import TeacherManagementSection from "../components/TeacherManagementSection";
import ApprovalModal from "../components/models/ApprovalModal";
import EditTeacherModal from "../components/models/EditTeacherModal";

import usePendingTeachers from "../../../hooks/usePendingTeachers";
import useBranches from "../../../hooks/useBranches";
import useTeachers from "../../../hooks/useTeachers";
import useApproveTeacher from "../../../hooks/useApproveTeacher";
import useLogout from "../../../hooks/useLogout";
import useUpdateTeacher from "../../../hooks/useUpdateTeacher";
import useDeactivateTeacher from "../../../hooks/useDeactivateTeacher";

import useSemesters from "../../../hooks/useSemesters";
import { getSubjects } from "../../../api/subjectApi";
import type { Subject } from "../../../api/subjectApi";

import type {
  PendingTeacher,
  Teacher,
  UpdateTeacherPayload,
} from "../../../api/adminApi";

import { useAuth } from "../../../context/AuthContext";

interface ApprovedTeacherCredentials {
  name: string;
  email: string;
  teacherCode?: string;
  temporaryPassword?: string;
}

function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();

  // Academic year begins in July for this application.
  const startYear = now.getMonth() >= 6 ? year : year - 1;

  return `${startYear}-${startYear + 1}`;
}

export default function TeacherManagementPage() {
  // Queries
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

  // Authentication and mutations
  const { user } = useAuth();
  const logout = useLogout();
  const approveMutation = useApproveTeacher();
  const updateTeacherMutation = useUpdateTeacher();
  const deactivateTeacherMutation = useDeactivateTeacher();

  // Approval modal state
  const [selectedTeacher, setSelectedTeacher] =
    useState<PendingTeacher | null>(null);

  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [approvalError, setApprovalError] = useState("");

  // Edit teacher modal state
  const [editingTeacher, setEditingTeacher] =
    useState<Teacher | null>(null);

  const [editName, setEditName] = useState("");
  const [editBranchId, setEditBranchId] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editStatus, setEditStatus] =
    useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [editSemesterId, setEditSemesterId] = useState("");
  const [editAcademicYear, setEditAcademicYear] =
    useState(getCurrentAcademicYear);
  const [editSubjectIds, setEditSubjectIds] = useState<string[]>([]);

  const [assignmentInitialized, setAssignmentInitialized] =
    useState(false);

  // Fetch subjects for the selected branch and semester
  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = useQuery({
    queryKey: [
      "admin",
      "subjects",
      editBranchId,
      editSemesterId,
    ],
    queryFn: () =>
      getSubjects({
        branchId: editBranchId,
        semesterId: editSemesterId,
      }),
    enabled: Boolean(
      editingTeacher && editBranchId && editSemesterId,
    ),
  });

  // Feedback and approved credentials
  const [approvedTeacherCredentials, setApprovedTeacherCredentials] =
    useState<ApprovedTeacherCredentials | null>(null);

  const [teacherActionError, setTeacherActionError] = useState("");
  const [teacherActionSuccess, setTeacherActionSuccess] = useState("");

  // Data
  const pendingTeachers = pendingData?.data ?? [];
  const branches = branchesData?.data ?? [];
  const activeTeachers = teachersData?.data ?? [];
  const semesters = semestersData?.data ?? [];
  const subjects: Subject[] = subjectsData?.data ?? [];

  // Initialize existing assignments when the subjects have loaded.
  useEffect(() => {
    if (!editingTeacher || !editSemesterId || !subjectsData) {
      return;
    }

    if (assignmentInitialized) {
      return;
    }

    const existingAssignments =
      editingTeacher.assignments?.filter(
        (assignment) =>
          assignment.active !== false &&
          assignment.academicYear === editAcademicYear &&
          assignment.subject.semesterId === editSemesterId,
      ) ?? [];

    setEditSubjectIds(
      existingAssignments
        .filter((assignment) =>
          subjects.some((subject) => subject.id === assignment.subjectId),
        )
        .map((assignment) => assignment.subjectId),
    );

    setAssignmentInitialized(true);
  }, [
    editingTeacher,
    editSemesterId,
    editAcademicYear,
    subjectsData,
    subjects,
    assignmentInitialized,
  ]);

  // Close edit modal
  const closeEditTeacherModal = () => {
    setEditingTeacher(null);
    setEditName("");
    setEditBranchId("");
    setEditPassword("");
    setEditStatus("ACTIVE");
    setEditSemesterId("");
    setEditAcademicYear(getCurrentAcademicYear());
    setEditSubjectIds([]);
    setAssignmentInitialized(false);
    setTeacherActionError("");
  };

  // Open approval modal
  const openApprovalModal = (teacher: PendingTeacher) => {
    setSelectedTeacher(teacher);
    setSelectedBranchId("");
    setApprovalError("");
  };

  // Close approval modal
  const closeApprovalModal = () => {
    setSelectedTeacher(null);
    setSelectedBranchId("");
    setApprovalError("");
  };

  // Open edit modal
  const openEditTeacherModal = (teacher: Teacher) => {
    const firstAssignment = teacher.assignments?.find(
      (assignment) => assignment.active !== false,
    );

    setEditingTeacher(teacher);
    setEditName(teacher.name ?? "");
    setEditBranchId(teacher.branchId ?? "");
    setEditStatus(
      teacher.user.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    );
    setEditPassword("");
    setEditAcademicYear(
      firstAssignment?.academicYear ?? getCurrentAcademicYear(),
    );
    setEditSemesterId(
      firstAssignment?.subject.semesterId ?? "",
    );
    setEditSubjectIds([]);
    setAssignmentInitialized(false);
    setTeacherActionError("");
    setTeacherActionSuccess("");
  };

  // When semester or academic year changes, initialize its current assignments.
  const handleSemesterChange = (semesterId: string) => {
    setEditSemesterId(semesterId);
    setEditSubjectIds([]);
    setAssignmentInitialized(false);
  };

  const handleAcademicYearChange = (academicYear: string) => {
    setEditAcademicYear(academicYear);
    setEditSubjectIds([]);
    setAssignmentInitialized(false);
  };

  const toggleSubject = (subjectId: string) => {
    setEditSubjectIds((current) =>
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId],
    );
  };

  // Approve teacher
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
      const response = await approveMutation.mutateAsync({
        userId: selectedTeacher.id,
        payload,
      });

      if (!response.success) {
        setApprovalError("Teacher approval failed.");
        return;
      }

      setApprovedTeacherCredentials({
        name: response.data.name ?? selectedTeacher.name,
        email: response.data.email ?? selectedTeacher.email,
        teacherCode: response.data.teacherCode,
        temporaryPassword: response.data.temporaryPassword,
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

  // Deactivate teacher
  const handleDeactivateTeacher = async (teacher: Teacher) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${
        teacher.name || "this teacher"
      }?`,
    );

    if (!confirmed) return;

    setTeacherActionError("");
    setTeacherActionSuccess("");

    try {
      await deactivateTeacherMutation.mutateAsync(teacher.userId);

      setTeacherActionSuccess(
        `${teacher.name || "Teacher"} has been deactivated.`,
      );
    } catch (error: unknown) {
      setTeacherActionError(
        error instanceof Error
          ? error.message
          : "Failed to deactivate teacher.",
      );
    }
  };

  // Update teacher and one semester's subject assignments
  const handleUpdateTeacher = async () => {
    if (!editingTeacher) return;

    const name = editName.trim();

    if (!name) {
      setTeacherActionError("Teacher name is required.");
      return;
    }

    if (!editBranchId) {
      setTeacherActionError("Please select a branch.");
      return;
    }

    if (editPassword.length > 0 &&
        (editPassword.length < 10 || editPassword.length > 72)) {
      setTeacherActionError(
        "Password must be between 10 and 72 characters.",
      );
      return;
    }

    if (editSemesterId && !editAcademicYear.trim()) {
      setTeacherActionError("Please enter an academic year.");
      return;
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

    // Only include assignment fields when a semester is selected.
    // The backend synchronizes assignments for this semester/year.
    if (editSemesterId) {
      payload.semesterId = editSemesterId;
      payload.academicYear = editAcademicYear.trim();
      payload.subjectIds = editSubjectIds;
    }

    try {
      await updateTeacherMutation.mutateAsync({
        userId: editingTeacher.userId,
        payload,
      });

      setTeacherActionSuccess("Teacher updated successfully.");
      closeEditTeacherModal();
    } catch (error: unknown) {
      setTeacherActionError(
        error instanceof Error
          ? error.message
          : "Failed to update teacher.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF9F7] p-4 sm:p-6">
      <AdminHeader
        user={user}
        onLogout={() => logout.mutate()}
        isLoggingOut={logout.isPending}
      />

      {/* Page navigation */}
      <div className="my-6 flex flex-wrap gap-3">
        <Link
          to="/admin/dashboard"
          className="rounded-lg bg-[#921B25] px-5 py-3 font-semibold text-white transition hover:bg-[#75151D]"
        >
          ← Back to Dashboard
        </Link>

        <Link
          to="/admin/students"
          className="rounded-lg bg-white px-5 py-3 font-semibold text-[#921B25] shadow-sm ring-1 ring-[#921B25]/20 transition hover:bg-red-50"
        >
          Student Management
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Teacher Management
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Review registrations and manage existing teachers.
        </p>
      </div>

      <AdminActionFeedback
        success={teacherActionSuccess}
        error={teacherActionError}
        showError={!editingTeacher}
      />

      {/* Pending approvals */}
      <PendingTeacherSection
        teachers={pendingTeachers}
        isLoading={pendingLoading}
        isError={pendingError}
        onApprove={openApprovalModal}
      />

      {/* Existing teachers */}
      <TeacherManagementSection
        teachers={activeTeachers}
        isLoading={teachersLoading}
        isError={teachersError}
        onEdit={openEditTeacherModal}
        onDeactivate={handleDeactivateTeacher}
      />

      {/* Approval modal */}
      {selectedTeacher && (
        <ApprovalModal
          teacher={selectedTeacher}
          branches={branches}
          selectedBranchId={selectedBranchId}
          setSelectedBranchId={(branchId) => {
            setSelectedBranchId(branchId);
            setApprovalError("");
          }}
          branchesLoading={branchesLoading}
          branchesError={Boolean(branchesError)}
          isPending={approveMutation.isPending}
          error={approvalError}
          onClose={closeApprovalModal}
          onApprove={handleApproveTeacher}
        />
      )}

      {/* Edit teacher modal */}
      {editingTeacher && (
        <EditTeacherModal
          teacherName={editingTeacher.name}
          name={editName}
          setName={setEditName}
          branchId={editBranchId}
          setBranchId={(branchId) => {
            setEditBranchId(branchId);
            setEditSemesterId("");
            setEditSubjectIds([]);
            setAssignmentInitialized(false);
          }}
          status={editStatus}
          setStatus={setEditStatus}
          password={editPassword}
          setPassword={setEditPassword}
          branches={branches}
          branchesLoading={branchesLoading}
          branchesError={Boolean(branchesError)}
          isPending={updateTeacherMutation.isPending}
          error={teacherActionError}
          semesters={semesters}
          semestersLoading={semestersLoading}
          semestersError={semestersError}
          semesterId={editSemesterId}
          setSemesterId={handleSemesterChange}
          academicYear={editAcademicYear}
          setAcademicYear={handleAcademicYearChange}
          subjects={subjects}
          subjectsLoading={subjectsLoading}
          subjectsError={subjectsError}
          selectedSubjectIds={editSubjectIds}
          onToggleSubject={toggleSubject}
          onClose={closeEditTeacherModal}
          onSubmit={handleUpdateTeacher}
        />
      )}

      {/* Approved teacher credentials */}
      {approvedTeacherCredentials && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="approved-credentials-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id="approved-credentials-title"
                className="text-xl font-bold text-gray-800"
              >
                Teacher Approved
              </h2>

              <button
                type="button"
                onClick={() => setApprovedTeacherCredentials(null)}
                aria-label="Close credentials dialog"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              The teacher has been approved successfully. Save the
              credentials securely.
            </p>

            <div className="mt-5 space-y-3 rounded-xl bg-[#FFF9F7] p-4">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Teacher Name
                </p>
                <p className="break-words font-semibold text-gray-800">
                  {approvedTeacherCredentials.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Email
                </p>
                <p className="break-all font-semibold text-gray-800">
                  {approvedTeacherCredentials.email}
                </p>
              </div>

              {approvedTeacherCredentials.teacherCode && (
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Teacher Code
                  </p>
                  <p className="font-semibold text-gray-800">
                    {approvedTeacherCredentials.teacherCode}
                  </p>
                </div>
              )}

              {approvedTeacherCredentials.temporaryPassword && (
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Temporary Password
                  </p>
                  <p className="break-all font-semibold text-gray-800">
                    {approvedTeacherCredentials.temporaryPassword}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setApprovedTeacherCredentials(null)}
              className="mt-5 min-h-11 w-full rounded-lg bg-[#921B25] px-4 py-2 font-semibold text-white hover:bg-[#75151D]"
            >
              Done
            </button>
          </section>
        </div>
      )}
    </main>
  );
}