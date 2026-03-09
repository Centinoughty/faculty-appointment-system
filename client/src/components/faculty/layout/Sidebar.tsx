import React from "react";
import Link from "next/link";
import {
    CalendarDays,
    Users,
    Settings,
    BarChart3,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
    { icon: CalendarDays, label: "Calendar", href: "?view=calendar" },
    { icon: Users, label: "Requests", href: "?view=requests" },
    { icon: BarChart3, label: "Analytics", href: "?view=analytics" },
    { icon: Settings, label: "Profile", href: "?view=profile" },
];

export default function Sidebar() {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:static inset-y-0 left-0 z-50 w-72 flex-col justify-between bg-white border-r border-slate-200 shadow-sm transition-all duration-300 ease-in-out">
                <div className="flex h-full flex-col overflow-y-auto pt-5 pb-4">
                    <div className="flex items-center justify-between px-6 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold shadow-sm">
                                F
                            </div>
                            <span className="text-xl font-bold text-slate-900">
                                FAMS
                            </span>
                        </div>
                    </div>

                    <nav className="mt-2 text-sm font-medium px-4 space-y-2 flex-1">
                        <div className="px-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
                                        "text-slate-600 hover:text-primary-700 hover:bg-primary-50 font-medium"
                                    )}
                                >
                                    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    <span className="flex-1">{item.label}</span>
                                    {item.label === 'Requests' && (
                                        <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm animate-pulse mr-1"></span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="px-4 mt-auto">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden">
                            <h4 className="font-semibold text-slate-800 mb-1 relative z-10">Need Help?</h4>
                            <p className="text-xs text-slate-500 mb-3 relative z-10">Check the Quick-start guide</p>
                            <button
                                onClick={() => toast.success('Opening manual...')}
                                className="w-full text-xs bg-white text-slate-700 border border-slate-300 px-3 py-2 rounded-lg font-medium shadow-sm hover:bg-slate-50 transition-colors"
                            >
                                View Manual
                            </button>
                        </div>

                        <button
                            onClick={() => toast('Logging out securely...')}
                            className="mt-4 flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white border-t border-slate-200 pb-safe pt-1 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex flex-col items-center justify-center w-full py-2 px-1 text-slate-500 hover:text-primary-600 transition-colors relative"
                        >
                            <Icon className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {item.label === 'Requests' && (
                                <span className="absolute top-1 right-1/4 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border-2 border-white"></span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
