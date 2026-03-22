"use client";

import { getUser, googleLogin, login } from "@/api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useCallback, useEffect, useState } from "react";

export interface LoginForm {
  email: string;
  password: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (r: { credential: string }) => void;
          }) => void;

          prompt: () => void;
        };
      };
    };
  }
}

export default function useAuth() {
  const router = useRouter();
  const qc = useQueryClient();

  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const handleChange = (
    key: keyof LoginForm,
    value: LoginForm[keyof LoginForm],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const populateUser = async () => {
    const data = await getUser();

    qc.setQueryData(["user"], data);
  };

  // --- --- mutation --- ---
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await populateUser();

      router.push("/");
    },
  });

  const googleMutation = useMutation({
    mutationFn: googleLogin,
    onSuccess: async () => {
      await populateUser();

      router.push("/");
    },
  });

  // --- --- action --- ---
  const handleLogin = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleCredentialResponse = useCallback(
    (response: { credential: string }) => {
      googleMutation.mutateAsync({
        idToken: response.credential,
      });
    },
    [],
  );

  let promptOpen = false;

  const handleGoogleLogin = () => {
    if (promptOpen) return;

    promptOpen = true;
    window.google.accounts.id.prompt();

    setTimeout(() => {
      promptOpen = false;
    }, 4000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
        });

        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [handleCredentialResponse]);

  return {
    formData,

    handleChange,
    handleLogin,
    handleGoogleLogin,

    isLoading: loginMutation.isPending || googleMutation.isPending,
  };
}
