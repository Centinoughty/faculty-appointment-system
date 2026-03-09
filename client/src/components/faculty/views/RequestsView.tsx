import React, { useState } from "react";
import { format, addDays } from "date-fns";
import { Check, X, MessageSquare, Clock, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

export default function RequestsView({ appointments, setAppointments }: { appointments: any[], setAppointments: any }) {
    const [activeTab, setActiveTab] = useState("pending");

    const today = new Date();

    const pendingRequests = appointments.filter(a => a.type === 'pending');
    // For prototype simplicity, let's derive history from local actions for now or just rely on what's built.
    const [historyRequests, setHistoryRequests] = useState<any[]>([]);

    const handleAction = (request: any, action: 'approved' | 'declined') => {
        setAppointments(appointments.map(a => a.id === request.id ? { ...a, type: action } : a));
        setHistoryRequests(prev => [{ ...request, status: action, actionDate: new Date().toLocaleDateString() }, ...prev]);

        if (action === 'approved') {
            toast.success(`Appointment with ${request.student} approved!`);
        } else {
            toast.error(`Appointment with ${request.student} declined.`);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Appointment Requests
                    </h1>
                    <p className="text-sm border-s border-indigo-500 pl-2 text-slate-500 mt-1">Review and manage student queues.</p>
                </div>
            </div>

            <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl w-max shadow-inner">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "pending"
                        ? "bg-white text-primary-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                        }`}
                >
                    Pending ({pendingRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "history"
                        ? "bg-white text-primary-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                        }`}
                >
                    History
                </button>
            </div>

            <div className="grid gap-4 flex-1 overflow-y-auto pb-4">
                {activeTab === "pending" && pendingRequests.map((req) => (
                    <div key={req.id} className="glass rounded-2xl p-5 hover:border-primary-200 transition-colors w-full group relative overflow-hidden">
                        {/* Glossy highlight effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                        <div className="flex flex-col md:flex-row gap-5 justify-between">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 shrink-0 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                    {req.student.charAt(0)}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-900">{req.student}</h3>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                            {req.rollNo}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                                        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                                            <Clock className="w-3.5 h-3.5" /> {req.time}
                                        </span>
                                        <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md border border-slate-100 mt-1 sm:mt-0">
                                            <CalendarIcon className="w-3.5 h-3.5" /> {req.slot}
                                        </span>
                                    </div>

                                    <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block w-full">
                                        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                                            <MessageSquare className="w-4 h-4 text-primary-600" /> {req.purpose}
                                        </p>
                                        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{req.desc}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex md:flex-col justify-end md:justify-start gap-2 pt-2 md:pt-0 border-t border-slate-100 md:border-0 md:pl-4">
                                <button onClick={() => handleAction(req, 'approved')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5">
                                    <Check className="w-4 h-4" /> Approve
                                </button>
                                <button onClick={() => handleAction(req, 'declined')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50 text-slate-700 rounded-xl text-sm font-medium transition-all">
                                    <X className="w-4 h-4" /> Decline
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {activeTab === "pending" && pendingRequests.length === 0 && (
                    <div className="p-8 text-center text-slate-500 glass rounded-2xl flex flex-col items-center justify-center h-48 border-dashed border-2">
                        <Check className="w-10 h-10 mb-3 text-emerald-400" />
                        <p>All caught up! No pending requests.</p>
                    </div>
                )}

                {activeTab === "history" && historyRequests.length > 0 && historyRequests.map((req) => (
                    <div key={req.id} className="glass rounded-2xl p-4 w-full flex items-center justify-between opacity-80">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${req.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                {req.status === 'approved' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">{req.student} <span className="text-slate-500 font-normal">({req.purpose})</span></h3>
                                <p className="text-xs text-slate-500 mt-0.5">Requested for: {req.time} | Processed on: {req.actionDate}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {req.status.toUpperCase()}
                        </span>
                    </div>
                ))}

                {activeTab === "history" && historyRequests.length === 0 && (
                    <div className="p-8 text-center text-slate-500 glass rounded-2xl flex flex-col items-center justify-center h-48 border-dashed border-2">
                        <Clock className="w-10 h-10 mb-3 text-slate-300" />
                        <p>No historical requests to show right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
