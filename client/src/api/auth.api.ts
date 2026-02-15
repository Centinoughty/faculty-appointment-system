import { Role } from "@/types/auth";
import { api } from "./axios";

export interface AuthUser {
  email: string;
  role: Role;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await api.get("/auth/me");

  return response.data;
}

export async function logoutApi() {
  await api.post("/auth/logout");
}
