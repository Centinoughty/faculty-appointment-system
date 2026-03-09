"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import {
  User,
  Users,
  CalendarDays,
  LayoutDashboard,
  Bell,
  Search,
} from "lucide-react";
import NotificationPanel from "@/components/NotificationPanel";

export default function StudentDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white hidden md:flex flex-col shadow-sm">
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            NITC FAMS
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard/student"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all duration-200"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </Link>

          <Link
            href="/dashboard/student/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all duration-200"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">My Profile</span>
          </Link>

          <Link
            href="/dashboard/student/directory"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all duration-200"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Directory</span>
          </Link>

          <Link
            href="/dashboard/student/requests"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all duration-200"
          >
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium">Requests</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen pb-16 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search faculty, cabins..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 rounded-full text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>
            <Link
              href="/dashboard/student/profile"
              className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                NS
              </div>
              <span className="text-sm font-medium text-gray-700 hidden lg:block">
                Nadeem Siyam
              </span>
            </Link>
          </div>

          {/* Notification Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute top-16 right-4 md:right-8">
              <NotificationPanel
                onClose={() => setIsNotificationsOpen(false)}
              />
            </div>
          )}
        </header>

        <div className="flex-1 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around items-center h-16 px-2 z-50 transition-colors">
        <Link
          href="/dashboard/student"
          className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-blue-700 transition-colors"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link
          href="/dashboard/student/directory"
          className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-blue-700 transition-colors"
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium">Search</span>
        </Link>

        <Link
          href="/dashboard/student/requests"
          className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-blue-700 transition-colors"
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] font-medium">Schedule</span>
        </Link>

        <Link
          href="/dashboard/student/profile"
          className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-blue-700 transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
