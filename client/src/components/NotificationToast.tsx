"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, CalendarCheck, AlertCircle, X } from "lucide-react";

export type ToastNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
};

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bar: string }> = {
  appointment_request: {
    icon: <Clock className="w-5 h-5" />,
    color: "text-blue-600",
    bar: "bg-blue-500",
  },
  appointment_confirmed: {
    icon: <CheckCircle className="w-5 h-5" />,
    color: "text-emerald-600",
    bar: "bg-emerald-500",
  },
  appointment_declined: {
    icon: <XCircle className="w-5 h-5" />,
    color: "text-red-500",
    bar: "bg-red-500",
  },
  appointment_cancelled: {
    icon: <XCircle className="w-5 h-5" />,
    color: "text-orange-500",
    bar: "bg-orange-500",
  },
  appointment_completed: {
    icon: <CalendarCheck className="w-5 h-5" />,
    color: "text-purple-600",
    bar: "bg-purple-500",
  },
  appointment_no_show: {
    icon: <AlertCircle className="w-5 h-5" />,
    color: "text-yellow-600",
    bar: "bg-yellow-500",
  },
};

const DURATION = 5000;

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastNotification;
  onRemove: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const config = typeConfig[toast.type] || {
    icon: <AlertCircle className="w-5 h-5" />,
    color: "text-gray-600",
    bar: "bg-gray-500",
  };

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Trigger leave animation before removing
    const leaveTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => onRemove(toast.id), 400);
    }, DURATION);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
    };
  }, [toast.id, onRemove]);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 400);
  };

  return (
    <div
      className="relative w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
      style={{
        transform: visible && !leaving ? "translateX(0) scale(1)" : "translateX(110%) scale(0.95)",
        opacity: visible && !leaving ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
        marginBottom: "10px",
      }}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gray-100">
        <div
          className={`h-full ${config.bar} origin-left`}
          style={{
            animation: visible && !leaving ? `shrink ${DURATION}ms linear forwards` : "none",
          }}
        />
      </div>

      <div className="p-4 pr-10">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 flex-shrink-0 ${config.color}`}>{config.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{toast.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleClose}
        className="absolute top-3 right-3 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}

export default function NotificationToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastNotification[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}
