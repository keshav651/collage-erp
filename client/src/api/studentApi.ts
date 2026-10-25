
import api from "./client";

// ---------- Types ----------

export interface StudentBranch {
  id: string;
  name: string;
  codePrefix: string;
}

export interface StudentSemester {
  id: string;
  number: number;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  branchId: string;
  semesterId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  branch: StudentBranch;
  semester: StudentSemester;
}

export interface StudentPayload {
  rollNo: string;
  name: string;
  branchId: string;
  semesterId: string;
}

export interface UpdateStudentPayload {
  rollNo?: string;
  name?: string;
  branchId?: string;
  semesterId?: string;
}

export interface StudentsResponse {
  success: boolean;
  data: Student[];
}

export interface StudentResponse {
  success: boolean;
  message?: string;
  data: Student;
}

export interface StudentStatusResponse {
  success: boolean;
  message: string;
  data: Student;
}

// ---------- Get All Students ----------

export async function getStudents(): Promise<StudentsResponse> {
  const response = await api.get<StudentsResponse>("/students");

  return response.data;
}

// ---------- Get Student By ID ----------

export async function getStudentById(
  id: string
): Promise<StudentResponse> {
  const response = await api.get<StudentResponse>(`/students/${id}`);

  return response.data;
}

// ---------- Create Student ----------

export async function createStudent(
  payload: StudentPayload
): Promise<StudentResponse> {
  const response = await api.post<StudentResponse>("/students", payload);

  return response.data;
}

// ---------- Update Student ----------

export async function updateStudent(
  id: string,
  payload: UpdateStudentPayload
): Promise<StudentResponse> {
  const response = await api.patch<StudentResponse>(
    `/students/${id}`,
    payload
  );

  return response.data;
}

// ---------- Activate / Deactivate Student ----------

export async function updateStudentStatus(
  id: string,
  isActive: boolean
): Promise<StudentStatusResponse> {
  const response = await api.patch<StudentStatusResponse>(
    `/students/${id}/status`,
    { isActive }
  );

  return response.data;
}


// Permanently delete a student
export const deleteStudent = async (id: string) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
}



// ---------- Excel Import / Export Types ----------

export interface StudentImportError {
  row: number;
  rollNo?: string;
  reason: string;
}

export interface StudentImportResponse {
  success: boolean;
  message: string;
  batchId?: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: StudentImportError[];
}

// ---------- Download Student Excel Template ----------

export async function downloadStudentTemplate(): Promise<Blob> {
  const response = await api.get(
    "/admin/students/template",
    { responseType: "blob" },
  );

  return response.data;
}

// ---------- Import Students from Excel ----------

export async function importStudents(
  file: File,
): Promise<StudentImportResponse> {
  const formData = new FormData();

  formData.append("file", file, file.name);

  const response = await api.post<StudentImportResponse>(
    "/admin/students/import",
    formData,
  );

  return response.data;
}

// ---------- Export Students to Excel ----------

export interface StudentExportFilters {
  branchId?: string;
  semesterId?: string;
}

export async function exportStudents(
  filters: StudentExportFilters = {},
): Promise<Blob> {
  const response = await api.get(
    "/admin/students/export",
    {
      params: filters,
      responseType: "blob",
    },
  );

  return response.data;
}