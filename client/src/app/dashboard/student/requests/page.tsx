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
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 py-1">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
        </Badge>
      );
    } else if (s === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none px-3 py-1">
          <Clock4 className="w-3 h-3 mr-1" /> Pending
        </Badge>
      );
    } else if (s === "declined" || s === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-3 py-1">
          <XCircle className="w-3 h-3 mr-1" /> Declined
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
    <div className="space-y-6 max-w-5xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            My Requests
          </h1>
          <p className="text-gray-500 text-sm">
            Track and manage your appointment requests.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by faculty or purpose..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", "pending", "confirmed", "declined"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              onClick={() => setFilterStatus(status)}
              className="capitalize text-sm h-10"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row p-5 gap-6 md:items-center">
                  <div className="flex items-center gap-4 md:w-1/3">
                    <img
                      src={
                        request.imageUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(request.facultyName)}&background=random&color=fff`
                      }
                      alt={request.facultyName}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 leading-tight">
                        {request.facultyName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {request.department || "CSED Faculty"}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-gray-700 font-medium">
                      {request.purpose}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>
                          {format(new Date(request.date), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{request.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{request.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6 md:min-w-[140px]">
                    {getStatusBadge(request.status)}

                    {request.status.toLowerCase() === "pending" && (
                      <button
                        onClick={() => handleCancelRequestClick(request)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
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
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
            <CalendarIcon className="mx-auto h-10 w-10 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No requests found
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {/* Cancel Warning Modal */}
      {cancelWarningModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <Card className="w-full max-w-md shadow-xl border-none">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`p-3 rounded-full mb-4 ${cancelError ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}`}
                >
                  {cancelError ? (
                    <XCircle className="w-10 h-10" />
                  ) : (
                    <AlertTriangle className="w-10 h-10" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {cancelError ? "Action Required" : "Confirm Cancellation"}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {cancelError ||
                    "Are you sure you want to cancel this appointment request? This action cannot be undone."}
                </p>
                <div className="flex flex-col sm:flex-row w-full gap-3">
                  {!cancelError && (
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={confirmCancel}
                    >
                      Yes, Cancel
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCancelWarningModal(null)}
                  >
                    {cancelError ? "Close" : "Go Back"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
