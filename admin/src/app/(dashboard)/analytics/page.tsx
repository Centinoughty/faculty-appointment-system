"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Users, GraduationCap, Building2, CalendarCheck, Clock,
    PlusCircle, UserPlus, Building, Download, TriangleAlert, Loader2
} from 'lucide-react';
import StatCard from '@/src/components/analytics/StatCard';
import ActionBtn from '@/src/components/analytics/ActionBtn';
import { adminApi } from '@/src/api/admin';

// Interface for the table
interface NoShowStudent {
    id: number;
    name: string;
    initials: string;
    roll_number: string;
    dept: string;
    missed: number;
}

export default function AnalyticsPage() {
    const router = useRouter();

    // --- DYNAMIC STATE ---
    const [isLoading, setIsLoading] = useState(true);
    const [counts, setCounts] = useState({ students: 0, faculties: 0, departments: 0, appointments: 0, avg_response_hrs: 0 });
    const [noShowStudents, setNoShowStudents] = useState<NoShowStudent[]>([]);

    // --- FETCH ALL DATA ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);

                // Fetch real statistics from the new backend endpoint
                const statsRes = await adminApi.getStats();
                const { counts: backendCounts, no_show_threshold_students } = statsRes.data;

                setCounts({
                    students: backendCounts.students,
                    faculties: backendCounts.faculties,
                    departments: backendCounts.departments,
                    appointments: backendCounts.appointments,
                    avg_response_hrs: backendCounts.avg_response_hrs || 0
                });

                // Process real no-show students from the database
                const liveNoShows = no_show_threshold_students.map((s: any) => {
                    const roll = s.roll_number || 'N/A';
                    const deptMatch = roll.match(/[A-Za-z]+$/);
                    const dept = deptMatch ? deptMatch[0].toUpperCase() : 'N/A';

                    return {
                        id: s.id,
                        name: s.name,
                        initials: s.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
                        roll_number: roll,
                        dept: dept,
                        missed: s.no_show_count
                    };
                });

                setNoShowStudents(liveNoShows);

            } catch (error) {
                console.error("Failed to load analytics data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // --- HANDLERS ---
    const handleFacultyCreateClick = () => router.push('/faculties?mode=create');
    const handleAddStudentClick = () => router.push('/students?mode=create');
    const handleAddDepartmentClick = () => router.push('/departments?mode=create');
    
    const handleExportClick = async () => {
        try {
            const response = await adminApi.exportAppointments();
            
            // Create a link and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `appointments_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export data. Please try again.");
        }
    };


    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Gathering real-time analytics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics Overview</h1>
                <p className="text-slate-500 mt-1 text-sm">Real-time statistics of NITC Faculty Appointment Management System</p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Students" value={counts.students.toLocaleString()} trend="+12%" icon={Users} trendUp={true} />
                <StatCard title="Total Faculties" value={counts.faculties.toLocaleString()} trend="+5%" icon={GraduationCap} trendUp={true} />
                <StatCard title="Departments" value={counts.departments.toString()} trend="0%" icon={Building2} trendUp={null} />

                {/* Dynamically display actual appointments count */}
                <StatCard title="Appointments" value={counts.appointments.toLocaleString()} trend="+18%" icon={CalendarCheck} trendUp={true} />
                <StatCard title="Avg. Response Time" value={`${counts.avg_response_hrs} hrs`} trend="-15%" icon={Clock} trendUp={false} />
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <button onClick={handleFacultyCreateClick} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
                        <PlusCircle size={18} />
                        Create Faculty
                    </button>
                    <ActionBtn icon={UserPlus} label="Add Student" onClick={handleAddStudentClick} />
                    <ActionBtn icon={Building} label="Add Department" onClick={handleAddDepartmentClick} />
                    <ActionBtn icon={Download} label="Export Analytics (CSV/PDF)" onClick={handleExportClick} />
                </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TriangleAlert className="text-red-500" size={20} />
                        <div>
                            <h3 className="text-base font-bold text-red-600">Frequent 'No Show' Students</h3>
                            <p className="text-xs text-slate-500">Students flagged for exceeding the threshold of 2 missed appointments in the current semester</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-50 font-bold">
                            <tr>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4">Roll Number</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">No-Show Count</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {noShowStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                        No students found in the database.
                                    </td>
                                </tr>
                            ) : (
                                noShowStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                {student.initials}
                                            </div>
                                            {student.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-semibold">{student.roll_number}</td>
                                        <td className="px-6 py-4 text-slate-600 font-semibold">{student.dept}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold">
                                                {student.missed} Missed
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-slate-400 italic text-[10px]">No action required</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}