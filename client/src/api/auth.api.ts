import { Role } from "@/types/auth";
import { api } from "./axios";

export interface AuthUser {
  email: string;
  role: Role;
  name?: string;
  roll_number?: string;
  department_name?: string;
  program?: string;
  semester?: string;
  profile_picture?: string;
  phone?: string;
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
