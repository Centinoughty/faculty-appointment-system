"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/store/hooks";
import { requestForToken, onMessageListener } from "@/lib/firebase";
import { notificationApi } from "@/api/notifications.api";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/auth.slice";

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { restoreSession } = useAuth();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [blacklisted, setBlacklisted] = useState(false);

  useEffect(() => {
    const restore = async () => {
      try {
        await restoreSession();
      } catch (e: any) {
        if (e?.response?.status === 403 && e?.response?.data?.detail === "blacklisted") {
          dispatch(logout());
          setBlacklisted(true);
        }
      }
    };
    restore();
  }, []);

  // Firebase FCM
  useEffect(() => {
    if (user) {
      const setupFirebase = async () => {
        const token = await requestForToken();
        if (token) {
          try {
            await notificationApi.registerFCMToken(token);
          } catch (e) {}
        }
      };
      setupFirebase();
      onMessageListener()?.then((payload: any) => {
        toast.info(payload?.notification?.title, {
          description: payload?.notification?.body,
        });
      });
    }
  }, [user]);

  if (blacklisted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Blacklisted</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your account has been blacklisted by the admin. Please contact the administration for further assistance.
          </p>
          <a
            href="/login"
            className="block w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}