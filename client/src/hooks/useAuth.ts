"use client";

import { useAppDispatch } from "@/store/hooks";
import {
  authStart,
  authSuccess,
  authFailure,
  logout,
} from "@/store/slices/auth.slice";
import { useCallback, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";

export function useAuth() {
  const dispatch = useAppDispatch();

  const loginWithGoogle = useCallback(async () => {
    try {
      dispatch(authStart());
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userData = {
        email: user.email || "",
        role: "student", // Default role for now
        displayName: user.displayName,
        photoURL: user.photoURL,
      };

      dispatch(authSuccess(userData as any));
    } catch (error: any) {
      console.error(error);
      dispatch(authFailure(error.message));
    }
  }, [dispatch]);

  const restoreSession = useCallback(() => {
    dispatch(authStart());
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          authSuccess({
            email: user.email || "",
            role: "student",
            displayName: user.displayName,
            photoURL: user.photoURL,
          } as any),
        );
      } else {
        dispatch(authFailure("No session"));
      }
    });
    return unsubscribe;
  }, [dispatch]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    dispatch(logout());
  }, [dispatch]);

  return { loginWithGoogle, restoreSession, signOut };
}
