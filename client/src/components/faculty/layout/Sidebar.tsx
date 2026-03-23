import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    CalendarDays,
    Users,
    User,
    LayoutDashboard,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { facultyApi } from "@/api/faculty.api";
import { useWebSocketEvent } from "@/hooks/useWebSocket";

const navItems = [
    { icon: CalendarDays, label: "Calendar", href: "?view=calendar" },
    { icon: Users, label: "Requests", href: "?view=requests" },
    { icon: LayoutDashboard, label: "Analytics", href: "?view=analytics" },
    { icon: User, label: "Profile", href: "?view=profile" },
];

export default function Sidebar() {
    const { signOut } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);

    const loadStats = () => {
        facultyApi.getStats()
            .then(res => setPendingCount(res.data.pending))
            .catch(err => console.error("Error fetching request counts:", err));
    };

    useEffect(() => {
        loadStats();
    }, []);

    useWebSocketEvent("REFRESH_REQUESTS", loadStats);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:static inset-y-0 left-0 z-50 w-72 flex-col justify-between bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out">
                <div className="flex h-full flex-col overflow-y-auto pt-5 pb-4">
                    <div className="flex items-center justify-between px-6 mb-8">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                            NITC FAMS
                        </h1>
                    </div>

                    <nav className="mt-2 text-sm font-medium px-4 space-y-2 flex-1">
                        <div className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Dashboard
                        </div>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                        "text-gray-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                                    )}
                                >
                                    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    <span className="flex-1">{item.label}</span>
                                    {item.label === 'Requests' && pendingCount > 0 && (
                                        <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm animate-pulse mr-1"></span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="px-4 mt-auto">
                        <button
                            onClick={signOut}
                            className="mt-4 flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white border-t border-gray-200 pb-safe pt-1 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex flex-col items-center justify-center w-full py-2 px-1 text-gray-500 hover:text-blue-600 transition-colors relative"
                        >
                            <Icon className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {item.label === 'Requests' && pendingCount > 0 && (
                                <span className="absolute top-1 right-1/4 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border-2 border-white"></span>
                            )}
                        </Link>
                    );
                })}
                <button
                    onClick={signOut}
                    className="flex flex-col items-center justify-center w-full py-2 px-1 text-red-500 hover:text-red-700 transition-colors relative"
                >
                    <LogOut className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium">Sign Out</span>
                </button>
            </nav>
        </>
    );
}
