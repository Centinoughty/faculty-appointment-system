import { getFacultySlots } from "@/api/faculty";
import { useQuery } from "@tanstack/react-query";

const EMPTY_SLOTS: string[] = ["9:00", "10:00", "11:00", "12:00"];

export default function useAvailableSlots(facultyId: string, date: Date) {
  const query = useQuery({
    queryKey: ["available-slots", facultyId, date.toDateString()],
    queryFn: () => getFacultySlots({ facultyId, date }),
    enabled: !!facultyId && !!date,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const availableSlots: string[] = query.data ?? EMPTY_SLOTS;

  return {
    availableSlots,

    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
