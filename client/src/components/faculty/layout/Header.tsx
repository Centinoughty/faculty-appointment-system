import React, { useState, useRef, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import NotificationPanel from "@/components/NotificationPanel";
import { AuthUser, fetchCurrentUser } from "@/api/auth.api";

export default function Header() {
    const [busyMode, setBusyMode] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);

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

    useEffect(() => {
        fetchCurrentUser()
            .then(data => setUser(data))
            .catch(err => console.error("Failed to fetch user data for header", err));
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

                <div className="hidden md:flex relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm transition-all shadow-sm focus:w-72"
                        placeholder="Quick search..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                {/* Busy Mode Toggle - SRS Requirement 4.2.3 REQ-4 */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 hidden sm:inline-block">
                        Busy Mode
                    </span>
                    <button
                        onClick={() => {
                            setBusyMode(!busyMode);
                            toast.success(`Busy Mode ${!busyMode ? 'enabled' : 'disabled'}!`);
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
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {/* Dropdown Panel */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 z-50 origin-top-right">
                            <NotificationPanel
                                onClose={() => setIsNotificationsOpen(false)}
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="hidden text-right md:block">
                        <p className="text-sm font-medium text-gray-700">{user?.name || "Loading..."}</p>
                        <p className="text-xs text-gray-500">{user?.department_name || "Faculty"}</p>
                    </div>
                    
                    {/* Profile Dropdown */}
                    <div className="relative group cursor-pointer">
                        <div className="h-9 w-9 rounded-full bg-blue-100 p-0.5 shadow-sm border border-blue-200">
                            <div className="h-full w-full rounded-full overflow-hidden bg-white">
                                <img
                                    src={user?.profile_picture || "https://api.dicebear.com/7.x/notionists/svg?seed=Faculty"}
                                    alt="Profile"
                                    referrerPolicy="no-referrer"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="p-2">
                                <button
                                    onClick={async () => {
                                        try {
                                            const { logoutApi } = await import("@/api/auth.api");
                                            await logoutApi();
                                            window.location.href = "/login";
                                        } catch (error) {
                                            toast.error("Logout failed.");
                                        }
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 font-medium"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
