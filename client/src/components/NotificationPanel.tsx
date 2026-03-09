"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
      className="w-80 md:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] overflow-hidden"
    >
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-3">
          {notifications.some((n) => n.unread) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-200 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                  n.unread ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm ${n.unread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}
                    >
                      {n.title}
                    </p>
                    {n.unread && (
                      <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {n.time}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {n.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">No new notifications</p>
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-50 border-t text-center">
        <button className="text-xs font-medium text-blue-600 hover:underline">
          View all notifications
        </button>
      </div>
    </div>
  );
}
