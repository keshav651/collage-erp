
import { BookOpen, Plus, List } from "lucide-react";

import useSubjectManagement from "./hooks/useSubjectManagement";

import SubjectForm from "./components/SubjectForm";
import SubjectFilters from "./components/SubjectFilters";
import SubjectList from "./components/SubjectList";

export default function SubjectManagementPage() {
  const {
    activeTab,
    setActiveTab,

    branches,
    semesters,
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

    clearForm,
    openCreateForm,
    closeForm,
    startEditing,
    handleSubmit,
    handleDelete,

    isSaving,
    isDeleting,

    branchesLoading,
    branchesError,
    semestersLoading,
    semestersError,

    subjectsLoading,
    subjectsError,
    refetchSubjects,
  } = useSubjectManagement();

  return (
    <section className="mx-auto max-w-7xl space-y-5">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Subject Management
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage academic subjects by branch and semester.
        </p>
      </div>

      {/* Feedback */}
      {message && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
        >
          {message}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-[#921B25]">
              <BookOpen size={20} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Subject Records
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                View, add and manage academic subjects.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#921B25] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#75151D]"
          >
            <Plus size={17} />
            Add Subject
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-100 px-4 pt-3 sm:px-5">
          <button
            type="button"
            onClick={() => setActiveTab("subjects")}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === "subjects"
                ? "border-[#921B25] text-[#921B25]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <List size={17} />
            View Subjects
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === "form"
                ? "border-[#921B25] text-[#921B25]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Plus size={17} />
            {editingSubject ? "Edit Subject" : "Add Subject"}
          </button>
        </div>

        {activeTab === "subjects" ? (
          <>
            {/* Filters */}
            <div className="p-4 sm:p-5">
              <SubjectFilters
                branches={branches}
                semesters={semesters}
                branchFilter={branchFilter}
                semesterFilter={semesterFilter}
                requiresBranchFilter={requiresBranchFilter}
                onBranchChange={setBranchFilter}
                onSemesterChange={handleSemesterFilterChange}
                onClear={clearFilters}
              />
            </div>

            {/* List only after required filters */}
            {!hasSelectedFilters ? (
              <div className="flex flex-col items-center justify-center border-t border-gray-100 px-5 py-14 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#921B25]">
                  <BookOpen size={22} />
                </div>

                <h3 className="text-sm font-semibold text-gray-800">
                  Select Semester and Branch
                </h3>

                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Select a semester to view subjects.
                  For Semester 3 onwards, also select a branch.
                </p>
              </div>
            ) : (
              <SubjectList
                subjects={visibleSubjects}
                semesters={semesters}
                isLoading={subjectsLoading}
                isError={subjectsError}
                isDeleting={isDeleting}
                onEdit={startEditing}
                onDelete={handleDelete}
                onRetry={() => {
                  void refetchSubjects();
                }}
              />
            )}
          </>
        ) : (
          <div className="p-4 sm:p-5">
            <SubjectForm
              form={form}
              branches={branches}
              semesters={semesters}
              isEditing={Boolean(editingSubject)}
              requiresBranch={requiresBranch}
              isCommonSemester={isCommonSemester}
              isSaving={isSaving}
              branchesLoading={branchesLoading}
              branchesError={branchesError}
              semestersLoading={semestersLoading}
              semestersError={semestersError}
              onChange={updateForm}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              onClear={clearForm}
            />
          </div>
        )}
      </section>
    </section>
  );
}
