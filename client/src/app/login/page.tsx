"use client";

import Google from "@/components/ui/Google";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const { loginWithGoogle } = useAuth();
  const { user, loading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.replace("/dashboard/student");
    }
  }, [user, loading, router]);

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Sign in to FAMS
            </h1>
            <p className="text-gray-500 text-sm">
              Faculty Appointment Management System • NITC
            </p>
          </div>

          <Button
            onClick={loginWithGoogle}
            disabled={loading}
            className="w-full py-6 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg flex items-center justify-center gap-3 transition-all"
          >
            <Google className="w-5 h-5" />
            <span className="font-semibold text-base">
              {loading ? "Signing in..." : "Continue with Google"}
            </span>
          </Button>

          <p className="text-xs text-gray-400 mt-4">
            Only NITC Institute accounts are supported for initial registration
          </p>
        </CardContent>
      </Card>

      <p className="mt-8 text-gray-400 text-xs font-medium uppercase tracking-wider">
        © 2026 NIT Calicut • v1.0
      </p>
    </main>
  );
}
