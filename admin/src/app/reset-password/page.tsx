"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Loader2, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to reset password");
      
      toast.success(data.message);
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
      <div className="w-full max-w-[400px] border border-slate-200 bg-white p-8 shadow-sm rounded-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-slate-900 rounded-xl p-3 mb-4 shadow-sm">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset Password</h1>
          <p className="text-sm text-slate-500 text-center mt-2">Enter your new password below.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold tracking-tight text-slate-900">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold tracking-tight text-slate-900">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-mono"
            />
          </div>

          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center bg-[#2563eb] text-white hover:bg-blue-700 py-2.5 rounded-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] mt-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
          </button>

          <button type="button" className="w-full flex justify-center items-center gap-2 text-sm text-slate-500 hover:text-slate-900 font-semibold mt-4 transition-colors p-2" onClick={() => router.push("/login")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
