export interface Department {
  id: number;
  name: string;
}

export interface Faculty {
  id: number;
  name: string;
  email: string;
  department: Department;
  picture: string;
}

export interface Appointment {
  id: number;
  faculty: Faculty;
  date: Date;
  topic: string;
  status: "pending" | "approved" | "rejected";
}

export interface AppointmentForm {
  purpose: string;
  date: Date;
  description: string;
  facultyId: number;
}
