"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/store/hooks";

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { restoreSession } = useAuth();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Only restore if we don't have a user yet
    // This runs once when the app/layout mounts
    restoreSession();
  }, []); // Explicitly empty array to run only once ONCE on app load

  return <>{children}</>;
}
