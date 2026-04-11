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
import AuthGuard from "@/components/AuthGuard";
import { useAppSelector } from "@/store/hooks";
import { useNotifications } from "@/hooks/useNotifications";

export default function StudentDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "ST";

  return (
    <AuthGuard allowedRoles={["student"]}>
      <div className="flex min-h-screen bg-slate-50/50 overflow-x-hidden w-full max-w-[100vw] relative">
        {/* Sidebar Navigation */}
        <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white hidden md:flex flex-col shadow-sm">
          <div className="h-16 flex items-center justify-between px-6 border-b">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              FAMS
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
              <span className="font-medium">Book</span>
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
              {/* Top search bar removed as requested. Search is available in the Book Appointment page. */}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>
              <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>
              <Link
                href="/dashboard/student/profile"
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || "Profile"}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {initials}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden lg:block">
                  {user?.name || "Student"}
                </span>
              </Link>
            </div>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute top-16 right-4 md:right-8">
                <NotificationPanel
                  notifications={notifications}
                  onMarkRead={markAsRead}
                  onClose={() => setIsNotificationsOpen(false)}
                />
              </div>
            )}
          </header>

          <div className="flex-1 p-3 sm:p-6 md:p-8 w-full overflow-x-hidden">
            <div className="max-w-6xl mx-auto w-full">{children}</div>
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
            <span className="text-[10px] font-medium">Book</span>
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
    </AuthGuard>
  );
}
