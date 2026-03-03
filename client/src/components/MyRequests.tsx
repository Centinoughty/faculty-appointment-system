import React from "react";
import { AppointmentRequest, Faculty, TimeSlot } from "../types/dashboard";

interface MyRequestsProps {
  requests: AppointmentRequest[];
  faculties: Faculty[];
  slots: TimeSlot[];
  onCancelRequest?: (requestId: string) => void;
}

export default function MyRequests({
  requests,
  faculties,
  slots,
  onCancelRequest,
}: MyRequestsProps) {
  // Helper to format date nicely
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Declined":
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <h2 className="text-xl font-semibold mb-2 text-slate-800">
          My Requests
        </h2>
        <p className="text-slate-500">
          You haven't made any appointment requests yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 text-slate-800">My Requests</h2>

      <div className="space-y-4">
        {requests.map((request) => {
          const faculty = faculties.find((f) => f.id === request.facultyId);
          const slot = slots.find((s) => s.id === request.slotId);

          return (
            <div
              key={request.id}
              className="p-4 border border-gray-200 rounded-md bg-slate-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">
                    {faculty?.name || "Unknown Faculty"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {faculty?.department || "Unknown Department"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}
                  >
                    {request.status}
                  </span>
                  {request.status === "Pending" && onCancelRequest && (
                    <button
                      onClick={() => onCancelRequest(request.id)}
                      className="text-xs text-red-600 hover:text-red-800 underline transition-colors"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white p-3 border border-gray-100 rounded">
                <div>
                  <p className="text-slate-500 mb-1">Time Slot:</p>
                  <p className="font-medium text-slate-800">
                    {slot
                      ? `${slot.date}, ${slot.startTime} - ${slot.endTime}`
                      : "Unknown Slot"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Purpose:</p>
                  <p className="font-medium text-slate-800">
                    {request.purpose}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-slate-500 mb-1">Description:</p>
                  <p className="text-slate-700 bg-slate-50 p-2 rounded">
                    {request.description}
                  </p>
                </div>
                <div className="sm:col-span-2 text-xs text-slate-400 mt-2 text-right">
                  Requested on: {formatDate(request.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
