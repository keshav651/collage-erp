import api from "./client";

export interface PendingTeacher {
  id: string;
  name: string;
  email: string;
  status?: string;
  createdAt?: string;
}

export interface PendingTeachersResponse {
  success: boolean;
  message: string;
  data: PendingTeacher[];
}

export async function getPendingTeachers(): Promise<PendingTeachersResponse> {
  const response = await api.get<PendingTeachersResponse>(
    "/admin/teachers/pending"
  );

  return response.data;
}