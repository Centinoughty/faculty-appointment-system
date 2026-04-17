"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function AuthGuard({ children, allowedRoles }: { children: ReactNode, allowedRoles?: string[] }) {
  const { user, loading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  
  // Attach silent socket bridge for all validated users
  useWebSocket();

  useEffect(() => {
    if (loading === false) {
      if (!user) {
        if (pathname !== "/login") {
            router.replace("/login");
        }
      } else if (user.first_login && pathname !== "/setup-password") {
        router.replace("/setup-password");
      } else if (!user.first_login && pathname === "/setup-password") {
        router.replace("/dashboard");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redir mismatched users to their proper home
        if (user.role === "student") {
          router.replace("/dashboard/student");
        } else if (user.role === "faculty") {
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
