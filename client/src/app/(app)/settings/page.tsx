import FacultyDashboard from "@/components/faculty/FacultyDashboard";
import StudentSettings from "@/components/student/StudentSettings";
import useUser from "@/hooks/useUser";

export default function DashboardPage() {
  // const { user } = useUser();

  // if (user.role === "faculty") {
  //   return <FacultyDashboard />;
  // }

  return <StudentSettings />;
}
