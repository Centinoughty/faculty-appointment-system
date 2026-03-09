"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/Badge";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "appointment" | "message" | "info";
  unread: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Appointment Confirmed",
    description: "Dr. Smith has accepted your request.",
    time: "2 mins ago",
    type: "appointment",
    unread: true,
  },
  {
    id: "2",
    title: "Reminder",
    description: "Meeting with Prof. Alan in 1 hour.",
    time: "45 mins ago",
    type: "message",
    unread: true,
  },
  {
    id: "3",
    title: "Profile Updated",
    description: "Your profile details have been saved.",
    time: "2 hours ago",
    type: "info",
    unread: false,
  },
];

export default function NotificationPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={panelRef}
      className="w-80 md:w-96 bg-white border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-3">
          <button className="text-xs text-blue-600 hover:underline">
            Mark all as read
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-200 text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {MOCK_NOTIFICATIONS.length > 0 ? (
          <div>
            {MOCK_NOTIFICATIONS.map((n) => (
              <div
                key={n.id}
                className={`p-4 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                  n.unread ? "bg-blue-50/20" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900">
                      {n.title}
                    </p>
                    {n.unread && (
                      <Badge
                        variant="default"
                        className="h-1.5 w-1.5 p-0 bg-blue-600 rounded-full"
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {n.time}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {n.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">No new notifications</p>
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-50 border-t text-center">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View all notifications
        </button>
      </div>
    </div>
  );
}
