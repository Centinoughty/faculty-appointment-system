import React, { useState, useEffect } from "react";
import { format, addDays, startOfWeek, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Filter, Upload, Calendar as CalendarIcon, BookOpen, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { facultyApi } from "@/api/faculty.api";
import { Appointment, AvailabilitySlot, TimetableEntry, TimetableExemption } from "@/types/faculty";

export default function CalendarView({ appointments, refreshAppointments }: { appointments: Appointment[], refreshAppointments: () => Promise<void> }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);

    // Backend data state
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    
    // Store subjects keyed by DayName -> Hour -> Subject Name
    const [timetable, setTimetable] = useState<Record<string, Record<number, string>>>({});
    
    // Store cancelled recurrent slots keyed by Date (yyyy-MM-dd) -> Hour -> exemption id
    const [timetableExemptions, setTimetableExemptions] = useState<Record<string, Record<number, number>>>({});

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [availRes, ttRes, exRes] = await Promise.all([
                facultyApi.getAvailability(),
                facultyApi.getTimetable(),
                facultyApi.getExemptions()
            ]);

            setAvailability(availRes.data);

            // Transform Timetable Array to Day -> Hour -> Subject map
            const newTt: Record<string, Record<number, string>> = {};
            // 0=Monday, ..., 6=Sunday for ease.
            const dayNamesArr = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]; // 1 to 5 mapped
            ttRes.data.forEach((entry: TimetableEntry) => {
                // Warning: Backend day_of_week might be 0=Monday.
                const dtName = dayNamesArr[entry.day_of_week]; 
                if (dtName) {
                    if (!newTt[dtName]) newTt[dtName] = {};
                    newTt[dtName][entry.hour] = entry.subject;
                }
            });
            setTimetable(newTt);

            // Transform Exemptions to Date -> Hour -> ExemptionID map
            const newEx: Record<string, Record<number, number>> = {};
            exRes.data.forEach((ex: TimetableExemption) => {
                if (!newEx[ex.date]) newEx[ex.date] = {};
                newEx[ex.date][ex.hour] = ex.id;
            });
            setTimetableExemptions(newEx);
            
            await refreshAppointments();
        } catch (error) {
            console.error("Failed to fetch calendar data", error);
            toast.error("Failed to load calendar data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Generate a simple week view
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const hours = Array.from({ length: 9 }).map((_, i) => i + 9); // 9 AM to 5 PM
    const workDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    // Calendar Navigation Functions
    const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
    const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const handleToday = () => setCurrentDate(new Date());

    // Modal state for Slots
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [slotData, setSlotData] = useState({ date: "", hour: 9, title: "", slot_type: "available" });

    // Modals for Actions
    const [cancelModal, setCancelModal] = useState<{ isOpen: boolean, appointment: Appointment | null }>({ isOpen: false, appointment: null });
    const [cancelReason, setCancelReason] = useState("");
    
    // Slot Queue Management Modal
    const [queueModal, setQueueModal] = useState<{ isOpen: boolean, date: string, hour: number, apps: Appointment[] }>({ isOpen: false, date: "", hour: 0, apps: [] });

    // Modal state for Timetable Configuration
    const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            await facultyApi.uploadTimetable(file);
            toast.success("Timetable uploaded successfully!");
            fetchData();
            setIsTimetableModalOpen(false);
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Failed to upload timetable. Please check the CSV format.");
        } finally {
            setIsUploading(false);
            if (event.target) event.target.value = ''; // Reset input
        }
    };

    const handleOpenModal = (dateStr = format(weekDays[0], "yyyy-MM-dd"), hour = 9) => {
        setSlotData({ date: dateStr, hour, title: "", slot_type: "available" });
        setIsModalOpen(true);
    };

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await facultyApi.createAvailability(slotData);
            toast.success(`Slot added successfully!`);
            setIsModalOpen(false);
            fetchData(); // Refresh data to see new slot
        } catch (error) {
            console.error(error);
            toast.error("Failed to add slot.");
        }
    };

    const handleDeleteSlot = async (e: React.MouseEvent, slotId: number) => {
        e.stopPropagation();
        try {
            await facultyApi.deleteAvailability(slotId);
            toast.success("Slot removed.");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove slot.");
        }
    };

    const handleOpenCancelModal = (e: React.MouseEvent, appointment: Appointment) => {
        e.stopPropagation();
        setCancelModal({ isOpen: true, appointment });
        setCancelReason("");
    };

    const handleConfirmCancel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cancelModal.appointment) {
            try {
                // Assuming we use patch for cancelling confirmed appointments
                await facultyApi.cancelAppointment(cancelModal.appointment.id);
                toast.success(`Appointment cancelled.`);
                fetchData();
                setCancelModal({ isOpen: false, appointment: null });
            } catch (error) {
                console.error(error);
                toast.error("Failed to cancel appointment.");
            }
        }
    };

    const handleApproveFromQueue = async (id: number) => {
        try {
            await facultyApi.updateAppointmentStatus(id, 'approved');
            toast.success("Appointment Approved. Overlapping requests auto-denied.");
            setQueueModal(prev => ({ ...prev, isOpen: false }));
            fetchData();
        } catch(e) {
            console.error(e);
            toast.error("Failed to approve appointment.");
        }
    };

    const handleDeclineFromQueue = async (id: number) => {
        try {
            await facultyApi.updateAppointmentStatus(id, 'rejected');
            toast.success("Request Declined.");
            setQueueModal(prev => ({ ...prev, isOpen: false }));
            fetchData();
        } catch(e) {
            console.error(e);
            toast.error("Failed to decline request.");
        }
    };

    /**
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

    const handleSaveTimetable = async () => {
        try {
            const entries: { day_of_week: number; hour: number; subject: string }[] = [];
            const dayNamesArr = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
            
            Object.keys(timetable).forEach(dayName => {
                const day_of_week = dayNamesArr.indexOf(dayName);
                if (day_of_week !== -1) {
                    Object.keys(timetable[dayName]).forEach(hourStr => {
                        entries.push({
                            day_of_week,
                            hour: parseInt(hourStr),
                            subject: timetable[dayName][parseInt(hourStr)]
                        });
                    });
                }
            });

            await facultyApi.saveTimetable(entries);
            toast.success("Weekly timetable saved successfully!");
            setIsTimetableModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save timetable.");
        }
    };

    const handleRemoveTimetableSlot = async (e: React.MouseEvent, dateStr: string, hour: number) => {
        e.stopPropagation();
        try {
            await facultyApi.createExemption({ date: dateStr, hour });
            toast.success("Class cancelled for this day");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to cancel class.");
        }
    };

    const handleRestoreTimetableSlot = async (e: React.MouseEvent, exemptionId: number) => {
        e.stopPropagation();
        try {
            await facultyApi.deleteExemption(exemptionId);
            toast.success("Class restored for this day");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to restore class.");
        }
    };

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 w-48">
                        {format(currentDate, "MMMM yyyy")}
                    </h1>
                    <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                        <button onClick={handlePrevWeek} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={handleToday} className="text-sm font-medium px-2 text-gray-700 hover:text-gray-900 transition-colors">Today</button>
                        <button onClick={handleNextWeek} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 mr-2 md:mr-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Class</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Approved</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending</span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsTimetableModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            <CalendarIcon className="w-4 h-4 hidden sm:block" />
                            <span>Timetable</span>
                        </button>
                        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-md transition-all whitespace-nowrap">
                            + Manage Slots
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 border border-gray-200 rounded-2xl overflow-hidden flex flex-col bg-white shadow-sm">
                {/* Days Header */}
                <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                    <div className="p-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">Time</div>
                    {weekDays.map((day, i) => (
                        <div key={i} className="p-2 sm:p-3 text-center border-r border-gray-200 last:border-0">
                            <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{format(day, "EEE")}</span>
                            <div className={`text-sm sm:text-xl font-bold mt-0.5 ${format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? "text-blue-600" : "text-gray-800"}`}>
                                {format(day, "dd")}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Time Grid */}
                <div className="flex-1 overflow-y-auto min-h-[500px]">
                    {hours.map((hour) => (
                        <div key={hour} className="grid grid-cols-8 border-b border-gray-100 min-h-[80px]">
                            <div className="p-2 text-right text-xs text-gray-400 border-r border-gray-200 relative pr-4">
                                <span className="relative -top-3">{hour}:00</span>
                            </div>

                            {weekDays.map((dayObj, dayIdx) => {
                                const currentDayStr = format(dayObj, "yyyy-MM-dd");
                                const dayName = format(dayObj, "EEEE");
                                
                                // Appointments logic
                                // Appointments backend time might be HH:MM:SS or HH:MM. We can parse the hour.
                                const slotAppointments = appointments.filter(a => {
                                    if (a.date !== currentDayStr) return false;
                                    try {
                                        const h = parseInt(a.time.split(':')[0]);
                                        return h === hour;
                                    } catch { return false; }
                                });
                                
                                const confirmedCount = slotAppointments.filter(a => a.status === 'approved').length;
                                const pendingCount = slotAppointments.filter(a => a.status === 'pending').length;
                                
                                // Availability Slot logic
                                const availSlot = availability.find(a => a.date === currentDayStr && a.hour === hour);

                                // Timetable logic
                                const exemptionId = timetableExemptions[currentDayStr]?.[hour];
                                const isExempt = !!exemptionId;
                                const timetableSubject = isExempt ? undefined : timetable[dayName]?.[hour];

                                return (
                                    <div key={dayIdx} className="border-r border-gray-100 p-1 relative hover:bg-gray-50 transition-colors group">
                                        {slotAppointments.length > 0 ? (
                                            <div 
                                                onClick={() => setQueueModal({ isOpen: true, date: currentDayStr, hour, apps: slotAppointments })}
                                                className={`absolute inset-1 rounded-lg p-2 border shadow-sm flex flex-col justify-center items-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all ${
                                                    confirmedCount > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                                    : "bg-amber-50 border-amber-200 text-amber-800"
                                                }`}
                                            >
                                                <p className="text-[10px] sm:text-xs font-bold leading-tight truncate text-center">
                                                    {confirmedCount > 0 ? "1 Confirmed" : `${pendingCount} Pending`}
                                                </p>
                                                {(pendingCount > 0 && confirmedCount > 0) && (
                                                    <span className="text-[9px] mt-0.5 opacity-80 text-center">{pendingCount} Waiting</span>
                                                )}
                                            </div>
                                        ) : availSlot ? (
                                            <div className={`absolute inset-1 rounded-lg p-2 border shadow-sm flex flex-col justify-between overflow-hidden ${availSlot.slot_type === 'available'
                                                ? "bg-purple-50 border-purple-200 text-purple-800"
                                                : "bg-gray-100 border-gray-300 text-gray-700"
                                                }`}>
                                                <p className="text-[10px] sm:text-xs font-bold leading-tight truncate">{availSlot.title || (availSlot.slot_type === 'available' ? 'Available' : 'Busy')}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] opacity-70 truncate">Set Slot</span>
                                                    <button onClick={(e) => handleDeleteSlot(e, availSlot.id)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-red-600">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : timetableSubject ? (
                                            <div className="absolute inset-1 rounded-lg p-2 border border-blue-200 bg-blue-50 text-blue-800 shadow-sm flex flex-col justify-between">
                                                <p className="text-[10px] sm:text-xs font-bold leading-tight truncate">{timetableSubject}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-medium px-1 bg-blue-100 rounded text-blue-600">Class</span>
                                                    <button onClick={(e) => handleRemoveTimetableSlot(e, currentDayStr, hour)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-red-500" title="Cancel this class">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : isExempt ? (
                                             <div className="absolute inset-1 rounded-lg p-2 border border-gray-200 bg-gray-50 text-gray-400 shadow-sm flex flex-col justify-between line-through opacity-70">
                                                <p className="text-[10px] sm:text-xs font-bold leading-tight truncate">Class Cancelled</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-medium px-1 text-gray-500">Exempted</span>
                                                    <button onClick={(e) => handleRestoreTimetableSlot(e, exemptionId)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-green-100 text-green-500" title="Restore this class">
                                                        <X className="w-3 h-3 rotate-45" /> {/* Use rotated X as a plus/restore symbol or just normal X to un-exempt */}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleOpenModal(currentDayStr, hour)} className="opacity-0 group-hover:opacity-100 absolute inset-1 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xs hover:border-blue-300 hover:text-blue-500 transition-all cursor-pointer">
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Configure Weekly Timetable</h2>
                                <p className="text-sm text-gray-500">Set recurring classes by clicking the grid below.</p>
                            </div>
                            <button onClick={() => setIsTimetableModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" /> Selected Subject Name
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={currentSubject}
                                            onChange={(e) => setCurrentSubject(e.target.value)}
                                            placeholder="Type a subject name to start painting..."
                                            className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10 text-gray-900 placeholder:text-gray-400 font-medium"
                                        />
                                        {currentSubject && (
                                            <button onClick={() => setCurrentSubject("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-blue-600 opacity-80">
                                    Tip: Click an existing class to "pick up" its name for editing or moving.
                                </p>
                            </div>

                            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold w-24 border-r">Time</th>
                                            {workDays.map(day => <th key={day} className="px-4 py-3 font-semibold text-center border-r last:border-0">{day.substring(0, 3)}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {hours.map(hour => (
                                            <tr key={hour} className="hover:bg-gray-50/30">
                                                <td className="px-4 py-2 font-medium text-gray-400 border-r">{hour}:00</td>
                                                {workDays.map(day => {
                                                    const subject = timetable[day]?.[hour];
                                                    return (
                                                        <td key={`${day}-${hour}`} className="p-1 border-r last:border-0">
                                                            <button
                                                                onClick={() => toggleTimetableSlot(day, hour)}
                                                                className={cn(
                                                                    "w-full h-10 rounded-md transition-all border text-xs font-semibold px-2 truncate",
                                                                    subject ? "bg-blue-100 border-blue-300 text-blue-900 text-[13px]" : "bg-transparent border-transparent hover:border-gray-200 text-transparent hover:text-gray-300"
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

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-3 flex-wrap">
                            <div>
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    id="timetable-csv-upload"
                                    onChange={handleFileUpload}
                                />
                                <label
                                    htmlFor="timetable-csv-upload"
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    {isUploading ? "Uploading..." : "Upload CSV"}
                                </label>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setIsTimetableModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-white border border-gray-300 rounded-lg">Cancel</button>
                                <button onClick={handleSaveTimetable} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">Save Timetable</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Slots Modal (Availability/Busy) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">Manage Slot</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleAddSlot} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <select value={slotData.date} onChange={e => setSlotData({ ...slotData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white">
                                    {weekDays.map((d, i) => <option key={i} value={format(d, 'yyyy-MM-dd')} className="text-gray-900">{format(d, 'EEEE, MMM d')}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <select value={slotData.hour} onChange={e => setSlotData({ ...slotData, hour: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white">
                                        {hours.map(h => <option key={h} value={h} className="text-gray-900">{h}:00</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select value={slotData.slot_type} onChange={e => setSlotData({ ...slotData, slot_type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white">
                                        <option value="available" className="text-gray-900">Available</option>
                                        <option value="busy" className="text-gray-900">Busy Slot</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                                <input type="text" value={slotData.title} onChange={e => setSlotData({ ...slotData, title: e.target.value })} placeholder="E.g., Office Hours, Meeting..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400" />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Save Slot</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cancel Appointment Modal */}
            {cancelModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
                            <h2 className="text-lg font-bold text-red-800">Cancel Appointment</h2>
                            <button onClick={() => setCancelModal({ isOpen: false, appointment: null })} className="text-red-400 hover:text-red-600 text-xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleConfirmCancel} className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-4">Are you sure you want to cancel the confirmed appointment with <span className="font-bold text-gray-900">{cancelModal.appointment?.student_name}</span>?</p>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">Cancellation Reason <span className="text-gray-400 text-xs italic">Optional for now</span></label>
                                <textarea rows={3} value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="E.g., Unexpected scheduling conflict..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-gray-900 placeholder:text-gray-400 resize-none"></textarea>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setCancelModal({ isOpen: false, appointment: null })} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Go Back</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">Cancel Appointment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Queue Manager Modal */}
            {queueModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50">
                            <div>
                                <h2 className="text-lg font-bold text-blue-900">Slot Manager</h2>
                                <p className="text-xs text-blue-700 font-medium">{format(parseISO(queueModal.date), "EEEE, MMM d")} at {queueModal.hour}:00</p>
                            </div>
                            <button onClick={() => setQueueModal({ isOpen: false, date: "", hour: 0, apps: [] })} className="text-blue-400 hover:text-blue-600 text-xl font-bold">&times;</button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            {queueModal.apps.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No requests found for this slot.</p>
                            ) : queueModal.apps.map(app => (
                                <div key={app.id} className={`p-4 rounded-xl border ${app.status === 'approved' ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-white shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{app.student_name}</h3>
                                            <p className="text-xs text-gray-500">{app.purpose || 'No purpose provided'}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        {app.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleDeclineFromQueue(app.id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors">Decline</button>
                                                <button onClick={() => handleApproveFromQueue(app.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-sm">Approve Student</button>
                                            </>
                                        )}
                                        {app.status === 'approved' && (
                                            <button 
                                                onClick={(e) => { setQueueModal({ isOpen: false, date: "", hour: 0, apps: [] }); handleOpenCancelModal(e, app); }} 
                                                className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
                                            >
                                                Cancel Appointment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {queueModal.apps.some(a => a.status === 'pending') && (
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                                <p className="text-xs text-gray-500 italic text-center">Approving a pending request will automatically decline all others for this hour.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
