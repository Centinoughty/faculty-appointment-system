"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock4,
  Search,
  List as ListIcon,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// Mock Data for demonstration
const today = new Date();
const MOCK_REQUESTS = [
  {
    id: "req1",
    facultyName: "Dr. Lijiya A",
    department: "Computer Science",
    date: format(addDays(today, 1), "yyyy-MM-dd"),
    time: "10:30 AM",
    location: "CSED #201",
    purpose: "Project Discussion",
    status: "confirmed",
    imageUrl: "https://ui-avatars.com/api/?name=Lijiya+A&background=random",
  },
  {
    id: "req2",
    facultyName: "Dr. Vinod P",
    department: "Computer Science",
    date: format(addDays(today, 2), "yyyy-MM-dd"),
    time: "02:00 PM",
    location: "CSED #304",
    purpose: "Doubt Clearance - Cybersecurity",
    status: "pending",
    imageUrl: "https://ui-avatars.com/api/?name=Vinod+P&background=random",
  },
  {
    id: "req3",
    facultyName: "Dr. Sudeep K S",
    department: "Computer Science",
    date: format(addDays(today, -1), "yyyy-MM-dd"),
    time: "11:00 AM",
    location: "CSED #102",
    purpose: "Algorithm Query",
    status: "declined",
    imageUrl: "https://ui-avatars.com/api/?name=Sudeep+KS&background=random",
  },
];

export default function StudentRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [mockRequests, setMockRequests] = useState(MOCK_REQUESTS);

  // Modal state
  const [cancelWarningModal, setCancelWarningModal] = useState<string | null>(
    null,
  );
  const [cancelError, setCancelError] = useState("");

  const filteredRequests = mockRequests.filter((req) => {
    const matchesSearch =
      req.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCancelRequestClick = (request: (typeof MOCK_REQUESTS)[0]) => {
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

  const confirmCancel = () => {
    if (cancelError) {
      setCancelWarningModal(null);
      return;
    }
    setMockRequests((prev) =>
      prev.filter((req) => req.id !== cancelWarningModal),
    );
    setCancelWarningModal(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none">
            <Clock4 className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "declined":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">
            <XCircle className="w-3 h-3 mr-1" /> Declined
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
              className="pl-9 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {["all", "pending", "confirmed", "declined"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                  filterStatus === status
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
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
              className="overflow-hidden hover:shadow-md transition-shadow group"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                  {/* Faculty Info */}
                  <div className="flex items-center gap-4 md:w-1/3">
                    <img
                      src={request.imageUrl}
                      alt={request.facultyName}
                      className="w-14 h-14 rounded-full border border-gray-200 object-cover shrink-0"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {request.facultyName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {request.department}
                      </p>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-4 md:border-l md:pl-6">
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900 border-l-2 border-blue-500 pl-2">
                        "{request.purpose}"
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>
                        {format(new Date(request.date), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{request.time}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{request.location}</span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="md:w-32 flex flex-row md:flex-col items-center justify-between md:justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6">
                    {getStatusBadge(request.status)}

                    {request.status === "pending" && (
                      <button
                        onClick={() => handleCancelRequestClick(request)}
                        className="text-xs font-medium text-red-600 hover:text-red-700 underline underline-offset-2"
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
          <div className="text-center py-16 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-white">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <CalendarIcon className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No requests found
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              You haven't made any appointment requests that match your current
              filters.
            </p>
          </div>
        )}
      </div>

      {/* Cancel Warning Modal */}
      {cancelWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-full shrink-0 ${cancelError ? "bg-red-100" : "bg-yellow-100"}`}
                >
                  {cancelError ? (
                    <XCircle className="w-6 h-6 text-red-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {cancelError ? "Cancellation Failed" : "Cancel Request?"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    {cancelError ||
                      "Are you sure you want to cancel this appointment request? This action cannot be undone."}
                  </p>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCancelWarningModal(null)}
                    >
                      {cancelError ? "Close" : "Keep Appointment"}
                    </Button>
                    {!cancelError && (
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={confirmCancel}
                      >
                        Yes, Cancel it
                      </Button>
                    )}
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
