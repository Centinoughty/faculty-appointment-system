"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { appointmentService } from "@/api/appointments.service";
import { useAppSelector } from "@/store/hooks";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "appointment" | "message" | "info";
  unread: boolean;
}

export default function NotificationPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAppSelector((state) => state.auth);
  const studentId = user?.email || "nadeem.siyam@nitc.ac.in";

  useEffect(() => {
    if (!studentId) return;
    // Listen to real-time notifications
    const unsubscribe = appointmentService.getNotifications(
      studentId,
      (data) => {
        // Sort by time (ideally should use field in Firestore, but for mock transition we use as is)
        setNotifications(data as any);
      },
    );

    return () => unsubscribe();
  }, [studentId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleMarkAllAsRead = async () => {
    try {
      await appointmentService.markNotificationsAsRead(studentId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      ref={panelRef}
      className="w-80 md:w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="p-5 border-b bg-gray-50/80 backdrop-blur-sm flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-4">
          {notifications.some((n) => n.unread) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-200 text-gray-400 transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 hover:bg-gray-50/50 transition-all cursor-pointer relative group ${
                  n.unread ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm tracking-tight ${n.unread ? "font-bold text-gray-900" : "font-semibold text-gray-600"}`}
                    >
                      {n.title}
                    </p>
                    {n.unread && (
                      <span className="h-2 w-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]"></span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {n.time}
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${n.unread ? "text-gray-700 font-medium" : "text-gray-500"}`}
                >
                  {n.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="p-4 bg-gray-50 rounded-2xl mb-4">
              <X className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-sm font-bold text-gray-400">All caught up!</p>
            <p className="text-xs text-gray-300 mt-1">
              No new notifications for you.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-all">
          View all notifications
        </button>
      </div>
    </div>
  );
}
