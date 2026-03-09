import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock Notifications
const MOCK_NOTIFICATIONS = [
    {
        id: "1",
        title: "New Appointment Request",
        message: "John Doe requested a meeting for Tomorrow at 10:00 AM.",
        time: "10 mins ago",
        read: false,
        type: "info",
        icon: Calendar
    },
    {
        id: "2",
        title: "Schedule Conflict",
        message: "You have overlapping slots on Friday at 2:00 PM.",
        time: "2 hours ago",
        read: false,
        type: "warning",
        icon: AlertCircle
    },
    {
        id: "3",
        title: "Meeting Cancelled",
        message: "Sarah Smith cancelled the appointment for Today.",
        time: "Yesterday",
        read: true,
        type: "default",
        icon: CheckCircle2
    }
];

export default function Header() {
    const [busyMode, setBusyMode] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

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

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white border-b border-slate-200 px-4 md:px-6 shadow-sm">
            <div className="flex items-center gap-4">
                {/* Mobile Logo */}
                <div className="flex items-center gap-2 lg:hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold shadow-sm">
                        F
                    </div>
                    <span className="text-xl font-bold text-slate-900">
                        FAMS
                    </span>
                </div>

                <div className="hidden md:flex relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-64 pl-10 pr-3 py-2 border border-slate-200 rounded-full leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white sm:text-sm transition-all shadow-sm focus:w-72"
                        placeholder="Quick search..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                {/* Busy Mode Toggle - SRS Requirement 4.2.3 REQ-4 */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600 hidden sm:inline-block">
                        Busy Mode
                    </span>
                    <button
                        onClick={() => {
                            setBusyMode(!busyMode);
                            toast.success(`Busy Mode ${!busyMode ? 'enabled' : 'disabled'}!`);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${busyMode ? "bg-amber-500" : "bg-slate-200"
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
                                ? "bg-primary-100 text-primary-700"
                                : "text-slate-500 hover:text-primary-600 hover:bg-primary-50"
                        )}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                            </span>
                        )}
                    </button>

                    {/* Dropdown Panel */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right z-50">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-semibold text-slate-800">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs font-medium text-primary-600 hover:text-primary-700"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[min(400px,calc(100vh-100px))] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {notifications.map((notification) => {
                                            const Icon = notification.icon;
                                            return (
                                                <div
                                                    key={notification.id}
                                                    className={cn(
                                                        "p-4 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer",
                                                        !notification.read && "bg-primary-50/30"
                                                    )}
                                                    onClick={() => {
                                                        setNotifications(notifications.map(n =>
                                                            n.id === notification.id ? { ...n, read: true } : n
                                                        ));
                                                    }}
                                                >
                                                    <div className={cn(
                                                        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5",
                                                        notification.type === 'info' ? "bg-blue-100 text-blue-600" :
                                                            notification.type === 'warning' ? "bg-amber-100 text-amber-600" :
                                                                "bg-slate-100 text-slate-600"
                                                    )}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className={cn(
                                                                "text-sm truncate pr-2",
                                                                !notification.read ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                                                            )}>
                                                                {notification.title}
                                                            </p>
                                                            <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                                                                {notification.time}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                                        <Bell className="w-8 h-8 mb-3 text-slate-300" />
                                        <p className="text-sm">You have no new notifications.</p>
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                                    <button className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
                                        View All Notifications
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="hidden text-right md:block">
                        <p className="text-sm font-medium text-slate-700">Dr. Alan Turing</p>
                        <p className="text-xs text-slate-500">Computer Science</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-primary-100 p-0.5 shadow-sm border border-primary-200">
                        <div className="h-full w-full rounded-full overflow-hidden bg-white">
                            <img
                                src={"https://api.dicebear.com/7.x/notionists/svg?seed=Alan"}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
