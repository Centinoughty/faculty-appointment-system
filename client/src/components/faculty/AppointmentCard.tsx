"use client";

import { Appointment } from "@/types/appointment";
import useUpdateAppointmentStatus from "@/hooks/useUpdateAppointmentStatus";
import ActionButton from "../ui/ActionButton";

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-blue/10 text-blue border-blue/20",
  pending: "bg-orange-50 text-orange-500 border-orange-200",
  rejected: "bg-red-50 text-red-500 border-red-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
  noshow: "bg-red-100 text-red-600 border-red-300",
};

const STATUS_LABELS: Record<string, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  cancelled: "Cancelled",
  noshow: "No Show",
};

interface Props {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: Props) {
  const { id, faculty, purpose, status, date } = appointment;
  const { updateStatus, isUpdating } = useUpdateAppointmentStatus();

  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isClosed =
    status === "cancelled" || status === "rejected" || status === "noshow";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status] ?? status}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <div>
        <p className="font-bold text-gray-900">{faculty?.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{purpose}</p>
      </div>

      {!isClosed && (
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-100">
          {isPending && (
            <>
              <ActionButton
                label="Approve"
                onClick={() => updateStatus(id, "approved")}
                disabled={isUpdating}
                variant="success"
              />
              <ActionButton
                label="Reject"
                onClick={() => updateStatus(id, "rejected")}
                disabled={isUpdating}
                variant="danger"
              />
            </>
          )}

          {isApproved && (
            <ActionButton
              label="Mark as No Show"
              onClick={() => updateStatus(id, "noshow")}
              disabled={isUpdating}
              variant="warning"
            />
          )}

          {(isPending || isApproved) && (
            <ActionButton
              label="Cancel"
              onClick={() => updateStatus(id, "cancelled")}
              disabled={isUpdating}
              variant="ghost"
            />
          )}
        </div>
      )}
    </div>
  );
}
