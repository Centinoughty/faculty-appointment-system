"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAppSelector((state) => state.auth);

  const router = useRouter();

  useEffect(() => {
    if (!loading || !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <p>loading</p>;
  }

  return <>{children}</>;
}
