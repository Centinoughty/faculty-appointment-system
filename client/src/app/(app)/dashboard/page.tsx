"use client";

import FacultyDashboard from "@/components/faculty/FacultyDashboard";
import StudentDashboard from "@/components/student/StudentDashboard";
import useUser from "@/hooks/useUser";

export default function DashboardPage() {
  const { user } = useUser();

  if (user.role === "faculty") {
    return <FacultyDashboard />;
  }

  // return <FacultyDashboard />;
  return <StudentDashboard />;
}
