import useUser from "@/hooks/useUser";
import Title from "../ui/Title";
import AppointmentsList from "./AppointmentsList";
import WeeklyCalendar from "./WeeklyCalendar";
import useFacultyAppointment from "@/hooks/useFacultyAppointment";

export default function FacultyDashboard() {
  const { user } = useUser();
  const { appointments } = useFacultyAppointment();

  return (
    <>
      <div className="grow p-4 bg-[#f6f6f8]">
        <Title text={`Hi, ${user?.name}`} />

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 flex flex-col gap-5">
            <WeeklyCalendar appointments={appointments} />
          </div>

          <div className="xl:col-span-1 min-h-0">
            <AppointmentsList appointments={appointments} />
          </div>
        </div>
      </div>
    </>
  );
}
