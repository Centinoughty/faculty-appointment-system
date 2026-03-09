"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock4,
  Search,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { appointmentService } from "@/api/appointments.service";
import { Appointment } from "@/types/appointment";

export default function StudentRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [cancelWarningModal, setCancelWarningModal] = useState<string | null>(
    null,
  );
  const [cancelError, setCancelError] = useState("");

  const studentId = "nadeem.siyam@nitc.ac.in";

  useEffect(() => {
    const unsubscribe = appointmentService.getStudentAppointments(
      studentId,
      (data) => {
        setAppointments(data);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [studentId]);

  const filteredRequests = appointments.filter((req) => {
    const matchesSearch =
      req.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchQuery.toLowerCase());

    // Handle both uppercase and lowercase statuses for compatibility
    const status = req.status.toLowerCase();
    const filter = filterStatus.toLowerCase();

    // Map internal statuses to filter labels
    const displayStatus =
      status === "approved" || status === "confirmed"
        ? "confirmed"
        : status === "pending"
          ? "pending"
          : status === "declined" || status === "rejected"
            ? "declined"
            : status;

    const matchesStatus = filter === "all" || displayStatus === filter;

    return matchesSearch && matchesStatus;
  });

  const handleCancelRequestClick = (request: Appointment) => {
    const meetingDate = new Date(request.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Rule: if meeting is today or in the past, decline cancellation.
    if (meetingDate <= today) {
      setCancelError(
        "Cancellation timeframe has closed. Meetings must be cancelled at least 24 hours in advance.",
      );
      setCancelWarningModal(request.id);
    } else {
      setCancelError("");
      setCancelWarningModal(request.id);
    }
  };

  const confirmCancel = async () => {
    if (cancelError || !cancelWarningModal) {
      setCancelWarningModal(null);
      return;
    }

    try {
      await appointmentService.cancelAppointment(cancelWarningModal);
      setCancelWarningModal(null);
    } catch (error) {
      console.error(error);
      alert("Failed to cancel appointment.");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "confirmed" || s === "approved") {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 py-1">
          <CheckCircle2 className="w-3 h-3 mr-1.5" /> Confirmed
        </Badge>
      );
    } else if (s === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none px-3 py-1">
          <Clock4 className="w-3 h-3 mr-1.5" /> Pending
        </Badge>
      );
    } else if (s === "declined" || s === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-3 py-1">
          <XCircle className="w-3 h-3 mr-1.5" /> Declined
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="px-3 py-1 capitalize">
          {s}
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Header & Filters */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              My Requests
            </h1>
            <p className="text-gray-500 mt-1">
              Track and manage your appointment requests across all faculties.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by faculty or purpose..."
              className="pl-9 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {["all", "pending", "confirmed", "declined"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 whitespace-nowrap ${
                  filterStatus === status
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="overflow-hidden border-gray-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all duration-300 group rounded-2xl"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                  {/* Faculty Info */}
                  <div className="flex items-center gap-5 md:w-1/3">
                    <div className="relative">
                      <img
                        src={
                          request.imageUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(request.facultyName)}&background=random&color=fff`
                        }
                        alt={request.facultyName}
                        className="w-16 h-16 rounded-2xl border-2 border-white shadow-sm object-cover shrink-0"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {request.facultyName}
                      </h3>
                      <p className="text-sm font-medium text-gray-500">
                        {request.department || "CSED Faculty"}
                      </p>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-6 md:border-l md:border-gray-100 md:pl-8">
                    <div className="col-span-2">
                      <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100/50">
                        <p className="text-sm font-medium text-blue-900 italic">
                          "{request.purpose}"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 bg-gray-50/80 px-3 py-1.5 rounded-lg w-fit">
                      <CalendarIcon className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>
                        {format(new Date(request.date), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 bg-gray-50/80 px-3 py-1.5 rounded-lg w-fit">
                      <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{request.time}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2.5 text-sm font-semibold text-gray-700">
                      <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{request.location}</span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="md:w-40 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 pt-5 md:pt-0 border-t md:border-t-0 md:border-l md:border-gray-100 md:pl-8">
                    {getStatusBadge(request.status)}

                    {(request.status.toLowerCase() === "pending" ||
                      request.status.toLowerCase() === "all") && (
                      <button
                        onClick={() => handleCancelRequestClick(request)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider hover:underline underline-offset-4 transition-all"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-24 px-6 rounded-3xl border-2 border-dashed border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-50 mb-6 group-hover:scale-110 transition-transform">
              <CalendarIcon className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No requests found
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium">
              You haven't made any appointment requests that match your current
              filters. Try adjusting your search!
            </p>
            <Button
              variant="outline"
              className="mt-8 rounded-xl font-bold px-8 shadow-sm"
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Cancel Warning Modal */}
      {cancelWarningModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl border-none animate-in zoom-in-95 duration-300 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-white p-8">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`p-4 rounded-3xl mb-6 shadow-inner ${cancelError ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}`}
                  >
                    {cancelError ? (
                      <XCircle className="w-10 h-10" />
                    ) : (
                      <AlertTriangle className="w-10 h-10" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {cancelError ? "Cancellation Denied" : "Cancel Request?"}
                  </h3>
                  <p className="text-gray-600 font-medium leading-relaxed mb-8">
                    {cancelError ||
                      "Are you sure you want to cancel this appointment request? This action cannot be undone and the faculty will be notified."}
                  </p>
                  <div className="flex flex-col w-full gap-3">
                    {!cancelError && (
                      <Button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-6 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95"
                        onClick={confirmCancel}
                      >
                        Yes, Cancel Request
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="font-bold py-6 rounded-2xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                      onClick={() => setCancelWarningModal(null)}
                    >
                      {cancelError ? "I Understand" : "Keep Appointment"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
