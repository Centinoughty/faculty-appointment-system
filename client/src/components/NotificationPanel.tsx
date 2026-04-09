"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/Badge";

import { Notification } from "@/api/notifications.api";

export default function NotificationPanel({
  notifications,
  onMarkRead,
  onClose,
}: {
  notifications: Notification[];
  onMarkRead: (id: number) => void;
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
        {notifications.length > 0 ? (
          <div>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read) onMarkRead(n.id);
                }}
                className={`p-4 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                  !n.read ? "bg-blue-50/20" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900">
                      {n.title}
                    </p>
                    {!n.read && (
                      <Badge
                        variant="default"
                        className="h-1.5 w-1.5 p-0 bg-blue-600 rounded-full"
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap lg:ml-2">
                    {new Date(n.time).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {n.message}
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
