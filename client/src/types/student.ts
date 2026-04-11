export interface Faculty {
  user_id: number;
  name: string;
  designation: string;
  office: string;
  research_interests: string[]; // Our new backend sends this as a list
  department_name: string;
  busy: boolean;
}

export interface Appointment {
  id: number;
  faculty_id: number;
  faculty_name: string;
  date: string; // ISO format
  time: string;
  purpose: string;
  description: string;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled';
}

export interface StudentStats {
  pending: number;
  confirmed: number;
  completed: number;
}
