"use client";

import FacultySettings from "@/components/faculty/FacultySettings";
import StudentSettings from "@/components/student/StudentSettings";
import useUser from "@/hooks/useUser";

export default function DashboardPage() {
  const { user } = useUser();

  if (user.role === "faculty") {
    return <FacultySettings />;
  }

  // return <FacultySettings />;
  return <StudentSettings />;
}
