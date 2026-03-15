"use client";

import AuthGuard from "@/components/AuthGuard";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPortal() {
  const { user, loading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "student") {
        router.replace("/dashboard/student");
      } else if (user.role === "professor") {
        router.replace("/dashboard/faculty");
      }
    }
  }, [user, loading, router]);

  return (
    <AuthGuard>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Redirecting to your dashboard...</p>
        </div>
      </div>
    </AuthGuard>
  );
}
