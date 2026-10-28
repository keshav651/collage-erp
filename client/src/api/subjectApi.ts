import api from "./client";

export interface SubjectBranch {
  id: string;
  name: string;
  codePrefix?: string;
}

export interface SubjectSemester {
  id: string;
  number: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  branchId: string | null;
  semesterId: string;
  branch?: SubjectBranch | null;
  semester?: SubjectSemester;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectsResponse {
  success: boolean;
  count: number;
  data: Subject[];
}

export interface SubjectResponse {
  success: boolean;
  message: string;
  data: Subject;
}

export interface SubjectActionResponse {
  success: boolean;
  message: string;
}

export interface CreateSubjectPayload {
  name: string;
  code: string;
  semesterId: string;
  branchId?: string | null;
}

export interface UpdateSubjectPayload {
  name?: string;
  code?: string;
  semesterId?: string;
  branchId?: string | null;
}

// Get subjects, optionally filtered by branch and semester
export async function getSubjects(params?: {
  branchId?: string;
  semesterId?: string;
}): Promise<SubjectsResponse> {
  const response = await api.get<SubjectsResponse>("/admin/subjects", {
    params,
  });

  return response.data;
}

// Create subject
export async function createSubject(
  payload: CreateSubjectPayload
): Promise<SubjectResponse> {
  const response = await api.post<SubjectResponse>(
    "/admin/subjects",
    payload
  );

  return response.data;
}

// Update subject
export async function updateSubject(
  id: string,
  payload: UpdateSubjectPayload
): Promise<SubjectResponse> {
  const response = await api.patch<SubjectResponse>(
    `/admin/subjects/${id}`,
    payload
  );

  return response.data;
}

// Delete subject
export async function deleteSubject(
  id: string
): Promise<SubjectActionResponse> {
  const response = await api.delete<SubjectActionResponse>(
    `/admin/subjects/${id}`
  );

  return response.data;
}