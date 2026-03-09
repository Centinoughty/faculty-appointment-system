"use client";

import React from "react";
import Sidebar from "@/components/faculty/layout/Sidebar";
import Header from "@/components/faculty/layout/Header";

export default function FacultyDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden gradient-bg text-slate-800 dark:text-slate-100">
            {/* Sidebar & Mobile Bottom Nav */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 w-full overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
