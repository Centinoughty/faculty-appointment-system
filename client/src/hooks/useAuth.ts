"use client";

import { login, loginWithGoogle } from "@/store/actions/authAction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ChangeEvent, SyntheticEvent, useState } from "react";

export default function useAuth() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = await login(formData.email, formData.password)(dispatch);

    if (result?.success) {
      console.log("Login successful");
    }

    setFormData({
      email: "",
      password: "",
    });
  };

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle()(dispatch);

    if (result?.success) {
      console.log("Login successful");
    }
  };

  return {
    formData,

    handleChange,
    handleLogin,
    handleGoogleLogin,

    isLoading,
    error,
  };
}
