"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/store/hooks";
import Google from "@/components/ui/Google";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, restoreSession, handleGoogleCallback } = useAuth();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      toast.info(data.message || "Reset link sent if the email exists.");
      setIsForgotModalOpen(false);
    } catch (err) {
      toast.error("Failed to request password reset.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  useEffect(() => {
    if (window.location.hash) {
      handleGoogleCallback(window.location.hash);
      window.history.replaceState(null, "", window.location.pathname);
    }
    restoreSession();
  }, [restoreSession, handleGoogleCallback]);

  useEffect(() => {
    if (user) {
      if (user.first_login) {
        router.replace("/setup-password");
      } else if (user.role === "student") {
        router.replace("/dashboard/student");
      } else if (user.role === "faculty") {
        router.replace("/dashboard/faculty");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, router]);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const result = await loginWithEmail({ email, password });
    if (!result.success) {
      setFormError(result.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#f8fafc] overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60 animate-pulse delay-700"></div>

      <Card className="z-10 w-full max-w-md p-8 sm:p-10 shadow-2xl border-none bg-white/80 backdrop-blur-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-6 transform rotate-3">
            <span className="text-2xl font-black text-white -rotate-3 uppercase tracking-tighter">FA</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 mt-2 font-medium">Log in to manage your appointments</p>
        </div>

        {(error || formError) && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm font-semibold text-red-600 text-center">{error || formError}</p>
          </div>
        )}

        <form onSubmit={handleManualLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Email Address</label>
            <Input
              type="email"
              placeholder="e.g. name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all"
              required
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest mt-4">Password</label>
                <button type="button" onClick={() => setIsForgotModalOpen(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 tracking-widest mt-4 uppercase">
                    Forgot?
                </button>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/80 px-4 text-gray-400 font-bold tracking-widest">Or continue with</span>
          </div>
        </div>

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md active:bg-gray-100 disabled:opacity-70"
        >
          <Google className="w-5 h-5" />
          <span>Sign in with Google</span>
        </button>

        <p className="mt-10 text-center text-sm text-gray-400 font-medium">
          © 2026 Faculty Appointment System
        </p>
      </Card>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsForgotModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reset Password</h3>
            <p className="text-sm text-slate-500 mb-4">Enter your email address to receive a password reset link.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@nitc.ac.in"
                className="w-full h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="ghost" onClick={() => setIsForgotModalOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={isForgotLoading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl min-w-[100px]">
                  {isForgotLoading ? "Sending..." : "Send Link"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
