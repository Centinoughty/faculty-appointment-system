"use client";

import useUser from "@/hooks/useUser";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role === "faculty") {
      router.replace("/dashboard");
    } else {
      router.replace("/student");
    }
  }, [user, isLoading, router]);

  return null;
}
