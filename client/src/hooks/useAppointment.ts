"use client";

import { createAppointment, getAppointment } from "@/api/appointment";
import { Appointment, AppointmentForm } from "@/types/appointment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const EMPTY_APPOINTMENT: Appointment[] = [];

const initialValue = (facultyId?: number): AppointmentForm => ({
  purpose: "",
  description: "",
  date: new Date(Date.now()),
  facultyId: facultyId ?? 0,
  startTime: "",
});

export default function useAppointment(initialFacultyId?: number) {
  const qc = useQueryClient();

  const [formData, setFormData] = useState<AppointmentForm>(
    initialValue(initialFacultyId),
  );

  useEffect(() => {
    if (initialFacultyId) {
      setFormData(initialValue(initialFacultyId));
    }
  }, [initialFacultyId]);

  const handleChange = (
    key: keyof AppointmentForm,
    value: AppointmentForm[keyof AppointmentForm],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData(initialValue(initialFacultyId));
  };

  const query = useQuery({
    queryKey: ["appointment"],
    queryFn: getAppointment,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const appointments: Appointment[] = query.data ?? EMPTY_APPOINTMENT;

  // --- --- mutation --- ---
  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointment"] });
      // resetForm();
    },
  });

  // --- --- actions --- ---
  const createItem = () => {
    createMutation.mutate(formData);
  };

  return {
    formData,
    handleChange,
    resetForm,

    appointments,

    createItem,
    isCreating: createMutation.isPending,

    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
