"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { facultyApi } from "@/api/faculty.api";
import { Appointment } from "@/types/faculty";

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
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    
    const fetchAppointments = async () => {
        try {
            const { data } = await facultyApi.getAppointments();
            setAppointments(data);
        } catch (error) {
            console.error("Failed to fetch appointments:", error);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    return (
        <div className="h-full">
            {view === "calendar" && <CalendarView appointments={appointments} refreshAppointments={fetchAppointments} />}
            {view === "requests" && <RequestsView appointments={appointments} refreshAppointments={fetchAppointments} />}
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
