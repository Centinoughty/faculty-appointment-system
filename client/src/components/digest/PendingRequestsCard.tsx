import React from 'react';

export default function PendingRequestsCard() {
    return (
        <div className="mt-5 mb-20">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                    <svg className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        <circle cx="12" cy="14" r="3" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v2l1.5 1.5" />
                    </svg>
                    Pending Requests
                </h2>
                <button className="text-purple-700 font-bold text-xs">View All</button>
            </div>

            <div className="bg-white rounded-[1.25rem] p-3 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">David Chen</h3>
                        <p className="text-[10px] text-gray-500 font-medium">Project Mentoring</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center hover:bg-purple-100 active:scale-90 active:bg-purple-200 transition-all duration-150">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                    <button className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 active:scale-90 active:bg-gray-200 transition-all duration-150">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
