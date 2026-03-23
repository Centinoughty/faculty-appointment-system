"use client";

import { getUser } from "@/api/auth";
import { User } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

export default function useUser() {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: getUser,

    staleTime: 5 * 60 * 1000,
    retry: 1,
    retryDelay: 500,
    refetchOnWindowFocus: false,
  });

  const user: User = query.data;

  return {
    user,

    isLoading: query.isLoading,
  };
}
