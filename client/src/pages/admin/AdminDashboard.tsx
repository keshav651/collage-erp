import AdminHeader from "../../components/admin/AdminHeader";
import AdminOverview from "../../components/admin/AdminOverview";
import PendingTeacherSection from "./components/PendingTeacherSection";
import TeacherManagementSection from "./components/TeacherManagementSection";
import AdminActionFeedback from "./components/AdminActionFeedback";
import { useState } from "react";
import useDeactivateTeacher from "../../hooks/useDeactivateTeache";
import EditTeacherModal from "./components/models/EditTeacherModal";
import ApprovalModal from "./components/models/ApprovalModal";
import StudentManagement from "./students/StudentManagement";
import {
  X
  // other imports...
} from "lucide-react";


import usePendingTeachers from "../../hooks/usePendingTeachers";
import useBranches from "../../hooks/useBranches";
import useTeachers from "../../hooks/useTeachers";
import useApproveTeacher from "../../hooks/useApproveTeacher";
import useLogout from "../../hooks/useLogout";
import useUpdateTeacher from "../../hooks/useUpdateTeacher";
import type {
  PendingTeacher,
  Teacher,
  UpdateTeacherPayload,
} from "../../api/adminApi";

import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
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

  // Mutations and authentication
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

  const [editStatus, setEditStatus] = useState<
    "ACTIVE" | "INACTIVE"
  >("ACTIVE");

  interface ApprovedTeacherCredentials {
    name: string;
    email: string;
    teacherCode?: string;
    temporaryPassword?: string;
  }

  const [approvedTeacherCredentials, setApprovedTeacherCredentials] =
    useState<ApprovedTeacherCredentials | null>(null);

  const [teacherActionError, setTeacherActionError] = useState("");
  const [teacherActionSuccess, setTeacherActionSuccess] = useState("");


  const closeEditTeacherModal = () => {
    setEditingTeacher(null);
    setEditName("");
    setEditBranchId("");
    setEditPassword("");
    setEditStatus("ACTIVE");
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

  // Open edit teacher modal
  const openEditTeacherModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditName(teacher.name ?? "");
    setEditBranchId(teacher.branchId ?? "");
    setEditStatus("ACTIVE");
    setEditPassword("");
    setTeacherActionError("");
    setTeacherActionSuccess("");
  };


  // Data
  const pendingTeachers = pendingData?.data ?? [];
  const pendingCount = pendingTeachers.length;

  const branches = branchesData?.data ?? [];
  const branchCount = branchesData?.count ?? branches.length;

  const activeTeachers = teachersData?.data ?? [];
  const teacherCount = teachersData?.count ?? activeTeachers.length;

  // --------------------------------------------------
  // APPROVE TEACHER
  // --------------------------------------------------


  const handleApproveTeacher = async () => {
    if (!selectedTeacher) return;

    if (!selectedBranchId) {
      setApprovalError("Please select a branch.");
      return;
    }

    setApprovalError("");
    setApprovedTeacherCredentials(null);

    try {
      const response = await approveMutation.mutateAsync({
        userId: selectedTeacher.id,
        branchId: selectedBranchId,
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

      setSelectedTeacher(null);
      setSelectedBranchId("");
    } catch (error: unknown) {
      setApprovalError(
        error instanceof Error
          ? error.message
          : "Failed to approve teacher. Please try again."
      );
    }
  };


  // --------------------------------------------------
  // DEACTIVATE TEACHER
  // --------------------------------------------------

  const handleDeactivateTeacher = async (teacher: Teacher) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${teacher.name || "this teacher"
      }?`
    );

    if (!confirmed) return;

    setTeacherActionError("");
    setTeacherActionSuccess("");

    try {
      await deactivateTeacherMutation.mutateAsync(teacher.userId);

      setTeacherActionSuccess(
        `${teacher.name || "Teacher"} has been deactivated.`
      );
    } catch (error: unknown) {
      setTeacherActionError(
        error instanceof Error
          ? error.message
          : "Failed to deactivate teacher."
      );
    }
  };





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

    if (
      editPassword.length > 0 &&
      (editPassword.length < 10 || editPassword.length > 72)
    ) {
      setTeacherActionError(
        "Password must be between 10 and 72 characters."
      );
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
          : "Failed to update teacher."
      );
    }
  };


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#FFF9F7] p-4 sm:p-6">
      {/* Header */}
      <AdminHeader
        user={user}
        onLogout={() => logout.mutate()}
        isLoggingOut={logout.isPending}
      />

      {/* Action feedback */}

      <AdminActionFeedback
        success={teacherActionSuccess}
        error={teacherActionError}
        showError={!editingTeacher}
      />

      {/* Overview */}
      <AdminOverview
        pendingCount={pendingCount}
        pendingLoading={pendingLoading}
        pendingError={pendingError}
        branches={branches}
        branchCount={branchCount}
        branchesLoading={branchesLoading}
        branchesError={branchesError}
        teacherCount={teacherCount}
        teachersLoading={teachersLoading}
        teachersError={teachersError}
      />

      {/* Student Management */}
      <StudentManagement />

      {/* Pending Teacher Approvals */}
      <PendingTeacherSection
        teachers={pendingTeachers}
        isLoading={pendingLoading}
        isError={pendingError}
        onApprove={openApprovalModal}
      />

      {/* Teacher Management */}
      <TeacherManagementSection
        teachers={activeTeachers}
        isLoading={teachersLoading}
        isError={teachersError}
        onEdit={openEditTeacherModal}
        onDeactivate={handleDeactivateTeacher}
      />

      {/* Approve Teacher Modal */}
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

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <EditTeacherModal
          teacherName={editingTeacher.name}
          name={editName}
          setName={setEditName}
          branchId={editBranchId}
          setBranchId={setEditBranchId}
          status={editStatus}
          setStatus={setEditStatus}
          password={editPassword}
          setPassword={setEditPassword}
          branches={branches}
          branchesLoading={branchesLoading}
          branchesError={Boolean(branchesError)}
          isPending={updateTeacherMutation.isPending}
          error={teacherActionError}
          onClose={closeEditTeacherModal}
          onSubmit={handleUpdateTeacher}
        />
      )}

      {/* Approved Teacher Credentials Modal */}
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
                <X size={20} />
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              The teacher has been approved successfully.
              Save the credentials securely.
            </p>

            <div className="mt-5 space-y-3 rounded-xl bg-[#FFF9F7] p-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Teacher Name</p>
                <p className="break-words font-semibold text-gray-800">
                  {approvedTeacherCredentials.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">Email</p>
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