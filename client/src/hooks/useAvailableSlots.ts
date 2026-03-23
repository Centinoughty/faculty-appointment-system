import { getFacultySlots } from "@/api/faculty";
import { useQuery } from "@tanstack/react-query";

const EMPTY_SLOTS: string[] = [];

export default function useAvailableSlots(facultyId: number, date: Date) {
  const numericId = Number(facultyId);

  const query = useQuery({
    queryKey: ["available-slots", numericId, date.toDateString()],
    queryFn: () => getFacultySlots({ facultyId: numericId, date }),
    enabled: !!numericId && numericId > 0 && !!date,
    staleTime: 0,
    retry: false,
  });

  const availableSlots: string[] = query.data ?? EMPTY_SLOTS;

  return {
    availableSlots,

    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
