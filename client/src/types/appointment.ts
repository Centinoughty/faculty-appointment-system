export interface Appointment {
  id: string;
  faculty: {
    id: string;
    name: string;
    email: string;
    picture: string;
  };
  department: string;
  date: Date;
  topic: string;
  status: "pending" | "approved" | "rejected";
}
