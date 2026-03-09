"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  ArrowRight,
  Database,
} from "lucide-react";
import Link from "next/link";
import { appointmentService } from "@/api/appointments.service";
import { Appointment, StudentStats } from "@/types/appointment";
import { useAppSelector } from "@/store/hooks";

export default function StudentDashboardLanding() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const studentId = user?.email;

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

  // Derive stats from appointments
  const stats: StudentStats = {
    upcomingMeetings: appointments.filter(
      (a) =>
        a.status.toUpperCase() === "APPROVED" ||
        a.status.toUpperCase() === "CONFIRMED",
    ).length,
    pendingRequests: appointments.filter(
      (a) => a.status.toUpperCase() === "PENDING",
    ).length,
    completedMeetings: appointments.filter(
      (a) => a.status.toUpperCase() === "COMPLETED",
    ).length,
  };

  const upcomingAgenda = appointments
    .filter(
      (a) =>
        a.status.toUpperCase() === "APPROVED" ||
        a.status.toUpperCase() === "CONFIRMED",
    )
    .slice(0, 2);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const mockFaculty = [
        {
          name: "Dr. Lijiya A",
          department: "Computer Science",
          designation: "Assistant Professor",
          researchInterests: ["Machine Learning", "Data Mining", "AI"],
          office: "CSED #201",
          imageUrl:
            "https://ui-avatars.com/api/?name=Lijiya+A&background=random&color=fff",
        },
        {
          name: "Dr. Vinod P",
          department: "Computer Science",
          designation: "Professor",
          researchInterests: ["Cyber Security", "Network Forensics"],
          office: "CSED #304",
          imageUrl:
            "https://ui-avatars.com/api/?name=Vinod+P&background=random&color=fff",
        },
      ];
      await appointmentService.seedFaculties(mockFaculty);
      alert("Faculty Directory Seeding Successful!");
    } catch (error) {
      console.error(error);
      alert("Failed to seed data.");
    } finally {
      setIsSeeding(false);
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, {user?.displayName?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here is an overview of your academic appointments and schedule.
          </p>
        </div>

        {appointments.length === 0 && (
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium border border-indigo-200"
          >
            <Database className="w-4 h-4" />
            {isSeeding ? "Syncing..." : "Initialize Firebase Data"}
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Upcoming Meetings
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.upcomingMeetings}
                </h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Pending Requests
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.pendingRequests}
                </h3>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Completed Meetings
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.completedMeetings}
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
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all schedule &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingAgenda.length > 0 ? (
              upcomingAgenda.map((meeting) => (
                <Card
                  key={meeting.id}
                  className="hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
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
                    <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 py-2.5 px-4 rounded-xl border border-gray-100">
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
              ))
            ) : (
              <div className="py-12 bg-white border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center px-4">
                <div className="p-3 bg-gray-50 rounded-full mb-3">
                  <CalendarIcon className="w-8 h-8 text-gray-300" />
                </div>
                <h4 className="font-medium text-gray-900">
                  No upcoming meetings
                </h4>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                  You don't have any approved meetings scheduled for the coming
                  days.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <Card className="shadow-sm">
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
