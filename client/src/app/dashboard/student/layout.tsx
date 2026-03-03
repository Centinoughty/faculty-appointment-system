import { ReactNode } from "react";
import Link from "next/link";
import {
  User,
  Users,
  CalendarDays,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function StudentDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-transparent">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white hidden md:flex flex-col shadow-sm">
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <h1 className="text-xl font-bold text-blue-700">NITC FAMS</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard/student"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </Link>

          <Link
            href="/dashboard/student/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">My Profile</span>
          </Link>

          <Link
            href="/dashboard/student/directory"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Directory</span>
          </Link>

          <Link
            href="/dashboard/student/requests"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors"
          >
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium">Requests</span>
          </Link>
        </nav>

        <div className="p-4 border-t">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Back to Main</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen pb-16 md:pb-0">
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

        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-1 p-2 text-red-600 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Logout</span>
        </Link>
      </nav>
    </div>
  );
}
