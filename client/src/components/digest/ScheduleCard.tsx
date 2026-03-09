import React from 'react';

interface ScheduleCardProps {
    name: string;
    id: string;
    subject: string;
    time: string;
    isNextUp?: boolean;
}

export default function ScheduleCard({ name, id, subject, time, isNextUp }: ScheduleCardProps) {
    return (
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-base font-bold text-gray-900">{name}</h3>
                    <p className="text-xs text-gray-400 font-medium tracking-wide mt-0.5">ID: {id}</p>
                </div>
                {isNextUp && (
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        Next Up
                    </span>
                )}
            </div>

            <div className="space-y-1.5 mb-4 text-gray-600 font-medium">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                    <span className="text-xs">{subject}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs">{time}</span>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-gray-50 active:scale-95 active:bg-gray-100 transition-all duration-150">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Reschedule
                </button>
                <button className="flex-1 border border-red-100 text-red-500 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold bg-white hover:bg-red-50 active:scale-95 active:bg-red-100 transition-all duration-150">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Cancel
                </button>
            </div>
        </div>
    );
}
