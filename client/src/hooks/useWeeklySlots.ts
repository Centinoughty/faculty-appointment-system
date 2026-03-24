"use client";

import { getFacultySlots } from "@/api/faculty";
import { useQuery } from "@tanstack/react-query";
import useUser from "./useUser";

function generateWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

export default function useWeeklySlots(weekStart: Date) {
  const { user } = useUser();
  const facultyId = user?.id;

  const weekDays = generateWeekDays(weekStart);

  // one query per day, all run in parallel
  const queries = weekDays.map((day) =>
    useQuery({
      queryKey: ["available-slots", facultyId, day.toDateString()],
      queryFn: () =>
        getFacultySlots({ facultyId: Number(facultyId), date: day }),
      enabled: !!facultyId,
      staleTime: 0,
    }),
  );

  // map dateString → string[]
  const slotsByDay: Record<string, string[]> = {};
  weekDays.forEach((day, i) => {
    slotsByDay[day.toDateString()] = queries[i].data ?? [];
  });

  const isLoading = queries.some((q) => q.isLoading);

  return { slotsByDay, isLoading };
}
