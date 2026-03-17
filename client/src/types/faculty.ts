export interface FacultyProfile {
  user_id: number;
  name: string;
  email: string;
  designation: string;
  office: string;
  employee_id: string;
  department_name: string | null;
  keywords: string[];
}

export interface FacultyStats {
  total: number;
  pending: number;
  confirmed: number;
  declined: number;
  completed: number;
}

export interface Appointment {
  id: number;
  student_id: number;
  student_name: string;
  professor_id: number;
  professor_name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS format from backend, or formatted string
  purpose: string;
  description: string;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
  rejection_reason?: string | null;
}

export type SlotType = 'available' | 'busy';

export interface AvailabilitySlot {
  id: number;
  professor_id: number;
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  title?: string | null;
  slot_type: SlotType;
}

export interface TimetableEntry {
  id: number;
  professor_id: number;
  day_of_week: number; // 0=Monday, 6=Sunday
  hour: number;
  subject: string;
}

export interface TimetableExemption {
  id: number;
  professor_id: number;
  date: string; // YYYY-MM-DD
  hour: number;
}
