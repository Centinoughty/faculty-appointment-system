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
import { useAppSelector } from "@/store/hooks";

export default function StudentDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex min-h-screen bg-slate-50/30">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white/80 backdrop-blur-xl hidden md:flex flex-col shadow-sm">
        <div className="h-20 flex items-center px-8 border-b border-gray-50">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent tracking-tighter">
            NITC FAMS
          </h1>
        </div>

        <nav className="flex-1 p-6 space-y-3">
          {[
            {
              label: "Overview",
              icon: LayoutDashboard,
              href: "/dashboard/student",
            },
            {
              label: "Faculty Directory",
              icon: Users,
              href: "/dashboard/student/directory",
            },
            {
              label: "My Requests",
              icon: CalendarDays,
              href: "/dashboard/student/requests",
            },
            {
              label: "My Profile",
              icon: User,
              href: "/dashboard/student/profile",
            },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-blue-600 hover:text-white text-gray-500 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 font-bold text-sm group"
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen pb-20 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 h-20 bg-white/60 backdrop-blur-md border-b border-gray-50 px-6 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-sm w-full hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder="Search faculty, cabins..."
                className="w-full pl-12 pr-5 py-3 bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-2xl text-xs font-bold transition-all outline-none border transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-3 rounded-2xl hover:bg-gray-100 text-gray-400 transition-all hover:text-blue-600 group"
            >
              <Bell className="w-5 h-5 group-hover:rotate-12" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block"></div>
            <Link
              href="/dashboard/student/profile"
              className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-50 bg-gray-50 sm:bg-transparent"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-100 overflow-hidden">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.displayName?.charAt(0) || "S"
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-black text-gray-900 leading-none">
                  {user?.displayName || "Student Account"}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
                  NIT Calicut
                </p>
              </div>
            </Link>
          </div>

          {/* Notification Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute top-20 right-6 md:right-10 animate-in fade-in zoom-in-95 duration-200">
              <NotificationPanel
                onClose={() => setIsNotificationsOpen(false)}
              />
            </div>
          )}
        </header>

        <div className="flex-1 p-6 md:p-12 overflow-x-hidden">
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
