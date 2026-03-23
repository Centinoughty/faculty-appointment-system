"use client";

import { Faculty } from "@/types/appointment";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const EMPTY_FACULTIES: Faculty[] = [];

export default function useSearch() {
  const qc = useQueryClient();

  const [query, setQuery] = useState<string>("");

  const trimmed = query.trim();

  const faculties = qc.getQueryData<Faculty[]>(["faculty"]) ?? EMPTY_FACULTIES;

  const filteredFaculties = useMemo(() => {
    if (trimmed.length < 2) return [];

    return faculties.filter(
      (f) =>
        f.name.toLowerCase().includes(trimmed.toLowerCase()) ||
        f.department.name.toLowerCase().includes(trimmed.toLowerCase()),
    );
  }, [faculties, trimmed]);

  return {
    query,
    setQuery,

    faculties: filteredFaculties,

    isLoading: false,
    hasQuery: trimmed.length >= 2,
  };
}
