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
      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="h-40 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30 shadow-2xl">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-3xl font-black text-blue-600">F</span>
            </div>
          </div>
        </div>
        <CardContent className="p-10 text-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed">
            Faculty Appointment Management System. Sign in to your account to
            continue.
          </p>

          <Button
            onClick={loginWithGoogle}
            disabled={loading}
            className="w-full py-7 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-100 hover:border-blue-100 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-lg shadow-gray-100 group"
          >
            <Google className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-lg">
              {loading ? "Signing in..." : "Continue with Google"}
            </p>
          </Button>

          <p className="mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest px-8">
            Only NITC Institute accounts are supported for initial registration
          </p>
        </CardContent>
      </Card>

      <div className="mt-10 flex items-center gap-4 text-gray-400">
        <div className="h-px w-8 bg-gray-200"></div>
        <p className="text-xs font-bold uppercase tracking-tighter">
          NITC FAMS • v1.0
        </p>
        <div className="h-px w-8 bg-gray-200"></div>
      </div>
    </main>
  );
}
