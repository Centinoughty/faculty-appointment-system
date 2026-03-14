import AppointmentsPanel from "@/components/dashboard/AppointmentsPanel";
import DashboardStats from "@/components/dashboard/DashboardStats";
import WeeklySchedule from "@/components/dashboard/WeeklySchedule";
import Title from "@/components/ui/Title";

export default function FacultyPage() {
  return (
    <>
      <main className="p-4">
        <div className="mb-8">
          <Title text="Faculty Dashboard">
            <p className="text-gray-500">
              Welcome back, {"John Doe"}. You have {"3"} appointments scheduled
              for today.
            </p>
          </Title>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <WeeklySchedule />

            <DashboardStats />
          </div>

          <div className="lg:col-span-1">
            <AppointmentsPanel />
          </div>
        </div>
      </main>
    </>
  );
}
