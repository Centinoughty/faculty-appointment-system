export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  picture: string;
  role: "faculty" | "student";

  faculty?: {
    department: { id: number; name: string };
  };

  student?: {
    rollNumber: string;
    department: { id: number; name: string };
  };
}

export interface UpdateProfile {
  phone: string;
  currentPassword: string;
  newPassword: string;
}
