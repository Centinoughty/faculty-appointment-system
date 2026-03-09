"use client";

import { useEffect, useState } from "react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  ArrowLeft,
  Send,
  User,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { appointmentService } from "@/api/appointments.service";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function FacultyBookingClient({
  facultyId,
}: {
  facultyId?: string;
}) {
  const router = useRouter();
  const params = useParams();
  const id = facultyId || (params?.id as string);
  const { user } = useAppSelector((state) => state.auth);

  const [faculty, setFaculty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Generate next 7 days
  const todayValue = startOfToday();
  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(todayValue, i),
  );

  // Fetch Faculty details
  useEffect(() => {
    const fetchFaculty = async () => {
      if (!id) return;
      try {
        const data = await appointmentService.getFacultyById(id);
        if (data) {
          setFaculty(data);
        } else {
          setError("Faculty member not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load faculty details.");
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, [id]);

  // Mock Time Slots (ideally these should also come from DB/schedule)
  const MOCK_SLOTS = [
    { id: "s1", time: "09:00 AM", status: "available" },
    { id: "s2", time: "10:30 AM", status: "available" },
    { id: "s3", time: "11:00 AM", status: "booked" },
    { id: "s4", time: "02:00 PM", status: "available" },
    { id: "s5", time: "03:30 PM", status: "available" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }
    if (purpose.length < 5) {
      setError("Please provide a clearer purpose for the meeting.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user?.email) {
        setError("You must be logged in to book an appointment.");
        setIsSubmitting(false);
        return;
      }

      const selectedTime =
        MOCK_SLOTS.find((s) => s.id === selectedSlot)?.time || "";

      await appointmentService.createAppointment({
        studentId: user.email,
        facultyName: faculty.name,
        department: faculty.department,
        purpose: purpose,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        location: faculty.office,
        status: "PENDING",
      } as any);

      router.push("/dashboard/student/requests");
    } catch (err) {
      console.error(err);
      setError("Failed to book appointment. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!faculty && error) {
    return (
      <div className="text-center py-20 px-6 rounded-3xl border-2 border-dashed border-gray-200 bg-white">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{error}</h3>
        <Link href="/dashboard/student/directory">
          <Button variant="outline" className="mt-4 rounded-xl">
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Back Button */}
      <Link
        href="/dashboard/student/directory"
        className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-blue-600 transition-all group"
      >
        <div className="p-1.5 rounded-lg bg-gray-100 mr-2 group-hover:bg-blue-50">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Back to Faculty Directory
      </Link>

      {/* Header Profile */}
      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-3xl">
        <div className="h-40 bg-gradient-to-r from-blue-700 to-indigo-600 relative">
          <div className="absolute -bottom-14 left-8">
            <div className="relative">
              <img
                src={
                  faculty.imageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=random&color=fff`
                }
                alt={faculty.name}
                className="w-28 h-28 rounded-3xl border-4 border-white object-cover shadow-xl bg-white"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
          </div>
        </div>
        <CardContent className="px-8 pb-8 pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {faculty.name}
              </h1>
              <p className="text-blue-600 font-bold uppercase tracking-wider text-xs mt-1">
                {faculty.designation} • {faculty.department}
              </p>
              <div className="flex items-center gap-2 mt-2 text-gray-500 font-medium">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{faculty.office}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Calendar & Slots */}
        <div className="md:col-span-5 space-y-6">
          <Card className="shadow-sm border-gray-100 rounded-3xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                </div>
                1. Select Date
              </h2>

              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {weekDays.map((date) => {
                  const isSelected = isSameDay(date, selectedDate);
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedSlot(null);
                      }}
                      className={`flex flex-col items-center justify-center min-w-[72px] rounded-2xl py-4 border-2 transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-105"
                          : "bg-white text-gray-600 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                        {format(date, "EEE")}
                      </span>
                      <span className="text-xl font-black mt-1">
                        {format(date, "d")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100 rounded-3xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                2. Available Slots
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
                      className={`py-3.5 px-4 rounded-xl text-sm font-bold border-2 text-center transition-all duration-200 ${
                        !isAvailable
                          ? "bg-gray-50 text-gray-300 border-gray-50 cursor-not-allowed opacity-50"
                          : isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-700 shadow-md shadow-blue-50 scale-[1.02]"
                            : "bg-white border-gray-100 text-gray-700 hover:border-blue-100 hover:shadow-sm"
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
          <Card className="shadow-sm border-gray-100 rounded-3xl h-full">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold mb-8">3. Booking Details</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-sm font-bold text-red-600 animate-shake">
                    {error}
                  </div>
                )}

                <div className="space-y-2.5">
                  <label
                    htmlFor="purpose"
                    className="text-xs font-black uppercase tracking-widest text-gray-400 px-1"
                  >
                    Meeting Purpose
                  </label>
                  <input
                    id="purpose"
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Project Discussion, Doubt Clearing"
                    className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-gray-900"
                  />
                </div>

                <div className="space-y-2.5">
                  <label
                    htmlFor="description"
                    className="text-xs font-black uppercase tracking-widest text-gray-400 px-1"
                  >
                    Detailed Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly explain what you would like to discuss..."
                    rows={6}
                    className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-gray-900 resize-none"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-16 text-lg font-bold shadow-xl shadow-blue-100 border-none rounded-2xl group transition-all hover:scale-[1.02] active:scale-95 bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting || !selectedSlot}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Submitting...
                      </div>
                    ) : (
                      <>
                        Confirm Appointment
                        <Send className="w-5 h-5 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest">
                    The faculty member will be notified immediately
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
