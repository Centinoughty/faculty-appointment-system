import { api } from "./axios";
import { StudentStats, Professor, Appointment } from "@/types/student";

export const studentApi = {
  getStats: () => api.get<StudentStats>("student/stats"),
  
  getFaculty: () => api.get<Professor[]>("student/faculty"),
  
  getMyRequests: () => api.get<Appointment[]>("student/my-requests"),
  
  bookAppointment: (data: { 
    professor_id: number; 
    date: string; 
    time: string; 
    purpose: string; 
    description: string 
  }) => api.post("student/appointments", data),

  getMe: () => api.get("auth/me"),

  cancelAppointment: (id: number) => api.delete(`student/appointments/${id}`),

  updateProfile: (data: { name?: string; phone?: string; semester?: string }) => 
    api.put("student/profile", data),
  getAvailableSlots: (professor_id: number, date: string) => 
    api.get<string[]>(`student/faculty/${professor_id}/slots`, { params: { date } }),
};
