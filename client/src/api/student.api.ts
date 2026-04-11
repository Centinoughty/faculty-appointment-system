import { api } from "./axios";
import { StudentStats, Faculty, Appointment } from "@/types/student";

export const studentApi = {
  getStats: () => api.get<StudentStats>("student/stats"),
  
  getFaculty: () => api.get<Faculty[]>("student/faculty"),
  
  getMyRequests: () => api.get<Appointment[]>("student/appointments"),
  
  bookAppointment: (data: { 
    faculty_id: number; 
    date: string; 
    time: string; 
    purpose: string; 
    description: string 
  }) => {
    // calculate end_time (+30 mins)
    const [hours, minutes] = data.time.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(hours, minutes + 30);
    const end_time = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
    
    return api.post("student/faculty/book-appointment", {
      faculty_id: data.faculty_id,
      date: data.date,
      start_time: data.time,
      end_time,
      purpose: data.purpose,
      description: data.description
    });
  },

  getMe: () => api.get("auth/me"),

  cancelAppointment: (id: number) => api.delete(`student/appointments/${id}`),

  updateProfile: (data: { name?: string; phone?: string; semester?: string }) => 
    api.put("student/profile", data),
    
  getAvailableSlots: (faculty_id: number, date: string) => 
    api.get<string[]>(`student/faculty/${faculty_id}/available-slots`, { params: { date } }),
};
