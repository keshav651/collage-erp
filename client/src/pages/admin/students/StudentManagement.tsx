
import { useMemo, useState } from "react";
import {
    GraduationCap,
    Plus,
    Search,
} from "lucide-react"; import { toast } from "sonner";
import useDeleteStudent from "../../../hooks/useDeleteStudent";

import useStudents from "../../../hooks/useStudents";
import useBranches from "../../../hooks/useBranches";
import useSemesters from "../../../hooks/useSemesters";
import useCreateStudent from "../../../hooks/useCreateStudent";
import useUpdateStudent from "../../../hooks/useUpdateStudent";
import useUpdateStudentStatus from "../../../hooks/useUpdateStudentStatus";
import StudentFormModal from "./StudentFormModal";
import StudentImportExport from "./StudentImportExport";

import useImportStudents from "../../../hooks/useImportStudents";
import useExportStudents from "../../../hooks/useExportStudents";
import useDownloadStudentTemplate from "../../../hooks/useDownloadStudentTemplate";

import type { StudentImportResponse } from "../../../api/studentApi";

import type { Student, StudentPayload } from "../../../api/studentApi";
import StudentList from "./StudentList";

export default function StudentManagement() {
    const [studentSearch, setStudentSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [importResults, setImportResults] =
        useState<StudentImportResponse | null>(null);

    const [selectedExportBranch, setSelectedExportBranch] = useState("");
    const [selectedExportSemester, setSelectedExportSemester] = useState("");

    const [formData, setFormData] = useState<StudentPayload>({
        name: "",
        rollNo: "",
        branchId: "",
        semesterId: "",
    });

    // Fetch data
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
    // Mutations
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

    // Search students by name or roll number
    const filteredStudents = useMemo(() => {
        const search = studentSearch.trim().toLowerCase();

        if (!search) return students;

        return students.filter(
            (student) =>
                student.name.toLowerCase().includes(search) ||
                student.rollNo.toLowerCase().includes(search),
        );
    }, [students, studentSearch]);

    // Open create form
    const openCreateStudentModal = () => {
        setSelectedStudent(null);
        setFormData({
            name: "",
            rollNo: "",
            branchId: "",
            semesterId: "",
        });
        setIsFormOpen(true);
    };

    // Open edit form
    const openEditStudentModal = (student: Student) => {
        setSelectedStudent(student);
        setFormData({
            name: student.name,
            rollNo: student.rollNo,
            branchId: student.branchId,
            semesterId: student.semesterId,
        });
        setIsFormOpen(true);
    };

    // Close form
    const closeStudentModal = () => {
        setIsFormOpen(false);
        setSelectedStudent(null);
    };

    // Handle input changes
    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Create or update student
    const handleStudentSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const payload: StudentPayload = {
            name: formData.name.trim(),
            rollNo: formData.rollNo.trim(),
            branchId: formData.branchId,
            semesterId: formData.semesterId,
        };

        if (
            !payload.name ||
            !payload.rollNo ||
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
            toast.error("Unable to save student. Please check the details and try again.");
        }
    };

    // Activate or deactivate student
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
            `Are you sure you want to permanently delete ${student.name} (${student.rollNo})? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await deleteStudentMutation.mutateAsync(student.id);

            toast.success("Student deleted successfully.");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to delete student."
            );
        }
    };

    const handleImportStudents = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        // Allow selecting the same file again after an import.
        event.target.value = "";

        if (!file) return;

        const validExtension = /\.xlsx$/i.test(file.name);

        if (!validExtension) {
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
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to import students. Please try again.";

            toast.error(message);
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

    return (
        <>
            <section className="mt-6 overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#921B25]">
                            <GraduationCap size={22} />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Student Management
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                View, search, add and manage students.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-[#921B25]">
                            {students.length} Students
                        </span>

                        <button
                            type="button"
                            onClick={openCreateStudentModal}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#921B25] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#74151d]"
                        >
                            <Plus size={17} />
                            Add Student
                        </button>
                    </div>
                </div>

                {/* Excel Import / Export */}
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
                    isDownloadingTemplate={downloadTemplateMutation.isPending}
                    isImporting={importStudentsMutation.isPending}
                    isExporting={exportStudentsMutation.isPending}
                    importResults={importResults}
                    onDismissImportResults={() => setImportResults(null)}
                />

                {/* Excel Import Results */}

                {/* Search */}
                <div className="border-b border-gray-100 p-4 sm:p-5">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="search"
                            value={studentSearch}
                            onChange={(event) => setStudentSearch(event.target.value)}
                            placeholder="Search by student name or roll number..."
                            aria-label="Search students"
                            className="min-h-11 w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                        />
                    </div>
                </div>

                {/* Student list */}
                <StudentList
                    students={filteredStudents}
                    isLoading={studentsLoading}
                    isError={studentsError}
                    search={studentSearch}
                    onEdit={openEditStudentModal}
                    onToggleStatus={handleToggleStudentStatus}
                    isUpdatingStatus={updateStudentStatusMutation.isPending}
                    onDelete={handleDeleteStudent}
                    isDeleting={deleteStudentMutation.isPending}
                />
            </section>

            {/* Create/Edit Student Modal */}
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
