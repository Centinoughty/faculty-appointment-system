"use client";

import { fetchCurrentUser, loginWithEmail as loginWithEmailApi, logoutApi, verifyGoogleToken } from "@/api/auth.api";
import { useAppDispatch } from "@/store/hooks";
import {
  authStart,
  authSuccess,
  authFailure,
  logout,
} from "@/store/slices/auth.slice";
import { useCallback, useEffect } from "react";

export function useAuth() {
  const dispatch = useAppDispatch();

  const loginWithGoogle = useCallback(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      dispatch(authStart());

      const user = await fetchCurrentUser();

      dispatch(authSuccess(user));

      return { success: true };
    } catch (error: any) {
      dispatch(authFailure("Not authenticated"));

      return { success: false, message: "Not authenticated" };
    }
  }, [dispatch]);

  const signOut = useCallback(async () => {
    await logoutApi();
    dispatch(logout());
    window.location.href = "/login";
  }, [dispatch]);

  const handleGoogleCallback = useCallback(async (hash: string) => {
    try {
      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get("id_token");

      if (idToken) {
        dispatch(authStart());
        await verifyGoogleToken(idToken);
        const user = await fetchCurrentUser();
        dispatch(authSuccess(user));
        return { success: true };
      }
      return { success: false };
    } catch (error: any) {
      dispatch(authFailure(error.response?.data?.detail || "Google login failed"));
      return { success: false };
    }
  }, [dispatch]);

  const loginWithEmail = useCallback(async (credentials: any) => {
    try {
      dispatch(authStart());
      const user = await loginWithEmailApi(credentials);
      dispatch(authSuccess(user));
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.detail || "Login failed";
      dispatch(authFailure(message));
      return { success: false, message };
    }
  }, [dispatch]);

  return { loginWithGoogle, loginWithEmail, restoreSession, signOut, handleGoogleCallback };
}
