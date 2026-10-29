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

export interface Branch {
  id: string;
  name: string;
  codePrefix: string;
}

export interface BranchesResponse {
  success: boolean;
  count: number;
  data: Branch[];
}

export async function getAllBranches(): Promise<BranchesResponse> {
  const response = await api.get<BranchesResponse>("/admin/branches");

  return response.data;
}

export interface CreateBranchPayload {
  name: string;
  codePrefix: string;
}

export interface CreateBranchResponse {
  success: boolean;
  message: string;
  data: Branch;
}

export async function createBranch(
  payload: CreateBranchPayload
): Promise<CreateBranchResponse> {
  const response = await api.post<CreateBranchResponse>(
    "/admin/branches",
    payload
  );

  return response.data;
}


export interface Teacher {
  id: string;
  userId: string;
  teacherCode: string;
  name: string;
  branchId: string;
  user: {
    email: string;
    emailVerified: boolean;
    status: string;
  };
  branch: {
    name: string;
    codePrefix: string;
  };
}

export interface TeachersResponse {
  success: boolean;
  message: string;
  count: number;
  data: Teacher[];
}

export async function getAllTeachers(): Promise<TeachersResponse> {
  const response = await api.get<TeachersResponse>("/admin/teachers");

  return response.data;
}


export interface ApproveTeacherPayload {
  branchId: string;
  semesterId: string;
  subjectIds: string[];
  academicYear: string;
}

export interface ApproveTeacherResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    userId?: string;
    name?: string;
    email?: string;
    teacherCode?: string;
    branchId?: string;
    temporaryPassword?: string;
  };
}

export async function approveTeacher(
  userId: string,
  payload: ApproveTeacherPayload
): Promise<ApproveTeacherResponse> {
  const response = await api.patch<ApproveTeacherResponse>(
    `/admin/teachers/${userId}/approve`,
    payload
  );

  return response.data;

}

  export interface UpdateTeacherPayload {
    name?: string;
    branchId?: string;
    status?: "ACTIVE" | "INACTIVE";
    password?: string;
  }

  export interface UpdateTeacherResponse {
    success: boolean;
    message: string;
    data: Teacher;
  }

  export async function updateTeacher(
    userId: string,
    payload: UpdateTeacherPayload
  ): Promise<UpdateTeacherResponse> {
    const response = await api.patch<UpdateTeacherResponse>(
      `/admin/teachers/${userId}`,
      payload
    );

    return response.data;
  }

  export interface DeleteTeacherResponse {
    success: boolean;
    message: string;
  }

  export async function deactivateTeacher(
    userId: string
  ): Promise<DeleteTeacherResponse> {
    const response = await api.delete<DeleteTeacherResponse>(
      `/admin/teachers/${userId}`
    );

    return response.data;
  }