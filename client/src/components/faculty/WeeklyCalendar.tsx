"use client";

import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Appointment } from "@/types/appointment";
import useWeeklySlots from "@/hooks/useWeeklySlots";
import useBlockSlot from "@/hooks/useBookSlot";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-blue text-white",
  pending: "bg-orange-400 text-white",
  rejected: "bg-red-400 text-white",
  cancelled: "bg-gray-300 text-gray-600",
  noshow: "bg-red-200 text-red-700",
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

// Generate all 30-min slots 09:00–17:00
function generateAllSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h < 17; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

const ALL_SLOTS = generateAllSlots();

interface BlockPopoverProps {
  slot: string;
  date: Date;
  onBlock: () => void;
  onClose: () => void;
  isBlocking: boolean;
}

function BlockPopover({
  slot,
  date,
  onBlock,
  onClose,
  isBlocking,
}: BlockPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, onClose);

  return (
    <div
      ref={ref}
      className="absolute z-20 top-full mt-1 left-0 bg-white rounded-xl border border-gray-100 shadow-xl p-3 w-44"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-800">{slot}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={12} />
        </button>
      </div>
      <p className="text-[10px] text-gray-400 mb-3">
        {date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      </p>
      <button
        type="button"
        disabled={isBlocking}
        onClick={onBlock}
        className="w-full py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        {isBlocking ? "Blocking..." : "Block this slot"}
      </button>
    </div>
  );
}

export default function WeeklyCalendar({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [popover, setPopover] = useState<{ day: string; slot: string } | null>(
    null,
  );

  const { blockSlot, isBlocking } = useBlockSlot();

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { slotsByDay } = useWeeklySlots(weekStart);

  // appointments grouped by day
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

  // appointments grouped by day+slot for quick lookup
  const apptsByDaySlot = useMemo(() => {
    const map: Record<string, Appointment> = {};
    appointments.forEach((a) => {
      const key = `${new Date(a.date).toDateString()}-${a.startTime}`;
      map[key] = a;
    });
    return map;
  }, [appointments]);

  const rangeLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${addDays(weekStart, 6).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const handleSlotClick = (day: Date, slot: string) => {
    const key = `${day.toDateString()}-${slot}`;
    // only allow blocking free slots
    if (!apptsByDaySlot[key]) {
      setPopover({ day: day.toDateString(), slot });
    }
  };

  const handleBlock = (day: Date, slot: string) => {
    blockSlot(day, slot);
    setPopover(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={17} className="text-blue" />
          <h2 className="font-bold text-gray-900">Weekly Schedule</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setWeekStart((w) => addDays(w, -7));
              setPopover(null);
            }}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-600">
            {rangeLabel}
          </span>
          <button
            onClick={() => {
              setWeekStart((w) => addDays(w, 7));
              setPopover(null);
            }}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-175">
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-1 mb-1">
            {/* Time column header */}
            <div className="text-xs font-semibold text-gray-300 py-1 text-center">
              TIME
            </div>
            {weekDays.map((day, i) => {
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div
                  key={i}
                  className={`text-center py-1 ${isToday ? "text-blue" : "text-gray-400"}`}
                >
                  <p className="text-[10px] font-semibold">{DAY_LABELS[i]}</p>
                  <p
                    className={`text-sm font-bold ${isToday ? "text-blue" : "text-gray-700"}`}
                  >
                    {day.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Slot rows */}
          {ALL_SLOTS.map((slot) => (
            <div key={slot} className="grid grid-cols-8 gap-1 mb-0.5">
              {/* Time label */}
              <div className="text-[10px] text-gray-400 font-medium flex items-center justify-center">
                {slot}
              </div>

              {/* Day cells */}
              {weekDays.map((day) => {
                const dayStr = day.toDateString();
                const apptKey = `${dayStr}-${slot}`;
                const appt = apptsByDaySlot[apptKey];
                const availableSlots = slotsByDay[dayStr] ?? [];
                const isAvailable = availableSlots.includes(slot);
                const isToday = dayStr === today.toDateString();
                const isPopoverOpen =
                  popover?.day === dayStr && popover?.slot === slot;

                return (
                  <div key={dayStr} className="relative">
                    {appt ? (
                      // Booked slot
                      <div
                        title={appt.purpose}
                        className={`h-7 rounded text-[9px] font-medium px-1 flex items-center truncate ${STATUS_COLORS[appt.status] ?? "bg-gray-200 text-gray-600"}`}
                      >
                        {appt.purpose}
                      </div>
                    ) : isAvailable ? (
                      // Free slot — clickable to block
                      <button
                        type="button"
                        onClick={() => handleSlotClick(day, slot)}
                        className={`w-full h-7 rounded text-[9px] font-medium transition-colors border ${
                          isToday
                            ? "border-blue/20 bg-blue/5 hover:bg-blue/10 text-blue/60"
                            : "border-gray-100 bg-gray-50 hover:bg-red-50 hover:border-red-200 text-gray-300 hover:text-red-400"
                        }`}
                      >
                        free
                      </button>
                    ) : (
                      // Blocked / unavailable slot
                      <div className="h-7 rounded bg-gray-100 border border-gray-100" />
                    )}

                    {/* Block popover */}
                    {isPopoverOpen && (
                      <BlockPopover
                        slot={slot}
                        date={day}
                        onClose={() => setPopover(null)}
                        onBlock={() => handleBlock(day, slot)}
                        isBlocking={isBlocking}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
