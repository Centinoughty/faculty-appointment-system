"use client";

import { useRouter } from 'next/navigation';
// Adjust the import path to match your folder structure
// import useAuth from '@/hooks/useAuth'; 
import {
    Users, GraduationCap, Building2, CalendarCheck, Clock,
    PlusCircle, UserPlus, Building, Download, TriangleAlert
} from 'lucide-react';
import { mockStudents } from '@/src/constants/data';
import StatCard from '@/src/components/analytics/StatCard';
import ActionBtn from '@/src/components/analytics/ActionBtn';

export default function AnalyticsPage() {

    const router = useRouter();

    const handleFacultyCreateClick = () => {
        router.push('/faculties?mode=create');
    }

    const handleAddStudentClick = () => {
        router.push('/students?mode=create');
    }

    const handleAddDepartmentClick= () => {
        router.push('/departments?mode=create');
    }

    const handleExportClick = () => {
        // Implement export functionality here (e.g., generate CSV or PDF)
        alert('Exporting analytics data...');
    }

    // === ROUTE PROTECTION LOGIC ===
    // Uncomment when your useAuth hook is ready
    /*
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) return <div className="p-8">Loading dashboard...</div>;
    if (!isAuthenticated) return null; // Prevent flash of content before redirect
    */

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics Overview</h1>
                <p className="text-slate-500 mt-1 text-sm">Real-time statistics of NITC Faculty Appointment Management System</p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Students" value="4,250" trend="+12%" icon={Users} trendUp={true} />
                <StatCard title="Total Faculties" value="185" trend="+5%" icon={GraduationCap} trendUp={true} />
                <StatCard title="Departments" value="12" trend="0%" icon={Building2} trendUp={null} />
                <StatCard title="Appointments" value="840" trend="+18%" icon={CalendarCheck} trendUp={true} />
                <StatCard title="Avg. Response Time" value="1.2 hrs" trend="-15%" icon={Clock} trendUp={false} />
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
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">View All →</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-50 font-bold">
                            <tr>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4">ID Number</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">No-Show Count</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {mockStudents.map((student, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                            {student.initials}
                                        </div>
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{student.id}</td>
                                    <td className="px-6 py-4 text-slate-600">{student.dept}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold">
                                            {student.missed} Missed
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 font-semibold hover:text-blue-800 hover:underline">
                                            Send Warning
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}