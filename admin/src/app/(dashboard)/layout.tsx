"use client";

import React, { useState } from 'react';
import Sidebar from '@/src/components/Sidebar';
import { Search, Bell, Settings, Menu } from 'lucide-react';

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-900">
            {/* Sidebar Component */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Global Top Header */}
                <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-lg font-bold text-slate-900 hidden sm:block">Admin Dashboard</h2>
                    </div>
                </header>

                {/* Page Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto p-6 pl-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}