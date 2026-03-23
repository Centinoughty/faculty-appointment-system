"use client";

import FacultyLayout from "@/components/faculty/FacultyLayout";
import StudentLayout from "@/components/student/StudentLayout";
import useUser from "@/hooks/useUser";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useUser();

  if (isLoading) return <p>Loading</p>;

  if (user?.role === "faculty") {
    return <FacultyLayout>{children}</FacultyLayout>;
  }

  return <StudentLayout>{children}</StudentLayout>;
}
