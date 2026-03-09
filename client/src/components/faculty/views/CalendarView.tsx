import React, { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Filter, Upload, Calendar as CalendarIcon, BookOpen, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CalendarView({ appointments, setAppointments }: { appointments: any[], setAppointments: any }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Generate a simple week view
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const hours = Array.from({ length: 9 }).map((_, i) => i + 9); // 9 AM to 5 PM
    const workDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    // Calendar Navigation Functions
    const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
    const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const handleToday = () => setCurrentDate(new Date());

    // Modal state for Slots
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [slotData, setSlotData] = useState({ date: "", hour: 9, title: "", type: "approved", student: "" });

    // Modals for Actions
    const [rejectModal, setRejectModal] = useState<{ isOpen: boolean, appointment: any }>({ isOpen: false, appointment: null });
    const [rejectReason, setRejectReason] = useState("");

    const [cancelModal, setCancelModal] = useState<{ isOpen: boolean, appointment: any }>({ isOpen: false, appointment: null });
    const [cancelReason, setCancelReason] = useState("");

    // Modal state for Timetable Configuration
    const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState("");

    // Store subjects keyed by Day -> Hour -> Subject Name
    const [timetable, setTimetable] = useState<Record<string, Record<number, string>>>({});

    // Store cancelled recurrent slots keyed by Date (yyyy-MM-dd) -> Hour -> boolean
    const [timetableExemptions, setTimetableExemptions] = useState<Record<string, Record<number, boolean>>>({});

    const handleOpenModal = (dateStr = format(weekDays[0], "yyyy-MM-dd"), hour = 9) => {
        setSlotData({ date: dateStr, hour, title: "", type: "approved", student: "" });
        setIsModalOpen(true);
    };

    const handleAddSlot = (e: React.FormEvent) => {
        e.preventDefault();
        setAppointments([...appointments, slotData]);
        toast.success(`Slot added successfully!`);
        setIsModalOpen(false);
    };

    const handleAcceptRequest = (e: React.MouseEvent, appointment: any) => {
        e.stopPropagation();
        setAppointments(appointments.map(a => a === appointment ? { ...a, type: 'approved' } : a));
        toast.success(`Request from ${appointment.student} accepted`);
    };

    const handleOpenRejectModal = (e: React.MouseEvent, appointment: any) => {
        e.stopPropagation();
        setRejectModal({ isOpen: true, appointment });
        setRejectReason("");
    };

    const handleConfirmReject = (e: React.FormEvent) => {
        e.preventDefault();
        setAppointments(appointments.filter(a => a !== rejectModal.appointment));
        toast.error(`Request rejected: ${rejectReason}`);
        setRejectModal({ isOpen: false, appointment: null });
    };

    const handleOpenCancelModal = (e: React.MouseEvent, appointment: any) => {
        e.stopPropagation();
        setCancelModal({ isOpen: true, appointment });
        setCancelReason("");
    };

    const handleConfirmCancel = (e: React.FormEvent) => {
        e.preventDefault();
        setAppointments(appointments.filter(a => a !== cancelModal.appointment));
        toast.error(`Appointment cancelled: ${cancelReason}`);
        setCancelModal({ isOpen: false, appointment: null });
    };

    /**
     * UPDATED: Enhanced Toggling Logic
     * Handles editing, overwriting, and loading existing subjects.
     */
    const toggleTimetableSlot = (day: string, hour: number) => {
        setTimetable(prev => {
            const newTimetable = { ...prev };
            if (!newTimetable[day]) newTimetable[day] = {};

            const existingSubject = newTimetable[day][hour];
            const trimmedInput = currentSubject.trim();

            // 1. If cell is occupied and input is empty, load existing for editing ("Eyedropper")
            if (existingSubject && !trimmedInput) {
                setCurrentSubject(existingSubject);
                return prev;
            }

            // 2. If clicking same subject, remove it (Toggle off)
            if (existingSubject === trimmedInput && trimmedInput !== "") {
                const dayCopy = { ...newTimetable[day] };
                delete dayCopy[hour];
                return { ...newTimetable, [day]: dayCopy };
            }

            // 3. If input has text, update/add the subject
            if (trimmedInput) {
                return {
                    ...newTimetable,
                    [day]: { ...newTimetable[day], [hour]: trimmedInput }
                };
            }

            toast.error("Please enter a Subject Name first to paint it on the grid.");
            return prev;
        });
    };

    const handleRemoveTimetableSlot = (e: React.MouseEvent, dateStr: string, hour: number) => {
        e.stopPropagation();
        setTimetableExemptions(prev => {
            const newExemptions = { ...prev };
            if (!newExemptions[dateStr]) newExemptions[dateStr] = {};
            newExemptions[dateStr][hour] = true;
            return newExemptions;
        });
        toast.success("Class cancelled for this day");
    };

    const handleSaveTimetable = () => {
        toast.success("Weekly timetable saved successfully!");
        setIsTimetableModalOpen(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            toast.success(`File ${e.target.files[0].name} uploaded & parsed successfully!`);
            setTimeout(() => setIsTimetableModalOpen(false), 800);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900 w-48">
                        {format(currentDate, "MMMM yyyy")}
                    </h1>
                    <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                        <button onClick={handlePrevWeek} className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={handleToday} className="text-sm font-medium px-2 text-slate-700 hover:text-slate-900 transition-colors">Today</button>
                        <button onClick={handleNextWeek} className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 mr-2 md:mr-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Class</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Approved</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending</span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsTimetableModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            <CalendarIcon className="w-4 h-4 hidden sm:block" />
                            <span>Timetable</span>
                        </button>
                        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-md transition-all whitespace-nowrap">
                            + Manage Slots
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-white shadow-sm">
                {/* Days Header */}
                <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
                    <div className="p-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200">Time</div>
                    {weekDays.map((day, i) => (
                        <div key={i} className="p-2 sm:p-3 text-center border-r border-slate-200 last:border-0">
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">{format(day, "EEE")}</span>
                            <div className={`text-sm sm:text-xl font-bold mt-0.5 ${format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? "text-indigo-600" : "text-slate-800"}`}>
                                {format(day, "dd")}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Time Grid */}
                <div className="flex-1 overflow-y-auto min-h-[500px]">
                    {hours.map((hour) => (
                        <div key={hour} className="grid grid-cols-8 border-b border-slate-100 min-h-[80px]">
                            <div className="p-2 text-right text-xs text-slate-400 border-r border-slate-200 relative pr-4">
                                <span className="relative -top-3">{hour}:00</span>
                            </div>

                            {weekDays.map((dayObj, dayIdx) => {
                                const currentDayStr = format(dayObj, "yyyy-MM-dd");
                                const dayName = format(dayObj, "EEEE");
                                const appointment = appointments.find(a => a.date === currentDayStr && a.hour === hour);
                                const isExempt = timetableExemptions[currentDayStr]?.[hour];
                                const timetableSubject = isExempt ? undefined : timetable[dayName]?.[hour];

                                return (
                                    <div key={dayIdx} className="border-r border-slate-100 p-1 relative hover:bg-slate-50 transition-colors group">
                                        {appointment ? (
                                            <div className={`absolute inset-1 rounded-lg p-2 border shadow-sm flex flex-col justify-between overflow-hidden ${appointment.type === 'approved'
                                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                                : appointment.type === 'busy' ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-amber-50 border-amber-200 text-amber-800"
                                                }`}>
                                                <p className="text-[10px] sm:text-xs font-bold leading-tight truncate">{appointment.title}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] opacity-70 truncate">{appointment.student || 'Self'}</span>
                                                    {appointment.type === 'approved' && (
                                                        <button onClick={(e) => handleOpenCancelModal(e, appointment)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-red-600">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : timetableSubject ? (
                                            <div className="absolute inset-1 rounded-lg p-2 border border-indigo-200 bg-indigo-50 text-indigo-800 shadow-sm flex flex-col justify-between">
                                                <p className="text-[10px] sm:text-xs font-bold leading-tight truncate">{timetableSubject}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-medium px-1 bg-indigo-100 rounded text-indigo-600">Class</span>
                                                    <button onClick={(e) => handleRemoveTimetableSlot(e, currentDayStr, hour)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-red-500">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleOpenModal(currentDayStr, hour)} className="opacity-0 group-hover:opacity-100 absolute inset-1 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs hover:border-indigo-300 hover:text-indigo-500 transition-all">
                                                + Add
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Timetable Configuration Modal */}
            {isTimetableModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Configure Weekly Timetable</h2>
                                <p className="text-sm text-slate-500">Set recurring classes by clicking the grid below.</p>
                            </div>
                            <button onClick={() => setIsTimetableModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                                <label className="block text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" /> Selected Subject Name
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={currentSubject}
                                            onChange={(e) => setCurrentSubject(e.target.value)}
                                            placeholder="Type a subject name to start painting..."
                                            className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none pr-10"
                                        />
                                        {currentSubject && (
                                            <button onClick={() => setCurrentSubject("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-indigo-600 opacity-80">
                                    Tip: Click an existing class to "pick up" its name for editing or moving.
                                </p>
                            </div>

                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold w-24 border-r">Time</th>
                                            {workDays.map(day => <th key={day} className="px-4 py-3 font-semibold text-center border-r last:border-0">{day.substring(0, 3)}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {hours.map(hour => (
                                            <tr key={hour} className="hover:bg-slate-50/30">
                                                <td className="px-4 py-2 font-medium text-slate-400 border-r">{hour}:00</td>
                                                {workDays.map(day => {
                                                    const subject = timetable[day]?.[hour];
                                                    return (
                                                        <td key={`${day}-${hour}`} className="p-1 border-r last:border-0">
                                                            <button
                                                                onClick={() => toggleTimetableSlot(day, hour)}
                                                                className={cn(
                                                                    "w-full h-10 rounded-md transition-all border text-xs font-semibold px-2 truncate",
                                                                    subject ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "bg-transparent border-transparent hover:border-slate-200 text-transparent hover:text-slate-300"
                                                                )}
                                                            >
                                                                {subject || "+"}
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setIsTimetableModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-white border border-slate-300 rounded-lg">Cancel</button>
                            <button onClick={handleSaveTimetable} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">Save Timetable</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Slots Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900">Manage Slot</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleAddSlot} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <select value={slotData.date} onChange={e => setSlotData({ ...slotData, date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900">
                                    {weekDays.map((d, i) => <option key={i} value={format(d, 'yyyy-MM-dd')} className="text-slate-900">{format(d, 'EEEE, MMM d')}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                    <select value={slotData.hour} onChange={e => setSlotData({ ...slotData, hour: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900">
                                        {hours.map(h => <option key={h} value={h} className="text-slate-900">{h}:00</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select value={slotData.type} onChange={e => setSlotData({ ...slotData, type: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900">
                                        <option value="approved" className="text-slate-900">Available</option>
                                        <option value="busy" className="text-slate-900">Busy Slot</option>
                                        <option value="pending" className="text-slate-900">Pending</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input required type="text" value={slotData.title} onChange={e => setSlotData({ ...slotData, title: e.target.value })} placeholder="E.g., Office Hours, Meeting..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900 placeholder:text-slate-400" />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm">Save Slot</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Request Modal */}
            {rejectModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50">
                            <h2 className="text-lg font-bold text-red-800">Reject Request</h2>
                            <button onClick={() => setRejectModal({ isOpen: false, appointment: null })} className="text-red-400 hover:text-red-600 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleConfirmReject} className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-slate-600 mb-4">Please provide a reason for rejecting the request from <span className="font-bold text-slate-900">{rejectModal.appointment?.student}</span>.</p>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                                <textarea required rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="E.g., I am unavailable at this time..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-slate-900 placeholder:text-slate-400 resize-none"></textarea>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setRejectModal({ isOpen: false, appointment: null })} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">Confirm Rejection</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cancel Appointment Modal */}
            {cancelModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50">
                            <h2 className="text-lg font-bold text-red-800">Cancel Appointment</h2>
                            <button onClick={() => setCancelModal({ isOpen: false, appointment: null })} className="text-red-400 hover:text-red-600 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleConfirmCancel} className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-slate-600 mb-4">Are you sure you want to cancel the confirmed appointment with <span className="font-bold text-slate-900">{cancelModal.appointment?.student}</span>?</p>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cancellation Reason</label>
                                <textarea required rows={3} value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="E.g., Unexpected scheduling conflict..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-slate-900 placeholder:text-slate-400 resize-none"></textarea>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setCancelModal({ isOpen: false, appointment: null })} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Go Back</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">Cancel Appointment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
