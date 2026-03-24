import { Appointment, AppointmentForm } from "@/types/appointment";
import { api } from "./axios";

export async function getAppointment() {
  const { data } = await api.get("/appointment");
  return data;
}

export async function createAppointment(payload: AppointmentForm) {
  const { data } = await api.post("/appointment", payload);
  return data;
}

export async function getFacultyAppointment() {
  const { data } = await api.get("/faculty/appointment");
  return data;
}

export async function approveStatus({ id }: { id: number }): Promise<void> {
  await api.patch(`/appointment/${id}/approve`);
}

export async function declineStatus({ id }: { id: number }): Promise<void> {
  await api.patch(`/appointment/${id}/decline`);
}

export async function cancelStatus({ id }: { id: number }): Promise<void> {
  await api.patch(`/appointment/${id}/cancel`);
}

export async function noShowStatus({ id }: { id: number }): Promise<void> {
  await api.patch(`/appointment/${id}/no-show`);
}
