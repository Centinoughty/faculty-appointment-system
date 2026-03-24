"use client";

import { useState } from "react";
import { Appointment } from "@/types/appointment";
import AppointmentCard from "./AppointmentCard";

type Filter = "today" | "week" | "approved" | "pending" | "rejected";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "Today", value: "today" },
  { label: "Week", value: "week" },
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
];

function filterAppointments(appointments: Appointment[], filter: Filter) {
  const now = new Date();
  const todayStr = now.toDateString();

  const weekStart = new Date(now);
  weekStart.setDate(
    now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1),
  );
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  switch (filter) {
    case "today":
      return appointments.filter(
        (a) => new Date(a.date).toDateString() === todayStr,
      );
    case "week":
      return appointments.filter((a) => {
        const d = new Date(a.date);
        return d >= weekStart && d <= weekEnd;
      });
    default:
      return appointments.filter((a) => a.status === filter);
  }
}

interface Props {
  appointments: Appointment[];
  onMarkNoShow?: (id: number) => void;
  isMarkingNoShow?: boolean;
}

export default function AppointmentsList({
  appointments,
  onMarkNoShow,
  isMarkingNoShow,
}: Props) {
  const [filter, setFilter] = useState<Filter>("today");
  const filtered = filterAppointments(appointments, filter);

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-full">
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Appointments</h2>
        <div className="flex gap-1 mt-3 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === f.value
                  ? "bg-blue text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No appointments for this filter.
          </p>
        ) : (
          filtered.map((appt) => (
            <AppointmentCard key={appt.id} appointment={appt} />
          ))
        )}
      </div>
    </div>
  );
}
