"use client";

import { fetchCurrentUser, logoutApi } from "@/api/auth.api";
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
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
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

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return { loginWithGoogle, restoreSession, signOut };
}
