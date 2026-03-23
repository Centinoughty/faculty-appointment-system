import Link from "next/link";
import AppointmentList from "../common/AppointmentList";
import { Plus } from "lucide-react";

export default function StudentDashboard() {
  return (
    <>
      <div className="grow p-4 bg-[#f6f6f8]">
        <AppointmentList />
      </div>

      <Link
        href="/appointment/new"
        className="px-4 py-2 mx-6 my-4 flex items-center gap-2 absolute bottom-4 right-4 bg-blue text-white shadow-md rounded-lg"
      >
        <Plus size={25} strokeWidth={3.5} />
        <span className="font-semibold tracking-wide">New Appointment</span>
      </Link>
    </>
  );
}
