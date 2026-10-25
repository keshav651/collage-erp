
import api from "./client";

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER";
  status: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}

export async function loginUser(
  credentials: LoginInput
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
}


export async function googleLogin(credential: string) {
  const response = await api.post("/auth/google", {
    credential,
  });

  return response.data;
}


export async function logoutUser(): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await api.post("/auth/logout");
  return response.data;
}



export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}
