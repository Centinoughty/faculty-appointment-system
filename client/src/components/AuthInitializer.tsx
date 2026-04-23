"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/store/hooks";
import { requestForToken, onMessageListener } from "@/lib/firebase";
import { notificationApi } from "@/api/notifications.api";
import { toast } from "sonner";

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { restoreSession } = useAuth();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Only restore if we don't have a user yet
    // This runs once when the app/layout mounts
    restoreSession();
  }, []); // Explicitly empty array to run only once ONCE on app load

  // Handle Firebase FCM Token Registration
  useEffect(() => {
    if (user) {
      const setupFirebase = async () => {
        const token = await requestForToken();
        if (token) {
          try {
            await notificationApi.registerFCMToken(token);
            console.log("FCM Token registered with backend");
          } catch (e) {
            console.error("Failed to register FCM Token", e);
          }
        }
      };
      
      setupFirebase();
      
      onMessageListener((payload: any) => {
        toast.info(payload?.notification?.title, {
          description: payload?.notification?.body,
          duration: 5000,
        });
      });
    }
  }, [user]);

  return <>{children}</>;
}
