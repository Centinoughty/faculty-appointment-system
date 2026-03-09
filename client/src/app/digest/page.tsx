"use client";

import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/digest/Header";
import DigestSummaryCard from "@/components/digest/DigestSummaryCard";
import ScheduleCard from "@/components/digest/ScheduleCard";
import PendingRequestsCard from "@/components/digest/PendingRequestsCard";
import BottomNav from "@/components/digest/BottomNav";

export default function DigestPage() {
    const scheduleData = [
        {
            id: "#STU-22941",
            name: "Alex Johnson",
            subject: "Research Discussion",
            time: "2:00 PM - 2:45 PM",
            isNextUp: true,
        },
        {
            id: "#STU-18552",
            name: "Maria Garcia",
            subject: "Academic Advising",
            time: "3:30 PM - 4:00 PM",
            isNextUp: false,
        },
    ];

    return (
        <div className="bg-slate-200 fixed inset-0 flex items-center justify-center">
            <div className="w-full max-w-[400px] h-dvh bg-slate-50 relative shadow-2xl border-[8px] border-white overflow-hidden flex flex-col ">
                <div className="p-4 flex-1 overflow-y-auto no-scrollbar pb-6">
                    <Header />
                    <DigestSummaryCard />

                    <div className="mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-3 text-gray-900">
                            <svg className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Today's Schedule
                        </h2>

                        <div className="space-y-3">
                            {scheduleData.map((item, index) => (
                                <ScheduleCard
                                    key={index}
                                    name={item.name}
                                    id={item.id}
                                    subject={item.subject}
                                    time={item.time}
                                    isNextUp={item.isNextUp}
                                />
                            ))}
                        </div>
                    </div>

                    <PendingRequestsCard />
                </div>

                <BottomNav />
            </div>
        </div>
    );
}
