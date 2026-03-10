import React from "react";
import { TrendingUp, Clock, Users, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";

export default function AnalyticsView() {
    const stats = [
        { label: "Total Appointments", value: "124", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Avg. Response Time", value: "2.4 hrs", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Approval Rate", value: "86%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "No-Shows", value: "3", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Department usage and response times.</p>
                </div>
                <select onChange={(e) => toast(`Filtering by: ${e.target.value}`)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option>This Month</option>
                    <option>Last 3 Months</option>
                    <option>This Semester</option>
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <Card key={i} className="p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default border-gray-200">
                        <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                            <s.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                            <h4 className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</h4>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card className="p-6 h-80 flex items-center justify-center border-dashed border-2 shadow-none border-gray-200">
                    <p className="text-gray-400">Appointments Over Time Chart Placeholder</p>
                </Card>
                <Card className="p-6 h-80 flex items-center justify-center border-dashed border-2 shadow-none border-gray-200">
                    <p className="text-gray-400">Department Volume Chart Placeholder</p>
                </Card>
            </div>
        </div>
    );
}
