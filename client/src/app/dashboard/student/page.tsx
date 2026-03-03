"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Mock Student Dashboard Data
const MOCK_STATS = {
  upcomingMeetings: 2,
  pendingRequests: 1,
  completedMeetings: 5,
};

const UPCOMING_MEETINGS = [
  {
    id: "req1",
    facultyName: "Dr. Lijiya A",
    purpose: "Project Discussion",
    date: "Tomorrow",
    time: "10:30 AM",
    location: "CSED #201",
  },
  {
    id: "req4",
    facultyName: "Dr. Vinod P",
    purpose: "Cybersecurity Seminar followup",
    date: "Thursday",
    time: "03:00 PM",
    location: "CSED #304",
  },
];

export default function StudentDashboardLanding() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome back, Student!
        </h1>
        <p className="text-gray-500 mt-1">
          Here is an overview of your academic appointments and schedule.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Upcoming Meetings
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {MOCK_STATS.upcomingMeetings}
                </h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Pending Requests
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {MOCK_STATS.pendingRequests}
                </h3>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Completed Meetings
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {MOCK_STATS.completedMeetings}
                </h3>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout for Quick Actions & Upcoming Agenda */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Upcoming Agenda */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Next on your Agenda
            </h2>
            <Link
              href="/dashboard/student/requests"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all schedule &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {UPCOMING_MEETINGS.map((meeting) => (
              <Card
                key={meeting.id}
                className="hover:border-blue-200 transition-colors"
              >
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {meeting.purpose}
                    </h4>
                    <p className="text-sm text-gray-500">
                      with {meeting.facultyName}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 py-2 px-4 rounded-lg">
                    <div className="flex items-center gap-1.5 font-medium text-blue-700">
                      <CalendarIcon className="w-4 h-4" /> {meeting.date}
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-1.5 font-medium text-blue-700">
                      <Clock className="w-4 h-4" /> {meeting.time}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Col: Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col divide-y">
                <Link
                  href="/dashboard/student/directory"
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                >
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      Book new Appointment
                    </p>
                    <p className="text-sm text-gray-500">
                      Find a faculty member to meet
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/dashboard/student/requests"
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                >
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      Check Pending Requests
                    </p>
                    <p className="text-sm text-gray-500">
                      View status of your bookings
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
