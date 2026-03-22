import AppointmentTable from "./AppointmentTable";

export default function AppointmentList() {
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-md">
        <div className="p-4">
          <h2 className="font-bold tracking-wide text-gray-900 text-xl">
            Current Appointments
          </h2>
        </div>

        <div className="overflow-x-auto">
          <AppointmentTable />
        </div>
      </div>
    </>
  );
}
