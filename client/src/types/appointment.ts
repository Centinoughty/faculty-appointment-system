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

interface Booker {
  name: string;
  email: string;
}

export interface Appointment {
  id: number;
  faculty: Faculty;
  booker?: Booker;
  date: Date;
  startTime: string;
  purpose: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled"
    | "blocked"
    | "noshow";
}

export interface AppointmentForm {
  purpose: string;
  date: Date;
  description: string;
  facultyId: number;
  startTime: string;
}
