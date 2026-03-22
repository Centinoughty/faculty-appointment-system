import { api } from "./axios";

export async function getAppointment() {
  const { data } = await api.get("/appointment");
  return data;
}
