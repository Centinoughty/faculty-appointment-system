"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Mock Faculty Data
const MOCK_FACULTY = {
  id: "f1",
  name: "Dr. Lijiya A",
  department: "Computer Science",
  designation: "Assistant Professor",
  office: "CSED #201",
  imageUrl: "https://ui-avatars.com/api/?name=Lijiya+A&background=random",
};

// Generate next 7 days
const today = startOfToday();
const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(today, i));

// Mock Time Slots
const MOCK_SLOTS = [
  { id: "s1", time: "09:00 AM", status: "available" },
  { id: "s2", time: "10:30 AM", status: "available" },
  { id: "s3", time: "11:00 AM", status: "booked" },
  { id: "s4", time: "02:00 PM", status: "available" },
  { id: "s5", time: "03:30 PM", status: "available" },
];

export default function FacultyBookingClient() {
  const router = useRouter();
  const { id } = useParams();

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }
    if (purpose.length < 10) {
      setError("Purpose must be at least 10 characters long.");
      return;
    }
    if (description.length < 10) {
      setError("Description must be at least 10 characters long.");
      return;
    }

    setIsSubmitting(true);

    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Redirect to requests page after successful booking
      router.push("/dashboard/student/requests");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <Link
        href="/dashboard/student"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Directory
      </Link>

      {/* Header Profile */}
      <Card className="border-0 shadow-sm bg-white overflow-hidden">
        <div className="h-32 bg-blue-600 relative">
          <div className="absolute -bottom-12 left-6">
            <img
              src={MOCK_FACULTY.imageUrl}
              alt={MOCK_FACULTY.name}
              className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md bg-white"
            />
          </div>
        </div>
        <CardContent className="px-6 pb-6 pt-16">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {MOCK_FACULTY.name}
            </h1>
            <p className="text-gray-500 font-medium">
              {MOCK_FACULTY.designation} • {MOCK_FACULTY.department}
            </p>
            <p className="text-sm text-gray-500 mt-1">{MOCK_FACULTY.office}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Calendar & Slots */}
        <div className="md:col-span-5 space-y-6">
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Select Date
              </h2>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {weekDays.map((date) => {
                  const isSelected = isSameDay(date, selectedDate);
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedSlot(null);
                      }}
                      className={`flex flex-col items-center justify-center min-w-[64px] rounded-xl py-3 border transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <span className="text-xs font-medium uppercase tracking-wider">
                        {format(date, "EEE")}
                      </span>
                      <span className="text-xl font-bold mt-1">
                        {format(date, "d")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                Available Slots
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {MOCK_SLOTS.map((slot) => {
                  const isAvailable = slot.status === "available";
                  const isSelected = selectedSlot === slot.id;

                  return (
                    <button
                      key={slot.id}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`py-2.5 px-3 rounded-lg text-sm font-medium border text-center transition-all ${
                        !isAvailable
                          ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
                          : isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600 shadow-sm"
                            : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-sm"
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Booking Form */}
        <div className="md:col-span-7">
          <Card className="shadow-sm border-gray-100 h-full">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Booking Details</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="purpose"
                    className="text-sm font-medium text-gray-700"
                  >
                    Meeting Purpose <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="purpose"
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Project Discussion, Doubt Clearing"
                    className="w-full h-11 px-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-400">
                    Minimum 10 characters required.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                  >
                    Detailed Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly explain what you would like to discuss..."
                    rows={5}
                    className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                  />
                  <p className="text-xs text-gray-400">
                    Minimum 10 characters required.
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 text-base shadow-md group"
                    disabled={isSubmitting || !selectedSlot}
                  >
                    {isSubmitting ? (
                      "Submitting Request..."
                    ) : (
                      <>
                        Submit Request
                        <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
