export interface Faculty {
  id: string;
  name: string;
  department: string;
  keywords: string[];
  imageUrl?: string;
}

export interface TimeSlot {
  id: string;
  facultyId: string;
  startTime: string; // ISO string or simple time like "10:00 AM"
  endTime: string;
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
}

export interface AppointmentRequest {
  id: string;
  slotId: string;
  facultyId: string;
  studentId: string;
  purpose: string;
  description: string;
  status: "Pending" | "Confirmed" | "Declined" | "Cancelled";
  createdAt: string;
}
