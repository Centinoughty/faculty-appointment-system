export interface User {
  name: string;
  email: string;
  phone: string | null;
  rollNo: string;
  picture: string;
  role: "faculty" | "student";
}
