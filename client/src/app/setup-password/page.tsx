"use client";

import { useState } from "react";
import { setupPassword, fetchCurrentUser } from "@/api/auth.api";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAppDispatch } from "@/store/hooks";
import { authSuccess } from "@/store/slices/auth.slice";

export default function SetupPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await setupPassword(password);
      
      // Re-fetch user to get the updated token/state where first_login = false
      const updatedUser = await fetchCurrentUser();
      dispatch(authSuccess(updatedUser));

      // Router automatically re-protects, but let's push just to be safe
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8 py-10 shadow-xl border-t-4 border-indigo-600 bg-white">
        <div className="text-center mb-8">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Secure Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please set a password for your account to complete registration. 
            You can use this later to login manually instead of Google.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
            <h3 className="text-sm font-medium text-red-800 text-center">{error}</h3>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full py-3 h-auto text-base font-medium shadow-md transition-all hover:-translate-y-0.5"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
