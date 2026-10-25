import { useState } from "react";
import {
  LogOut,
  GitBranch,
  Users,
  X,
  CheckCircle2,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";

import StudentManagement from "./students/StudentManagement";

import usePendingTeachers from "../../hooks/usePendingTeachers";
import useBranches from "../../hooks/useBranches";
import useTeachers from "../../hooks/useTeachers";
import useApproveTeacher from "../../hooks/useApproveTeacher";
import useLogout from "../../hooks/useLogout";
import useUpdateTeacher from "../../hooks/useUpdateTeacher";
import useDeleteTeacher from "../../hooks/useDeleteTeacher";

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
  const deleteTeacherMutation = useDeleteTeacher();

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

  const [editStatus, setEditStatus] = useState<
    "ACTIVE" | "INACTIVE"
  >("ACTIVE");

  const [teacherActionError, setTeacherActionError] = useState("");
  const [teacherActionSuccess, setTeacherActionSuccess] = useState("");

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

  const openApprovalModal = (teacher: PendingTeacher) => {
    setSelectedTeacher(teacher);
    setSelectedBranchId("");
    setApprovalError("");
  };

  const closeApprovalModal = () => {
    if (approveMutation.isPending) return;

    setSelectedTeacher(null);
    setSelectedBranchId("");
    setApprovalError("");
  };

  const handleApproveTeacher = async () => {
    if (!selectedTeacher) return;

    if (!selectedBranchId) {
      setApprovalError("Please select a branch.");
      return;
    }

    setApprovalError("");

    try {
      await approveMutation.mutateAsync({
        userId: selectedTeacher.id,
        branchId: selectedBranchId,
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
  // EDIT TEACHER
  // --------------------------------------------------

  const openEditTeacherModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);

    setEditName(teacher.name || "");
    setEditBranchId(teacher.branchId || "");

    setEditStatus(
      teacher.user?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE"
    );

    setTeacherActionError("");
    setTeacherActionSuccess("");
  };

  const closeEditTeacherModal = () => {
    if (updateTeacherMutation.isPending) return;

    setEditingTeacher(null);
    setTeacherActionError("");
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

    const payload: UpdateTeacherPayload = {
      name,
      branchId: editBranchId,
      status: editStatus,
    };

    setTeacherActionError("");
    setTeacherActionSuccess("");

    try {
      await updateTeacherMutation.mutateAsync({
        userId: editingTeacher.userId,
        payload,
      });

      setEditingTeacher(null);
      setTeacherActionSuccess(
        "Teacher details updated successfully."
      );
    } catch (error: unknown) {
      setTeacherActionError(
        error instanceof Error
          ? error.message
          : "Failed to update teacher."
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
      await deleteTeacherMutation.mutateAsync(teacher.userId);

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

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#FFF9F7] p-4 sm:p-6">
      {/* Header */}
      <header className="rounded-2xl bg-[#921B25] p-5 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-red-100">
              MSME College ERP
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-red-100">
              Manage your college from one place.
            </p>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white font-bold text-[#921B25]">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="font-semibold">
                  {user?.name || "Admin"}
                </p>

                <p className="text-sm text-red-100">
                  {user?.email || "Email unavailable"}
                </p>

                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-red-100">
                  {user?.role || "ADMIN"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#921B25] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={16} />
            {logout.isPending ? "Logging out..." : "Logout"}
          </button>
        </div>
      </header>

      {/* Action feedback */}
      {teacherActionSuccess && (
        <div
          role="status"
          className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
        >
          {teacherActionSuccess}
        </div>
      )}

      {teacherActionError && !editingTeacher && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {teacherActionError}
        </div>
      )}

      {/* Overview */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Overview
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Pending Approvals */}
          <article className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Pending Approvals
              </p>

              <div className="rounded-lg bg-red-50 p-2 text-[#921B25]">
                <Users size={20} />
              </div>
            </div>

            {pendingLoading ? (
              <p className="mt-3 text-sm text-gray-500">
                Loading...
              </p>
            ) : pendingError ? (
              <p className="mt-3 text-sm text-red-600">
                Failed to load pending approvals.
              </p>
            ) : (
              <p className="mt-3 text-3xl font-bold text-[#921B25]">
                {pendingCount}
              </p>
            )}

            <p className="mt-2 text-sm text-gray-500">
              Teachers awaiting approval
            </p>
          </article>

          {/* Total Branches */}
          <article className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Total Branches
              </p>

              <div className="rounded-lg bg-red-50 p-2 text-[#921B25]">
                <GitBranch size={20} />
              </div>
            </div>

            {branchesLoading ? (
              <p className="mt-3 text-sm text-gray-500">
                Loading branches...
              </p>
            ) : branchesError ? (
              <p className="mt-3 text-sm text-red-600">
                Failed to load branches.
              </p>
            ) : (
              <>
                <p className="mt-3 text-3xl font-bold text-[#921B25]">
                  {branchCount}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Academic branches registered
                </p>

                {branches.length > 0 && (
                  <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
                    {branches.map((branch) => (
                      <div
                        key={branch.id}
                        className="rounded-lg bg-[#FFF9F7] p-3"
                      >
                        <p className="font-semibold text-gray-800">
                          {branch.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Code Prefix: {branch.codePrefix}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </article>

          {/* Total Teachers */}
          <article className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Total Teachers
              </p>

              <div className="rounded-lg bg-red-50 p-2 text-[#921B25]">
                <Users size={20} />
              </div>
            </div>

            {teachersLoading ? (
              <p className="mt-3 text-sm text-gray-500">
                Loading teachers...
              </p>
            ) : teachersError ? (
              <p className="mt-3 text-sm text-red-600">
                Failed to load teachers.
              </p>
            ) : (
              <p className="mt-3 text-3xl font-bold text-[#921B25]">
                {teacherCount}
              </p>
            )}

            <p className="mt-2 text-sm text-gray-500">
              Teachers returned by the API
            </p>
          </article>
        </div>

        {/* Pending Teachers */}
        <div className="mt-6 overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Pending Teacher Approvals
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Review and approve teachers waiting for administrator approval.
              </p>
            </div>

            {!pendingLoading && !pendingError && (
              <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                {pendingCount} Pending
              </span>
            )}
          </div>

          {pendingLoading ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Loading pending teachers...
            </div>
          ) : pendingError ? (
            <div className="p-6 text-center text-sm text-red-600">
              Unable to load teachers. Please try again later.
            </div>
          ) : pendingCount === 0 ? (
            <div className="p-8 text-center">
              <div className="text-3xl" aria-hidden="true">
                ✓
              </div>

              <h4 className="mt-3 font-semibold text-gray-800">
                All caught up!
              </h4>

              <p className="mt-1 text-sm text-gray-500">
                There are no teachers waiting for approval.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingTeachers.map((teacher) => (
                <article
                  key={teacher.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 font-bold text-[#921B25]">
                      {(teacher.name || teacher.email || "T")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h4 className="break-words font-semibold text-gray-800">
                        {teacher.name || "Name unavailable"}
                      </h4>

                      <p className="break-all text-sm text-gray-500">
                        {teacher.email}
                      </p>

                      {teacher.createdAt && (
                        <p className="mt-1 text-xs text-gray-400">
                          Registered:{" "}
                          {new Date(
                            teacher.createdAt
                          ).toLocaleDateString()}
                        </p>
                      )}

                      <span className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Pending Approval
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openApprovalModal(teacher)}
                    disabled={approveMutation.isPending}
                    className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#921B25] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#75151D] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <CheckCircle2 size={17} />
                    Approve Teacher
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Active Teachers / Teacher Management */}
        <div className="mt-6 overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Teacher Management
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Edit teacher details, change branch or status, and deactivate accounts.
              </p>
            </div>

            {!teachersLoading && !teachersError && (
              <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                {activeTeachers.length} Teachers
              </span>
            )}
          </div>

          {teachersLoading ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Loading teachers...
            </div>
          ) : teachersError ? (
            <div className="p-6 text-center text-sm text-red-600">
              Unable to load teachers. Please try again later.
            </div>
          ) : activeTeachers.length === 0 ? (
            <div className="p-8 text-center">
              <Users
                size={32}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 font-semibold text-gray-800">
                No teachers found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Approved teachers returned by the API will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeTeachers.map((teacher) => {
                const isInactive =
                  teacher.user?.status === "INACTIVE";

                return (
                  <article
                    key={teacher.id}
                    className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 font-bold text-[#921B25]">
                        {(teacher.name ||
                          teacher.user?.email ||
                          "T")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h4 className="break-words font-semibold text-gray-800">
                          {teacher.name || "Name unavailable"}
                        </h4>

                        <p className="break-all text-sm text-gray-500">
                          {teacher.user?.email || "Email unavailable"}
                        </p>

                        {teacher.branch?.name && (
                          <p className="mt-1 text-sm text-gray-500">
                            Branch: {teacher.branch.name}
                            {teacher.branch.codePrefix
                              ? ` (${teacher.branch.codePrefix})`
                              : ""}
                          </p>
                        )}

                        {teacher.teacherCode && (
                          <p className="mt-1 text-xs text-gray-400">
                            Teacher ID: {teacher.teacherCode}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${isInactive
                            ? "bg-gray-100 text-gray-700"
                            : "bg-green-50 text-green-700"
                          }`}
                      >
                        {teacher.user?.status || "ACTIVE"}
                      </span>

                      <button
                        type="button"
                        onClick={() => openEditTeacherModal(teacher)}
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-[#921B25] hover:bg-red-50 sm:flex-none"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeactivateTeacher(teacher)
                        }
                        disabled={
                          isInactive ||
                          deleteTeacherMutation.isPending
                        }
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                      >
                        <Trash2 size={15} />
                        {isInactive ? "Inactive" : "Deactivate"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Student Management */}
        <StudentManagement />

        
      </section>

      {/* Approve Teacher Modal */}
      {selectedTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeApprovalModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-modal-title"
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="approval-modal-title"
                  className="text-xl font-bold text-gray-800"
                >
                  Approve Teacher
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review the teacher and assign a branch.
                </p>
              </div>

              <button
                type="button"
                onClick={closeApprovalModal}
                disabled={approveMutation.isPending}
                aria-label="Close approval dialog"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-[#FFF9F7] p-4">
              <p className="font-semibold text-gray-800">
                {selectedTeacher.name || "Name unavailable"}
              </p>

              <p className="mt-1 break-all text-sm text-gray-500">
                {selectedTeacher.email}
              </p>
            </div>

            <div className="mt-5">
              <label
                htmlFor="teacher-branch"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Assign Branch{" "}
                <span className="text-red-600">*</span>
              </label>

              <select
                id="teacher-branch"
                value={selectedBranchId}
                onChange={(event) => {
                  setSelectedBranchId(event.target.value);
                  setApprovalError("");
                }}
                disabled={
                  branchesLoading || approveMutation.isPending
                }
                className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
              >
                <option value="">
                  {branchesLoading
                    ? "Loading branches..."
                    : "Select a branch"}
                </option>

                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.codePrefix})
                  </option>
                ))}
              </select>

              {branchesError && (
                <p className="mt-2 text-sm text-red-600">
                  Unable to load branches. Please try again later.
                </p>
              )}

              {!branchesLoading &&
                !branchesError &&
                branches.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    No branches are available. Add a branch before approving this teacher.
                  </p>
                )}
            </div>

            {approvalError && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {approvalError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeApprovalModal}
                disabled={approveMutation.isPending}
                className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApproveTeacher}
                disabled={
                  approveMutation.isPending ||
                  branchesLoading ||
                  branchesError ||
                  branches.length === 0
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#921B25] px-4 py-2 text-sm font-semibold text-white hover:bg-[#75151D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={17} />

                {approveMutation.isPending
                  ? "Approving..."
                  : "Confirm Approval"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditTeacherModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-teacher-title"
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2
                  id="edit-teacher-title"
                  className="text-xl font-bold text-gray-800"
                >
                  Edit Teacher
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update teacher information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditTeacherModal}
                disabled={updateTeacherMutation.isPending}
                aria-label="Close edit teacher dialog"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="edit-teacher-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Teacher Name
                </label>

                <input
                  id="edit-teacher-name"
                  type="text"
                  value={editName}
                  onChange={(event) =>
                    setEditName(event.target.value)
                  }
                  required
                  className="min-h-12 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                />
              </div>

              {/* Branch */}
              <div>
                <label
                  htmlFor="edit-teacher-branch"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Branch
                </label>

                <select
                  id="edit-teacher-branch"
                  value={editBranchId}
                  onChange={(event) =>
                    setEditBranchId(event.target.value)
                  }
                  disabled={branchesLoading || branchesError}
                  className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
                >
                  <option value="">
                    {branchesLoading
                      ? "Loading branches..."
                      : "Select a branch"}
                  </option>

                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} ({branch.codePrefix})
                    </option>
                  ))}
                </select>

                {branchesError && (
                  <p className="mt-2 text-sm text-red-600">
                    Unable to load branches.
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="edit-teacher-status"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Status
                </label>

                <select
                  id="edit-teacher-status"
                  value={editStatus}
                  onChange={(event) =>
                    setEditStatus(
                      event.target.value as "ACTIVE" | "INACTIVE"
                    )
                  }
                  className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              {/* Error */}
              {teacherActionError && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {teacherActionError}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditTeacherModal}
                  disabled={updateTeacherMutation.isPending}
                  className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdateTeacher}
                  disabled={
                    updateTeacherMutation.isPending ||
                    branchesLoading ||
                    branchesError ||
                    branches.length === 0
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#921B25] px-4 py-2 text-sm font-semibold text-white hover:bg-[#75151D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />

                  {updateTeacherMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}