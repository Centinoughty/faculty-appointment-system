"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-[400px] border border-slate-200 bg-white p-8 shadow-sm rounded-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-slate-900 rounded-lg p-2 mb-4">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset Password</h1>
          <p className="text-sm text-slate-500 text-center mt-2">Enter your new password below.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold tracking-tight text-slate-900">New Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold tracking-tight text-slate-900">Confirm Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white hover:bg-slate-800">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Reset Password"}
          </Button>

          <Button type="button" variant="ghost" className="w-full text-sm text-slate-500" onClick={() => router.push("/login")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
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
