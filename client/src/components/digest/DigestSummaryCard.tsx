import React from 'react';

export default function DigestSummaryCard() {
    return (
        <div className="bg-gradient-to-br from-violet-700 to-indigo-800 rounded-[1.25rem] p-5 text-white mb-5 shadow-md">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="text-purple-200 text-xs font-medium mb-1">Total Appointments</p>
                    <h2 className="text-3xl font-bold">5</h2>
                </div>
                <div className="bg-white/20 px-2 py-1 rounded-md flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                        <polyline points="16 7 22 7 22 13" />
                    </svg>
                    <span className="text-xs font-bold tracking-wide">+12%</span>
                </div>
            </div>

            <div className="flex gap-6">
                <div>
                    <p className="text-purple-200 text-[10px] font-medium mb-0.5">Completed</p>
                    <p className="text-lg font-bold">2</p>
                </div>
                <div>
                    <p className="text-purple-200 text-[10px] font-medium mb-0.5">Remaining</p>
                    <p className="text-lg font-bold">3</p>
                </div>
            </div>
        </div>
    );
}
