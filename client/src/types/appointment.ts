export interface Department {
  id: string;
  name: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: Department;
  picture: string;
}

export interface Appointment {
  id: string;
  faculty: Faculty;
  date: Date;
  topic: string;
  status: "pending" | "approved" | "rejected";
}

export interface AppointmentForm {
  topic: string;
  date: Date;
  description: string;
  facultyId: string;
}
