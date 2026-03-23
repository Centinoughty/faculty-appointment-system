import { AppointmentForm } from "@/types/appointment";
import { api } from "./axios";

export async function getAppointment() {
  const { data } = await api.get("/appointment");
  return data;
}

export async function createAppointment(payload: AppointmentForm) {
  const { data } = await api.post("/appointment", payload);
  return data;
}
