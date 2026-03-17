import { api } from "./axios";
import {
  FacultyProfile,
  FacultyStats,
  Appointment,
  AvailabilitySlot,
  TimetableEntry,
  TimetableExemption,
} from "@/types/faculty";

export const facultyApi = {
  // Profile
  getProfile: () => api.get<FacultyProfile>("faculty/profile"),
  
  updateProfile: (data: Partial<FacultyProfile>) => 
    api.put<FacultyProfile>("faculty/profile", data),

  // Appointments
  getAppointments: () => api.get<Appointment[]>("faculty/appointments"),
  
  getStats: () => api.get<FacultyStats>("faculty/stats"),
  
  updateAppointmentStatus: (id: number, status: string, rejection_reason?: string) => 
    api.patch<Appointment>(`faculty/appointments/${id}/status`, { status, rejection_reason }),
  
  cancelAppointment: (id: number) => 
    api.delete(`faculty/appointments/${id}`),

  // Availability Slots
  getAvailability: () => api.get<AvailabilitySlot[]>("faculty/availability"),
  
  createAvailability: (data: { date: string; hour: number; title: string; slot_type: string }) => 
    api.post<AvailabilitySlot>("faculty/availability", data),
  
  deleteAvailability: (id: number) => 
    api.delete(`faculty/availability/${id}`),

  // Timetable
  getTimetable: () => api.get<TimetableEntry[]>("faculty/timetable"),
  
  saveTimetable: (entries: { day_of_week: number; hour: number; subject: string }[]) => 
    api.post<TimetableEntry[]>("faculty/timetable", { entries }),

  // Exemptions
  getExemptions: () => api.get<TimetableExemption[]>("faculty/timetable/exemptions"),
  
  createExemption: (data: { date: string; hour: number }) => 
    api.post<TimetableExemption>("faculty/timetable/exemptions", data),
  
  deleteExemption: (id: number) => 
    api.delete(`faculty/timetable/exemptions/${id}`),
};
