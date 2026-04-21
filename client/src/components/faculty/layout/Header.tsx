import React, { useState, useRef, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import NotificationPanel from "@/components/NotificationPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { useAppSelector } from "@/store/hooks";
import { facultyApi } from "@/api/faculty.api";
import NotificationToastContainer from "@/components/NotificationToast";

export default function Header() {
    const { user } = useAppSelector((state) => state.auth);
    const [busyMode, setBusyMode] = useState(user?.busy || false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, toasts, removeToast } = useNotifications();

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white border-b border-gray-200 px-4 md:px-6 shadow-sm">
            <div className="flex items-center gap-4">
                {/* Mobile Logo */}
                <div className="flex items-center gap-2 lg:hidden">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                        NITC FAMS
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                {/* Busy Mode Toggle - SRS Requirement 4.2.3 REQ-4 */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 hidden sm:inline-block">
                        Busy Mode
                    </span>
                    <button
                        onClick={async () => {
                            const newMode = !busyMode;
                            setBusyMode(newMode);
                            try {
                                await facultyApi.setBusyStatus(newMode);
                                toast.success(`Busy Mode ${newMode ? 'enabled' : 'disabled'}!`);
                            } catch (e) {
                                setBusyMode(busyMode);
                                toast.error("Failed to update status");
                            }
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${busyMode ? "bg-amber-500" : "bg-gray-200"
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${busyMode ? "translate-x-6" : "translate-x-1"
                                }`}
                        />
                    </button>
                </div>

                {/* Notifications Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={cn(
                            "relative p-2 rounded-full transition-all",
                            isNotificationsOpen
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                        )}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
                    </button>

                    {/* Dropdown Panel */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 z-50 origin-top-right">
                            <NotificationPanel
                                notifications={notifications}
                                onMarkRead={markAsRead}
                                onClose={() => setIsNotificationsOpen(false)}
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="hidden text-right md:block">
                        <p className="text-sm font-medium text-gray-700">{user?.name || "Faculty"}</p>
                        <p className="text-xs text-gray-500">{user?.department || "Department"}</p>
                    </div>
                    <Link href="?view=profile" className="h-9 w-9 rounded-full bg-blue-100 p-0.5 shadow-sm border border-blue-200 block transition-transform hover:scale-105">
                        <div className="h-full w-full rounded-full overflow-hidden bg-white">
                            {user?.picture ? (
                                <img
                                    src={user.picture}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Faculty")}&background=random`}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>
                    </Link>
                </div>
            </div>
            <NotificationToastContainer toasts={toasts} onRemove={removeToast} />
        </header>
    );
}
