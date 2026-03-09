import React from "react";
import { TrendingUp, Clock, Users, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AnalyticsView() {
    const stats = [
        { label: "Total Appointments", value: "124", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Avg. Response Time", value: "2.4 hrs", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Approval Rate", value: "86%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "No-Shows", value: "3", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">Department usage and response times.</p>
                </div>
                <select onChange={(e) => toast(`Filtering by: ${e.target.value}`)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-primary-500">
                    <option>This Month</option>
                    <option>Last 3 Months</option>
                    <option>This Semester</option>
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="glass rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default">
                        <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                            <s.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                            <h4 className="text-2xl font-bold text-slate-900 mt-0.5">{s.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="glass rounded-2xl p-6 h-80 flex items-center justify-center border-dashed border-2 border-slate-200">
                    <p className="text-slate-400">Appointments Over Time Chart Placeholder</p>
                </div>
                <div className="glass rounded-2xl p-6 h-80 flex items-center justify-center border-dashed border-2 border-slate-200">
                    <p className="text-slate-400">Department Volume Chart Placeholder</p>
                </div>
            </div>
        </div>
    );
}
