
import apiClient from "./client";

export type UserRole = "ADMIN" | "TEACHER";

export interface SessionUser {
  userId: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token?: string;
    user: AuthUser;
  };
}

export interface SessionResponse {
  success: boolean;
  user: SessionUser;
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );

    return response.data;
  },

  async getSession() {
    const response = await apiClient.get<SessionResponse>(
      "/auth-test/me"
    );

    return response.data;
  },

  async logout() {
    const response = await apiClient.post<ApiMessageResponse>(
      "/auth/logout"
    );

    return response.data;
  },

  async changePassword(payload: ChangePasswordPayload) {
    const response = await apiClient.patch<ApiMessageResponse>(
      "/auth/change-password",
      payload
    );

    return response.data;
  },
};
