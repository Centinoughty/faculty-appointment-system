"use client";

import { blockSlot } from "@/api/faculty";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useBlockSlot() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: blockSlot,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["available-slots"] });
    },
  });

  return {
    blockSlot: (date: Date, slot: string) =>
      mutation.mutate({ date, startTime: slot }),
    isBlocking: mutation.isPending,
  };
}
