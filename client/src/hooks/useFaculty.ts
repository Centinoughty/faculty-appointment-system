import { getFaculty } from "@/api/faculty";
import { Faculty } from "@/types/faculty";
import { useQuery } from "@tanstack/react-query";

export default function useFaculty() {
  const facultyQuery = useQuery({
    queryKey: ["faculty"],
    queryFn: getFaculty,
  });

  const faculty: Faculty = facultyQuery.data ?? null;

  return {
    faculty,

    isLoading: facultyQuery.isLoading,
    isError: facultyQuery.isError,
  };
}
