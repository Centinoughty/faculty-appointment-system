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
import { useAppSelector } from "@/store/hooks";

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

  const { user } = useAppSelector((state) => state.auth);
  const studentId = user?.email || "nadeem.siyam@nitc.ac.in";

  useEffect(() => {
    if (!studentId) return;
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

    const status = req.status.toLowerCase();
    const filter = filterStatus.toLowerCase();

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
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 py-1 rounded-lg">
          <CheckCircle2 className="w-3 h-3 mr-1.5" /> Confirmed
        </Badge>
      );
    } else if (s === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none px-3 py-1 rounded-lg">
          <Clock4 className="w-3 h-3 mr-1.5" /> Pending
        </Badge>
      );
    } else if (s === "declined" || s === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-3 py-1 rounded-lg">
          <XCircle className="w-3 h-3 mr-1.5" /> Declined
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="px-3 py-1 capitalize rounded-lg">
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto px-4 md:px-0">
      {/* Header & Filters */}
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            My Requests
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Track and manage your appointment requests across all faculties.
          </p>
        </div>

        <div className="flex flex-col gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 h-5 w-5" />
            <Input
              placeholder="Search by faculty or purpose..."
              className="pl-12 h-14 bg-gray-50/50 border-gray-100 focus:bg-white transition-all rounded-2xl font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {["all", "pending", "confirmed", "declined"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all duration-200 whitespace-nowrap shadow-sm border ${
                  filterStatus === status
                    ? "bg-blue-600 text-white border-blue-600 shadow-blue-100 scale-105"
                    : "bg-white text-gray-500 hover:bg-gray-50 border-gray-100"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Requests List */}
      <div className="space-y-5">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="overflow-hidden border-none shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-blue-100/20 transition-all duration-300 group rounded-[2.5rem]"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row p-6 md:p-8 gap-6 md:items-center">
                  {/* Faculty Info */}
                  <div className="flex items-center gap-5 md:w-1/3">
                    <div className="relative shrink-0">
                      <img
                        src={
                          request.imageUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(request.facultyName)}&background=random&color=fff`
                        }
                        alt={request.facultyName}
                        className="w-20 h-20 rounded-3xl border-4 border-white shadow-lg object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {request.facultyName}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {request.department || "CSED Faculty"}
                      </p>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  <div className="flex-1 space-y-4 md:border-l md:border-gray-100 md:pl-8">
                    <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                      <p className="text-sm font-bold text-blue-900 tracking-tight leading-relaxed">
                        "{request.purpose}"
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-xs font-black text-gray-500 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                        <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                        <span>
                          {format(new Date(request.date), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-black text-gray-500 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>{request.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-black text-gray-500 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        <span>{request.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-5 pt-6 md:pt-0 border-t md:border-t-0 md:border-l md:border-gray-50 md:pl-8 md:min-w-[160px]">
                    <div className="scale-110 md:scale-100">
                      {getStatusBadge(request.status)}
                    </div>

                    {request.status.toLowerCase() === "pending" && (
                      <button
                        onClick={() => handleCancelRequestClick(request)}
                        className="text-[10px] font-black text-red-400 hover:text-red-700 uppercase tracking-[0.2em] transition-all hover:bg-red-50 px-3 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-24 px-6 rounded-[3rem] border-2 border-dashed border-gray-100 bg-white/50 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gray-50 mb-8 transition-transform">
              <CalendarIcon className="h-12 w-12 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto font-bold text-sm leading-relaxed">
              We couldn't find any requests matching your filters. Try different
              keywords!
            </p>
            <Button
              variant="outline"
              className="mt-10 rounded-2xl font-black px-10 py-6 border-2 text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Cancel Warning Modal */}
      {cancelWarningModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl border-none animate-in zoom-in-95 duration-300 rounded-[3rem] overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-white p-10">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`p-6 rounded-[2rem] mb-8 shadow-xl shadow-opacity-10 ${cancelError ? "bg-red-50 text-red-500 shadow-red-100" : "bg-yellow-50 text-yellow-500 shadow-yellow-100"}`}
                  >
                    {cancelError ? (
                      <XCircle className="w-12 h-12" />
                    ) : (
                      <AlertTriangle className="w-12 h-12" />
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">
                    {cancelError ? "Action Required" : "Are you sure?"}
                  </h3>
                  <p className="text-gray-500 font-bold text-sm leading-relaxed mb-10">
                    {cancelError ||
                      "Do you really want to cancel this meeting? This will free up the slot for other students."}
                  </p>
                  <div className="flex flex-col w-full gap-4">
                    {!cancelError && (
                      <Button
                        className="bg-red-500 hover:bg-red-600 text-white font-black py-7 rounded-2xl shadow-xl shadow-red-100 transition-all active:scale-95"
                        onClick={confirmCancel}
                      >
                        YES, CANCEL THIS
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="font-black text-xs uppercase tracking-widest py-7 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"
                      onClick={() => setCancelWarningModal(null)}
                    >
                      {cancelError ? "CONTINUE" : "GO BACK"}
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
