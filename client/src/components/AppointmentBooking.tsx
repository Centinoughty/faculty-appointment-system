import React, { useState } from "react";
import { Faculty, TimeSlot } from "../types/dashboard";

interface AppointmentBookingProps {
  faculty: Faculty;
  slots: TimeSlot[];
  onBack: () => void;
  onSubmitRequest: (
    slotId: string,
    purpose: string,
    description: string,
  ) => void;
}

export default function AppointmentBooking({
  faculty,
  slots,
  onBack,
  onSubmitRequest,
}: AppointmentBookingProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedSlotId) {
      setError("Please select a time slot.");
      return;
    }

    if (purpose.trim().length < 10) {
      setError("Meeting Purpose must be at least 10 characters long.");
      return;
    }

    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters long.");
      return;
    }

    onSubmitRequest(selectedSlotId, purpose, description);
  };

  const availableSlots = slots.filter(
    (slot) => slot.facultyId === faculty.id && slot.isAvailable,
  );

  // Group slots by date
  const slotsByDate = availableSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    },
    {} as Record<string, TimeSlot[]>,
  );

  const availableDates = Object.keys(slotsByDate).sort();

  // Set initial selected date if not set and dates are available
  React.useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const slotsForSelectedDate = selectedDate
    ? slotsByDate[selectedDate] || []
    : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={onBack}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 flex items-center"
      >
        &larr; Back to Search
      </button>

      <div className="mb-6 pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-semibold text-slate-800">
          {faculty.name}
        </h2>
        <p className="text-slate-500">{faculty.department}</p>
      </div>

      <h3 className="text-lg font-medium mb-3 text-slate-700">Select a Day</h3>

      {availableDates.length === 0 ? (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 mb-6">
          No available slots for this faculty at the moment.
        </div>
      ) : (
        <>
          {/* Day Selector Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Select Date
            </h2>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {availableDates.map((dateString) => {
                const dateObj = new Date(dateString);
                const isSelected = selectedDate === dateString;

                // Get short weekday (e.g. "Mon")
                const weekday = dateObj.toLocaleDateString(undefined, {
                  weekday: "short",
                });
                // Get day of month (e.g. "2")
                const dayOfMonth = dateObj.toLocaleDateString(undefined, {
                  day: "numeric",
                });

                return (
                  <button
                    key={dateString}
                    type="button"
                    onClick={() => {
                      setSelectedDate(dateString);
                      setSelectedSlotId(null);
                    }}
                    className={`flex flex-col items-center justify-center min-w-[64px] rounded-xl py-3 border transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <span className="text-xs font-medium uppercase tracking-wider">
                      {weekday}
                    </span>
                    <span className="text-xl font-bold mt-1">{dayOfMonth}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots for Selected Day */}
          <h3 className="text-md font-medium mb-3 text-slate-700">
            Available Slots for{" "}
            {selectedDate
              ? new Date(selectedDate).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {slotsForSelectedDate.map((slot) => (
              <div
                key={slot.id}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`p-3 rounded-md border cursor-pointer text-center transition-all ${
                  selectedSlotId === slot.id
                    ? "bg-blue-600 border-blue-600 text-white shadow-md"
                    : "bg-slate-50 border-gray-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <div className="text-xs font-medium">
                  {slot.startTime} - {slot.endTime}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedSlotId && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 p-5 rounded-md border border-gray-200"
        >
          <h3 className="text-lg font-medium mb-4 text-slate-700">
            Booking Details
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Meeting Purpose
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              placeholder="E.g., Project Discussion"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 10 characters.</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-slate-800"
              placeholder="Provide more details about why you want to meet..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Minimum 10 characters.</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Submit Request
          </button>
        </form>
      )}
    </div>
  );
}
