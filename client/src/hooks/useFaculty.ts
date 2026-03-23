"use client";

import { getFaculties } from "@/api/faculty";
import { Faculty } from "@/types/appointment";
import { useQuery } from "@tanstack/react-query";

const EMPTY_FACULTIES: Faculty[] = [];

export default function useFaculty() {
  const query = useQuery({
    queryKey: ["faculty"],
    queryFn: getFaculties,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const faculties: Faculty[] = query.data ?? EMPTY_FACULTIES;

  return {
    faculties,

    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
