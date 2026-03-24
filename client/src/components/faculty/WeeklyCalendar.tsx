"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { Appointment } from "@/types/appointment";

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-blue text-white",
  pending: "bg-orange-400 text-white",
  rejected: "bg-red-400 text-white",
};

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function WeeklyCalendar({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const apptsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    weekDays.forEach((d) => {
      map[d.toDateString()] = [];
    });
    appointments.forEach((a) => {
      const key = new Date(a.date).toDateString();
      if (map[key]) map[key].push(a);
    });
    return map;
  }, [appointments, weekDays]);

  const rangeLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${addDays(weekStart, 6).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={17} className="text-blue" />
          <h2 className="font-bold text-gray-900">Weekly Schedule</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((w) => addDays(w, -7))}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-600">
            {rangeLabel}
          </span>
          <button
            onClick={() => setWeekStart((w) => addDays(w, 7))}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-semibold text-gray-400 py-1"
          >
            {label}
          </div>
        ))}

        {weekDays.map((day) => {
          const isToday = day.toDateString() === today.toDateString();
          const dayAppts = apptsByDay[day.toDateString()] ?? [];

          return (
            <div
              key={day.toDateString()}
              className={`min-h-24 rounded-lg p-1.5 flex flex-col gap-1 ${
                isToday
                  ? "border-2 border-blue bg-blue/5"
                  : "border border-gray-100"
              }`}
            >
              <span
                className={`text-xs font-bold ${isToday ? "text-blue" : "text-gray-500"}`}
              >
                {day.getDate()}
              </span>
              {dayAppts.map((a) => (
                <div
                  key={a.id}
                  title={a.purpose}
                  className={`text-[10px] font-medium px-1 py-0.5 rounded truncate ${STATUS_COLORS[a.status] ?? "bg-gray-200 text-gray-600"}`}
                >
                  {a.purpose}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
