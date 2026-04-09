"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="text-blue-600 font-medium animate-pulse">
        Checking authentication...
      </div>
    </div>
  );
}
