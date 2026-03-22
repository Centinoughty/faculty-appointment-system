import { getAppointment } from "@/api/appointment";
import { Appointment } from "@/types/appointment";
import { useQuery } from "@tanstack/react-query";

const EMPTY_APPOINTMENT: Appointment[] = [];

export default function useAppointment() {
  const query = useQuery({
    queryKey: ["appointment"],
    queryFn: getAppointment,
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
