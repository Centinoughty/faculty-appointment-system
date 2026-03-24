"use client";

import {
  approveStatus,
  cancelStatus,
  declineStatus,
  noShowStatus,
} from "@/api/appointment";
import { Appointment } from "@/types/appointment";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useUpdateAppointmentStatus() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["faculty-appointment"] });
  };

  const approveMutation = useMutation({
    mutationFn: approveStatus,
    onSuccess: invalidate,
  });

  const declineMutation = useMutation({
    mutationFn: declineStatus,
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelStatus,
    onSuccess: invalidate,
  });

  const noShowMutation = useMutation({
    mutationFn: noShowStatus,
    onSuccess: invalidate,
  });

  const updateStatus = (id: number, status: Appointment["status"]) => {
    switch (status) {
      case "approved":
        return approveMutation.mutate({ id });
      case "rejected":
        return declineMutation.mutate({ id });
      case "cancelled":
        return cancelMutation.mutate({ id });
      case "noshow":
        return noShowMutation.mutate({ id });
    }
  };

  return {
    updateStatus,
    isUpdating:
      approveMutation.isPending ||
      declineMutation.isPending ||
      cancelMutation.isPending ||
      noShowMutation.isPending,
  };
}
