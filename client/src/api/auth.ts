import { LoginForm } from "@/hooks/useAuth";
import { api } from "./axios";

export async function login(payload: LoginForm) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function googleLogin(payload: { idToken: string }) {
  const { data } = await api.post("/auth/google", payload);
  return data;
}

export async function getUser() {
  const { data } = await api.get("/auth/me");
  return data;
}
