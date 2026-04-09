import { Role } from "@/types/auth";
import { api } from "./axios";

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  name?: string;
  roll_number?: string;
  department_name?: string;
  department?: string;
  program?: string;
  semester?: string;
  profile_picture?: string;
  picture?: string;
  phone?: string;
  busy?: boolean;
  first_login?: boolean;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await api.get("auth/me");

  return response.data;
}

export async function logoutApi() {
  await api.post("logout");
}

export async function verifyGoogleToken(token: string) {
  const response = await api.post("auth/google/login", { idToken: token });
  return response.data;
}

export async function setupPassword(new_password: string) {
  const response = await api.post("auth/set-password", { new_password });
  return response.data;
}

export async function loginWithEmail(credentials: any) {
  const response = await api.post("login", credentials);
  return response.data;
}
