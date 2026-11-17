
import {
  GraduationCap,
  Plus,
  Users,
  FileSpreadsheet,
} from "lucide-react";

import useStudentManagement from "./hooks/useStudentManagement";
import StudentFilters from "./components/StudentFilters";
import StudentFormModal from "./StudentFormModal";
import StudentImportExport from "./StudentImportExport";
import StudentList from "./StudentList";

export default function StudentManagement() {
  const {
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
    isUpdatingStatus,
    isDeleting,

    importResults,
    setImportResults,
    selectedExportBranch,
    setSelectedExportBranch,
    selectedExportSemester,
    setSelectedExportSemester,
    handleImportStudents,
    handleExportStudents,
    handleDownloadTemplate,
    isImporting,
    isExporting,
    isDownloadingTemplate,
  } = useStudentManagement();

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-[#921B25]">
              <GraduationCap size={20} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Student Records
              </h2>
              <p className="text-xs text-gray-500">
                Manage students by branch and semester
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#921B25]">
              {students.length} Total Students
            </span>

            <button
              type="button"
              onClick={openCreateStudentModal}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#921B25] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#75151D]"
            >
              <Plus size={17} />
              Add Student
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-100 px-4 pt-3 sm:px-5">
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === "students"
                ? "border-[#921B25] text-[#921B25]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Users size={17} />
            View Students
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("excel")}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === "excel"
                ? "border-[#921B25] text-[#921B25]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <FileSpreadsheet size={17} />
            Import / Export
          </button>
        </div>

        {activeTab === "students" ? (
          <>
            <StudentFilters
              branches={branches}
              semesters={semesters}
              selectedBranch={selectedListBranch}
              selectedSemester={selectedListSemester}
              search={studentSearch}
              onBranchChange={setSelectedListBranch}
              onSemesterChange={setSelectedListSemester}
              onSearchChange={setStudentSearch}
              onClear={clearListFilters}
              semestersLoading={semestersLoading}
              semestersError={semestersError}
              showSearch={hasSelectedFilters}
            />

            {!hasSelectedFilters ? (
              <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#921B25]">
                  <Users size={22} />
                </div>

                <h3 className="text-sm font-semibold text-gray-800">
                  Select Branch and Semester
                </h3>

                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Choose a branch and semester above to display
                  the corresponding student records.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
                  <span className="text-sm font-medium text-gray-700">
                    Student Records
                  </span>

                  {!studentsLoading && !studentsError && (
                    <span className="text-xs text-gray-500">
                      {filteredStudents.length} result(s)
                    </span>
                  )}
                </div>

                <StudentList
                  students={filteredStudents}
                  isLoading={studentsLoading}
                  isError={studentsError}
                  search={studentSearch}
                  onEdit={openEditStudentModal}
                  onToggleStatus={handleToggleStudentStatus}
                  isUpdatingStatus={isUpdatingStatus}
                  onDelete={handleDeleteStudent}
                  isDeleting={isDeleting}
                />
              </>
            )}
          </>
        ) : (
          <StudentImportExport
            branches={branches}
            semesters={semesters}
            selectedExportBranch={selectedExportBranch}
            selectedExportSemester={selectedExportSemester}
            onExportBranchChange={setSelectedExportBranch}
            onExportSemesterChange={setSelectedExportSemester}
            onDownloadTemplate={handleDownloadTemplate}
            onImportStudents={handleImportStudents}
            onExportStudents={handleExportStudents}
            isDownloadingTemplate={isDownloadingTemplate}
            isImporting={isImporting}
            isExporting={isExporting}
            importResults={importResults}
            onDismissImportResults={() => setImportResults(null)}
          />
        )}
      </section>

      {/* Existing create/edit modal */}
      {isFormOpen && (
        <StudentFormModal
          selectedStudent={selectedStudent}
          formData={formData}
          branches={branches}
          semesters={semesters}
          semestersLoading={semestersLoading}
          semestersError={semestersError}
          semestersErrorDetails={semestersErrorDetails}
          isSaving={isSaving}
          onClose={closeStudentModal}
          onInputChange={handleInputChange}
          onSubmit={handleStudentSubmit}
        />
      )}
    </>
  );
}
