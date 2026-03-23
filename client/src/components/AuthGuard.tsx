"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function AuthGuard({ children, allowedRoles }: { children: ReactNode, allowedRoles?: string[] }) {
  const { user, loading } = useAppSelector((state) => state.auth);

  const router = useRouter();

  useEffect(() => {
    if (loading === false) {
      if (!user) {
        router.replace("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redir mismatched users to their proper home
        if (user.role === "student") {
          router.replace("/dashboard/student");
        } else if (user.role === "faculty" || user.role === "professor") {
          router.replace("/dashboard/faculty");
        } else {
          router.replace("/dashboard");
        }
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || !user) {
    return <p className="p-8 text-center text-gray-500 animate-pulse">Loading Identity...</p>;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <p className="p-8 text-center text-gray-500 animate-pulse">Checking Access Rights...</p>;
  }

  return <>{children}</>;
}
