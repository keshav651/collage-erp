import api from "./client";

export interface Semester {
  id: string;
  number: number;
}

export interface SemestersResponse {
  success: boolean;
  count: number;
  data: Semester[];
}

export async function getSemesters(): Promise<SemestersResponse> {
  const response = await api.get<SemestersResponse>(
    "/admin/semesters"
  );

  return response.data;
}