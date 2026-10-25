
import { useMemo, useState } from "react";
import {
    GraduationCap,
    Plus,
    Search,
    Download,
    Upload,
    FileSpreadsheet,
} from "lucide-react"; import { toast } from "sonner";
import useDeleteStudent from "../../../hooks/useDeleteStudent";

import useStudents from "../../../hooks/useStudents";
import useBranches from "../../../hooks/useBranches";
import useSemesters from "../../../hooks/useSemesters";
import useCreateStudent from "../../../hooks/useCreateStudent";
import useUpdateStudent from "../../../hooks/useUpdateStudent";
import useUpdateStudentStatus from "../../../hooks/useUpdateStudentStatus";

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
                <div className="space-y-4 border-b border-gray-100 bg-gray-50/70 p-4 sm:p-5">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet size={20} className="text-[#921B25]" />
                        <div>
                            <h4 className="font-semibold text-gray-800">
                                Excel Import & Export
                            </h4>
                            <p className="text-xs text-gray-500">
                                Import multiple students or export student records.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {/* Download Template */}
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            disabled={downloadTemplateMutation.isPending}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#921B25]/30 bg-white px-4 py-2 text-sm font-semibold text-[#921B25] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Download size={17} />
                            {downloadTemplateMutation.isPending
                                ? "Downloading..."
                                : "Download Template"}
                        </button>

                        {/* Import Excel */}
                        <label
                            className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#921B25] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#74151d] ${importStudentsMutation.isPending
                                ? "pointer-events-none opacity-50"
                                : ""
                                }`}
                        >
                            <Upload size={17} />
                            {importStudentsMutation.isPending
                                ? "Importing..."
                                : "Import Excel"}

                            <input
                                type="file"
                                accept=".xlsx"
                                onChange={handleImportStudents}
                                disabled={importStudentsMutation.isPending}
                                className="hidden"
                            />
                        </label>

                        {/* Export Excel */}
                        <button
                            type="button"
                            onClick={handleExportStudents}
                            disabled={exportStudentsMutation.isPending}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FileSpreadsheet size={17} />
                            {exportStudentsMutation.isPending
                                ? "Exporting..."
                                : "Export Excel"}
                        </button>
                    </div>

                    {/* Optional export filters */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="export-branch"
                                className="mb-1 block text-xs font-medium text-gray-600"
                            >
                                Export by branch
                            </label>

                            <select
                                id="export-branch"
                                value={selectedExportBranch}
                                onChange={(event) =>
                                    setSelectedExportBranch(event.target.value)
                                }
                                className="min-h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                            >
                                <option value="">All branches</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="export-semester"
                                className="mb-1 block text-xs font-medium text-gray-600"
                            >
                                Export by semester
                            </label>

                            <select
                                id="export-semester"
                                value={selectedExportSemester}
                                onChange={(event) =>
                                    setSelectedExportSemester(event.target.value)
                                }
                                className="min-h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                            >
                                <option value="">All semesters</option>
                                {semesters.map((semester) => (
                                    <option key={semester.id} value={semester.id}>
                                        Semester {semester.number}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Excel Import Results */}
                {importResults && (
                    <div className="border-b border-gray-100 p-4 sm:p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h4 className="font-semibold text-gray-800">
                                Import Report
                            </h4>

                            <button
                                type="button"
                                onClick={() => setImportResults(null)}
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100"
                            >
                                Dismiss
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                                <p className="text-xs text-gray-500">Total Records</p>
                                <p className="mt-1 text-2xl font-bold text-gray-800">
                                    {importResults.totalRecords}
                                </p>
                            </div>

                            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                <p className="text-xs text-green-700">Imported Successfully</p>
                                <p className="mt-1 text-2xl font-bold text-green-700">
                                    {importResults.successfulRecords}
                                </p>
                            </div>

                            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                <p className="text-xs text-red-700">Failed Records</p>
                                <p className="mt-1 text-2xl font-bold text-red-700">
                                    {importResults.failedRecords}
                                </p>
                            </div>
                        </div>

                        {importResults.errors.length > 0 && (
                            <div className="mt-4 overflow-hidden rounded-lg border border-red-200">
                                <div className="bg-red-50 px-4 py-3">
                                    <h5 className="text-sm font-semibold text-red-800">
                                        Records Requiring Attention
                                    </h5>
                                </div>

                                <div className="max-h-64 overflow-auto">
                                    <table className="w-full min-w-[420px] text-left text-sm">
                                        <thead className="sticky top-0 bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="px-3 py-2 font-medium">Row</th>
                                                <th className="px-3 py-2 font-medium">Roll Number</th>
                                                <th className="px-3 py-2 font-medium">Reason</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {importResults.errors.map((error, index) => (
                                                <tr key={`${error.row}-${index}`}>
                                                    <td className="px-3 py-2 text-gray-700">
                                                        {error.row}
                                                    </td>

                                                    <td className="px-3 py-2 text-gray-700">
                                                        {error.rollNo || "—"}
                                                    </td>

                                                    <td className="px-3 py-2 text-red-700">
                                                        {error.reason}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="student-form-title"
                        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6"
                    >
                        <div className="mb-5">
                            <h3
                                id="student-form-title"
                                className="text-xl font-bold text-gray-800"
                            >
                                {selectedStudent ? "Edit Student" : "Add Student"}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Enter the student's details below.
                            </p>
                        </div>

                        <form onSubmit={handleStudentSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="student-name"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Student Name
                                </label>

                                <input
                                    id="student-name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter student name"
                                    className="min-h-11 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="student-roll-no"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Roll Number
                                </label>

                                <input
                                    id="student-roll-no"
                                    name="rollNo"
                                    type="text"
                                    required
                                    value={formData.rollNo}
                                    onChange={handleInputChange}
                                    placeholder="Enter roll number"
                                    className="min-h-11 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="student-branch"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Branch
                                </label>

                                <select
                                    id="student-branch"
                                    name="branchId"
                                    required
                                    value={formData.branchId}
                                    onChange={handleInputChange}
                                    className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#921B25] focus:ring-2 focus:ring-red-100"
                                >
                                    <option value="">Select branch</option>

                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="student-semester"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Semester
                                </label>

                                <select
                                    id="student-semester"
                                    name="semesterId"
                                    value={formData.semesterId}
                                    onChange={handleInputChange}
                                    required
                                    className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="">
                                        {semestersLoading
                                            ? "Loading semesters..."
                                            : semestersError
                                                ? "Failed to load semesters"
                                                : semesters.length === 0
                                                    ? "No semesters available"
                                                    : "Select Semester"}
                                    </option>

                                    {semesters.map((semester) => (
                                        <option key={semester.id} value={semester.id}>
                                            Semester {semester.number}
                                        </option>
                                    ))}
                                </select>

                                {/*semester dropdowm*/}
                                {semestersError && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {semestersErrorDetails instanceof Error
                                            ? semestersErrorDetails.message
                                            : "Unable to load semesters."}
                                    </p>
                                )}

                                {/* Temporary debugging: remove after checking
                                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs text-gray-800">
                                    {JSON.stringify(semesters, null, 2)}
                                </pre> */}

                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeStudentModal}
                                    disabled={isSaving}
                                    className="min-h-11 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="min-h-11 rounded-lg bg-[#921B25] px-5 py-2 text-sm font-semibold text-white hover:bg-[#74151d] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSaving
                                        ? "Saving..."
                                        : selectedStudent
                                            ? "Update Student"
                                            : "Create Student"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
