"use client";

import TableHead from "../ui/TableHead";
import TableCol from "../ui/TableCol";
import Image from "next/image";
import useAppointment from "@/hooks/useAppointment";

export default function AppointmentTable() {
  const { appointments, isLoading } = useAppointment();

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-t border-gray-100">
            <TableHead label="Faculty" />
            <TableHead label="Date & Time" />
            <TableHead label="Topic" />
            <TableHead label="Status" />
          </tr>
        </thead>

        <tbody>
          {appointments.map((app) => (
            <tr
              key={app.id}
              className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <TableCol>
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: "35px",
                      height: "35px",
                      position: "relative",
                    }}
                  >
                    {app.faculty.picture && (
                      <Image
                        src={app.faculty.picture}
                        alt="Picsum Template"
                        fill
                        sizes="(max-width: 1024px) 0px, 520px"
                        style={{ objectFit: "cover" }}
                        className="rounded-full"
                      />
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-gray-800">
                      {app.faculty.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {app.faculty.department.name}
                    </p>
                  </div>
                </div>
              </TableCol>

              <TableCol>
                {app.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCol>

              <TableCol>{app.topic}</TableCol>

              <TableCol>
                <span className={`px-3 py-1 rounded-full text-xs font-medium`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </TableCol>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
