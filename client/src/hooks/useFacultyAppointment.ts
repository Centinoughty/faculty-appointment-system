import { getFacultyAppointment } from "@/api/appointment";
import { Appointment } from "@/types/appointment";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const EMPTY_APPOINTMENT: Appointment[] = [];

export default function useFacultyAppointment() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["faculty-appointment"],
    queryFn: getFacultyAppointment,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const appointments: Appointment[] = query.data ?? EMPTY_APPOINTMENT;

  return {
    appointments,

    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
