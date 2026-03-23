export interface User {
  name: string;
  email: string;
  phone: string | null;
  rollNumber: string;
  picture: string;
  role: "faculty" | "student";
}

export interface UpdateProfile {
  phone: string;
  currentPassword: string;
  newPassword: string;
}
