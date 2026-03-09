export interface Appointment {
  id: string;
  studentId: string;
  facultyName: string;
  purpose: string;
  date: string;
  time: string;
  location: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "COMPLETED"
    | "confirmed"
    | "pending"
    | "declined";
  imageUrl?: string;
  department?: string;
}

export interface StudentStats {
  upcomingMeetings: number;
  pendingRequests: number;
  completedMeetings: number;
}
