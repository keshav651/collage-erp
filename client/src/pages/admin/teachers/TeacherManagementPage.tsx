
import PageHeader from "../../../components/common/PageHeader";

import AdminActionFeedback from "../components/AdminActionFeedback";
import PendingTeacherSection from "../components/PendingTeacherSection";
import TeacherManagementSection from "../components/TeacherManagementSection";

import ApprovalModal from "../components/models/ApprovalModal";
import EditTeacherModal from "../components/models/EditTeacherModal";

import TeacherCredentialsModal from "./components/TeacherCredentialsModal";

import useTeacherManagement from "./hooks/useTeacherManagement";

export default function TeacherManagementPage() {
  const {

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
  } = useTeacherManagement();

  return (
    <main className="min-h-screen bg-[#FFF9F7] p-4 sm:p-6">

  

      <PageHeader
        title="Teacher Management"
        description="Review registrations and manage existing teachers."
      />

      <AdminActionFeedback
        success={teacherActionSuccess}
        error={teacherActionError}
        showError={!editingTeacher}
      />

      <PendingTeacherSection
        teachers={pendingTeachers}
        isLoading={pendingLoading}
        isError={pendingError}
        onApprove={openApprovalModal}
      />

      <TeacherManagementSection
        teachers={activeTeachers}
        isLoading={teachersLoading}
        isError={teachersError}
        onEdit={openEditTeacherModal}
        onDeactivate={handleDeactivateTeacher}
      />

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

      {editingTeacher && (
        <EditTeacherModal
          teacherName={editingTeacher.name}
          name={editName}
          setName={setEditName}
          branchId={editBranchId}
          setBranchId={handleBranchChange}
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
          selectedSemesterIds={selectedSemesterIds}
          onToggleSemester={handleToggleSemester}
          academicYear={editAcademicYear}
          setAcademicYear={handleAcademicYearChange}
          subjectsBySemester={subjectsBySemester}
          selectedSubjectsBySemester={
            selectedSubjectsBySemester
          }
          onToggleSubject={handleToggleSubject}
          onClose={closeEditTeacherModal}
          onSubmit={handleUpdateTeacher}
        />
      )}

      {approvedTeacherCredentials && (
        <TeacherCredentialsModal
          credentials={approvedTeacherCredentials}
          onClose={() =>
            setApprovedTeacherCredentials(null)
          }
        />
      )}
    </main>
  );
}
