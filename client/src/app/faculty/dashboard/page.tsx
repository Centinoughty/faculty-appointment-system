"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { useState } from "react";
import { format, addDays } from "date-fns";

// Sub-views
import ProfileView from "@/components/faculty/views/ProfileView";
import CalendarView from "@/components/faculty/views/CalendarView";
import RequestsView from "@/components/faculty/views/RequestsView";
import AnalyticsView from "@/components/faculty/views/AnalyticsView";

function DashboardContent() {
    const searchParams = useSearchParams();
    const view = searchParams.get("view") || "calendar";

    const today = new Date();

    // Unified App State for Faculty Dashboard
    const [appointments, setAppointments] = useState<any[]>([
        { id: 1, date: format(addDays(today, 0), "yyyy-MM-dd"), hour: 10, title: "Project Mentorship", type: "approved", student: "Alice K", purpose: "Project Mentorship", desc: "I want to discuss the initial draft of my final year project.", rollNo: "B210045CS", time: `${format(addDays(today, 0), 'MMM d')}, 10:00 AM`, slot: "Slot A" },
        { id: 2, date: format(addDays(today, 1), "yyyy-MM-dd"), hour: 14, title: "Doubt Clearance", type: "pending", student: "Jane Smith", purpose: "Doubt Clearance", desc: "Need help understanding the second chapter of Theory of Computation.", rollNo: "M220012CS", time: `${format(addDays(today, 1), 'MMM d')}, 2:00 PM`, slot: "Slot B" },
        { id: 3, date: format(addDays(today, 2), "yyyy-MM-dd"), hour: 11, title: "PhD Review", type: "pending", student: "John Doe", purpose: "PhD Review", desc: "Quarterly review of my literature survey.", rollNo: "P200034CS", time: `${format(addDays(today, 2), 'MMM d')}, 11:30 AM`, slot: "Slot C" },
    ]);

    return (
        <div className="h-full">
            {view === "calendar" && <CalendarView appointments={appointments} setAppointments={setAppointments} />}
            {view === "requests" && <RequestsView appointments={appointments} setAppointments={setAppointments} />}
            {view === "analytics" && <AnalyticsView />}
            {view === "profile" && <ProfileView />}
        </div>
    );
}

export default function FacultyDashboardPage() {
    return (
        <Suspense fallback={<div className="h-[60vh] flex items-center justify-center">Loading dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
