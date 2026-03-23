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

  setBusyStatus: (busy: boolean) => 
    api.put(`faculty/mark-${busy ? 'busy' : 'available'}`),

  // Appointments
  getAppointments: async () => {
    // Combines pending and approved appointments from backend
    const [pending, approved] = await Promise.all([
      api.get<Appointment[]>("faculty/appointments/pending"),
      api.get<Appointment[]>("faculty/appointments/approved")
    ]);
    return { data: [...pending.data, ...approved.data] };
  },
  
  getStats: () => api.get<FacultyStats>("faculty/stats"),
  
  updateAppointmentStatus: (id: number, status: string, rejection_reason?: string) => {
    if (status === "approved") {
      return api.put<Appointment>(`faculty/appointments/approve/${id}`);
    } else if (status === "rejected") {
      return api.put<Appointment>(`faculty/appointments/decline/${id}`);
    } else if (status === "no-show") {
      return api.put<Appointment>(`faculty/appointments/no-show/${id}`);
    }
    return Promise.reject(new Error(`Unknown status update: ${status}`));
  },
  
  cancelAppointment: (id: number) => 
    api.put(`faculty/appointments/cancel/${id}`),

  // Availability Slots
  getAvailability: () => api.get<AvailabilitySlot[]>("faculty/appointments/blocked"), // mapped to blocked slots
  
  createAvailability: (data: { date: string; hour: number; title: string; slot_type: string }) => {
    const endHour = data.hour + 1;
    const start_time = `${String(data.hour).padStart(2, '0')}:00`;
    const end_time = `${String(endHour).padStart(2, '0')}:00`;
    return api.post<AvailabilitySlot>("faculty/mark-unavailable", { 
      date: data.date, 
      start_time, 
      end_time, 
      purpose: data.title 
    });
  },
  
  deleteAvailability: (id: number) => 
    api.delete(`faculty/appointments/blocked/${id}`),

  // Timetable
  getTimetable: () => api.get<TimetableEntry[]>("faculty/timetable"),
  
  saveTimetable: (entries: { day_of_week: number; hour: number; subject: string }[]) => 
    api.post<TimetableEntry[]>("faculty/timetable", { entries }),

  uploadTimetable: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("faculty/timetable/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Exemptions
  getExemptions: () => Promise.resolve({ data: [] as TimetableExemption[] }),
  
  createExemption: (data: { date: string; hour: number }) => 
    Promise.resolve({ data: {} as TimetableExemption }),
  
  deleteExemption: (id: number) => 
    Promise.resolve({ data: { success: true } }),
};
