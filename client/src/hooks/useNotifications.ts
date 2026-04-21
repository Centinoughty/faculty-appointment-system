import { useState, useEffect, useCallback, useRef } from "react";
import { notificationApi, Notification } from "@/api/notifications.api";
import { ToastNotification } from "@/components/NotificationToast";

// Global set outside the hook — shared across all instances
const globalShownIds = new Set<number>();
let wsListenerAttached = false;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // polling
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await notificationApi.getNotifications();
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: Notification) => !n.read).length);
      } catch (err) {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  // websocket — only attach ONE global listener ever
  useEffect(() => {
    if (wsListenerAttached) return;
    wsListenerAttached = true;

    const handler = async () => {
      try {
        const res = await notificationApi.getNotifications();
        const fresh = res.data;

        fresh
          .filter((n: Notification) => !n.read && !globalShownIds.has(n.id))
          .forEach((n: Notification) => {
            globalShownIds.add(n.id);
            // dispatch a custom event so all hook instances can show the toast
            window.dispatchEvent(new CustomEvent("show_toast", { detail: n }));
          });
      } catch {}
    };

    window.addEventListener("ws_message", handler);
    // NOTE: intentionally not removing — it's a singleton
  }, []);

  // each instance listens for show_toast and updates its own state
  useEffect(() => {
    const handler = (e: any) => {
      const n = e.detail;
      setToasts((prev) => [...prev, {
        id: `${Date.now()}-${Math.random()}`,
        type: n.type,
        title: n.title,
        message: n.message,
      }]);
      setNotifications((prev) => {
        const exists = prev.find((p) => p.id === n.id);
        return exists ? prev : [n, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    };

    window.addEventListener("show_toast", handler);
    return () => window.removeEventListener("show_toast", handler);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {}
  };

  return { notifications, unreadCount, markAsRead, toasts, removeToast };
}