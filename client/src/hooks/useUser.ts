"use client";

import { getUser, updateProfile } from "@/api/auth";
import { UpdateProfile, User } from "@/types/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

const initialValue: UpdateProfile = {
  phone: "",
  currentPassword: "",
  newPassword: "",
};

export default function useUser() {
  const [formData, setFormData] = useState<UpdateProfile>(initialValue);

  const handleChange = (
    key: keyof UpdateProfile,
    value: UpdateProfile[keyof UpdateProfile],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const query = useQuery({
    queryKey: ["user"],
    queryFn: getUser,

    staleTime: 5 * 60 * 1000,
    retry: 1,
    retryDelay: 500,
    refetchOnWindowFocus: false,
  });

  const user: User = query.data;

  const resetForm = () => {
    setFormData(initialValue);
  };

  // --- --- mutation --- ---
  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {},
  });

  // --- --- actions --- ---
  const updateItem = () => {
    updateMutation.mutate(formData);
  };

  return {
    formData,
    handleChange,

    user,
    resetForm,

    updateItem,
    isUpdating: updateMutation.isPending,

    isLoading: query.isLoading,
  };
}
