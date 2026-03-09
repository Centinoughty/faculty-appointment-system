"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  ArrowRight,
  Database,
  Sparkles,
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
    .slice(0, 3);

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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-8 md:p-12 text-white shadow-2xl shadow-blue-200">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
          <Sparkles className="w-32 h-32" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-[0.2em] border border-white/20 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Online
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Hi, {user?.displayName?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-blue-100 mt-4 text-lg font-medium max-w-lg leading-relaxed">
            Manage your faculty appointments, track research collaborations, and
            stay ahead of your schedule.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/dashboard/student/directory">
              <button className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-50 transition-all active:scale-95">
                Start New Request
              </button>
            </Link>
          </div>
        </div>

        {appointments.length === 0 && (
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="absolute bottom-8 right-8 flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/30 backdrop-blur-md text-white rounded-xl transition-colors text-xs font-bold border border-white/10"
          >
            <Database className="w-3.5 h-3.5" />
            {isSeeding ? "Syncing..." : "Sync Faculty Directory"}
          </button>
        )}
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Confirmed",
            value: stats.upcomingMeetings,
            icon: CheckCircle2,
            color: "emerald",
          },
          {
            label: "Pending",
            value: stats.pendingRequests,
            icon: Clock,
            color: "amber",
          },
          {
            label: "Completed",
            value: stats.completedMeetings,
            icon: CalendarIcon,
            color: "blue",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-xl shadow-gray-100 rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <CardContent className="p-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
                  {stat.value}
                </h3>
              </div>
              <div
                className={`p-5 rounded-[1.5rem] bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}
              >
                <stat.icon className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agenda Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Coming Up Next
            </h2>
            <Link
              href="/dashboard/student/requests"
              className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
            >
              See all requests
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {upcomingAgenda.length > 0 ? (
              upcomingAgenda.map((meeting) => (
                <Card
                  key={meeting.id}
                  className="border-none shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-blue-100/20 transition-all duration-300 rounded-3xl"
                >
                  <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-inner">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(meeting.facultyName)}&background=random&color=fff`}
                          alt={meeting.facultyName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-lg leading-tight">
                          {meeting.purpose}
                        </h4>
                        <p className="text-sm font-bold text-blue-600 mt-1">
                          {meeting.facultyName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100 w-fit">
                      <div className="flex items-center gap-2 font-black text-gray-700 text-xs">
                        <CalendarIcon className="w-4 h-4 text-blue-500" />{" "}
                        {meeting.date}
                      </div>
                      <div className="w-px h-4 bg-gray-200"></div>
                      <div className="flex items-center gap-2 font-black text-gray-700 text-xs text-nowrap">
                        <Clock className="w-4 h-4 text-blue-500" />{" "}
                        {meeting.time}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-20 bg-white border-2 border-dashed border-gray-100 rounded-[3rem] shadow-inner flex flex-col items-center justify-center text-center px-6">
                <div className="p-6 bg-gray-50 rounded-[2rem] mb-6">
                  <CalendarIcon className="w-12 h-12 text-gray-200" />
                </div>
                <h4 className="text-xl font-black text-gray-900">
                  Ready for more?
                </h4>
                <p className="text-sm font-bold text-gray-400 mt-2 max-w-xs leading-relaxed">
                  You have no meetings scheduled for today. Why not reach out to
                  a professor?
                </p>
                <Link href="/dashboard/student/directory" className="mt-8">
                  <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
                    Browse Faculty
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight px-2">
            Navigation
          </h2>
          <Card className="border-none shadow-xl shadow-gray-100 rounded-[2.5rem] overflow-hidden p-4">
            <CardContent className="p-0 space-y-2">
              {[
                {
                  title: "Faculty Directory",
                  sub: "Browse by department",
                  link: "/dashboard/student/directory",
                },
                {
                  title: "My Requests",
                  sub: "Status tracking",
                  link: "/dashboard/student/requests",
                },
                {
                  title: "Notification Center",
                  sub: "Latest updates",
                  link: "#",
                },
                {
                  title: "Account Settings",
                  sub: "Profile & Preferences",
                  link: "/dashboard/student/profile",
                },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.link}
                  className="p-5 flex items-center justify-between hover:bg-gray-50 rounded-3xl transition-all group"
                >
                  <div>
                    <p className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mt-1">
                      {item.sub}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-200 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2.5rem] text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-20 h-20" />
            </div>
            <h3 className="text-xl font-black mb-2">Need Support?</h3>
            <p className="text-gray-400 text-sm font-bold leading-relaxed mb-6">
              Running into issues with your account or booking? Our team is here
              to help.
            </p>
            <button className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
              Contact Helpdesk
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
