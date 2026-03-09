"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Explicitly redirect to the student dashboard
    router.replace("/dashboard/student");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="text-blue-600 font-medium animate-pulse">
        Loading Student Dashboard...
      </div>
    </div>
  );
}
