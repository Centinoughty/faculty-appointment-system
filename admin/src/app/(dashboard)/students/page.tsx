"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
    Plus, Filter, Download, Edit2, Trash2, Ban, Undo,
    Users, UserCheck, Fingerprint, X, AlertTriangle,
    Search, UploadCloud, Loader2
} from 'lucide-react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { adminApi } from '@/src/api/admin';
import { Student } from '@/src/types/type';
import { toast } from 'sonner';

export default function StudentManagementPage() {
    // --- STATE --- //
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Bulk Upload State & Ref
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // --- FETCH DATA --- //
    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await adminApi.getStudents();

            // Map the backend data to fit our beautiful UI
            const formattedStudents = data.map((std: any) => {
                let status = 'Active';
                if (std.is_blacklisted || std.no_show_count >= 3) status = 'Blacklisted';
                else if (std.no_show_count > 0) status = 'Warning';

                return {
                    id: std.id,
                    roll_number: std.roll_number || 'PENDING',
                    name: std.name,
                    initials: std.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
                    email: std.email,
                    noShowCount: std.no_show_count || 0,
                    status: status,
                    adminIntervention: std.no_show_count >= 2
                };
            });

            setStudents(formattedStudents);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // Handle '?mode=create' in URL
    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'create') {
            setIsAddModalOpen(true);
            const params = new URLSearchParams(searchParams.toString());
            params.delete('mode');
            const newRelativePathQuery = pathname + (params.toString() ? `?${params.toString()}` : '');
            router.replace(newRelativePathQuery);
        }
    }, [searchParams, pathname, router]);


    // --- DERIVED STATS --- //
    const stats = useMemo(() => {
        return {
            total: students.length,
            goodStanding: students.filter(s => s.noShowCount === 0).length,
            blacklisted: students.filter(s => s.noShowCount >= 3).length,
            warnings: students.filter(s => s.noShowCount > 0 && s.noShowCount < 3).length
        };
    }, [students]);

    // --- SEARCH & PAGINATION LOGIC --- //
    const filteredStudents = students.filter(std =>
        std.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handlePageClick = (page: number) => setCurrentPage(page);

    // --- ASYNC CRUD FUNCTIONS --- //

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        // Match the StudentBase schema in backend
        const studentData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            roll_number: (formData.get('studentId') as string).toUpperCase()
        };

        try {
            await adminApi.createStudent(studentData);
            setIsAddModalOpen(false);
            await fetchStudents(); // Refresh table
            setCurrentPage(1);
            toast.success("Student added successfully!");
        } catch (error: any) {
            console.error("Error creating student:", error);
            toast.error(error.response?.data?.detail || "Failed to add student");
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        const formData = new FormData(e.target as HTMLFormElement);

        const studentData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            roll_number: (formData.get('studentId') as string).toUpperCase()
        };

        try {
            await adminApi.updateStudent(selectedStudent.id, studentData);
            setIsEditModalOpen(false);
            await fetchStudents();
            toast.success("Student updated successfully!");
        } catch (error: any) {
            console.error("Error updating student:", error);
            toast.error(error.response?.data?.detail || "Failed to update student");
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedStudent) return;

        try {
            await adminApi.deleteStudent(selectedStudent.id);
            setIsDeleteModalOpen(false);
            await fetchStudents();

            if (currentStudents.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
            toast.success("Student deleted successfully!");
        } catch (error: any) {
            console.error("Error deleting student:", error);
            toast.error(error.response?.data?.detail || "Failed to delete student");
        }
    };

    // Bulk Upload Handler
    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await adminApi.uploadBulkStudents(formData);
            await fetchStudents(); // Refresh the table automatically
            setCurrentPage(1); // Reset pagination

            // Show success message with count based on your backend response format
            const createdCount = response.data.created_students?.length || 0;
            toast.success(`Successfully uploaded ${createdCount} students!`);

        } catch (error: any) {
            console.error("Error bulk uploading:", error);
            toast.error(error.response?.data?.detail || "Failed to process bulk upload.");
        } finally {
            setIsUploading(false);
            // Clear the input value so the same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleToggleBlacklist = async () => {
        if (!selectedStudent) return;
        try {
            await adminApi.toggleBlacklist(selectedStudent.id);
            await fetchStudents();
            setIsBlacklistModalOpen(false);
            toast.success("Student access updated successfully");
        } catch (error) {
            console.error("Error toggling blacklist status:", error);
            toast.error("Failed to update student access");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                <StatCard title="Total Students" value={stats.total} icon={Users} color="bg-blue-50 text-blue-600" />
                <StatCard title="Blacklisted" value={stats.blacklisted} icon={Ban} color="bg-red-50 text-red-600" />
            </div>

            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Directory</h1>
                    <p className="text-slate-500 mt-1 text-sm">Manage institutional student records, access permissions, and biometric logs.</p>
                </div>

                <div className='flex flex-wrap sm:flex-nowrap gap-4 sm:gap-6 lg:gap-10'>

                    {/* WIRED UP SEARCH INPUT */}
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // Reset to page 1 on search
                            }}
                            className="pl-10 pr-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm w-full sm:w-64 transition-all outline-none"
                        />
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleBulkUpload}
                            className="hidden"
                        />

                        {/* Secondary Bulk Upload Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 className="animate-spin text-slate-400" size={18} /> : <UploadCloud size={18} />}
                            Bulk Upload
                        </button>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-600/20 transition-all active:scale-95"
                        >
                            <Plus size={18} />
                            Add Student
                        </button>
                    </div>

                </div>
            </div>

            {/* Main Data Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h3 className="text-base font-bold text-slate-900">Enrolled Students</h3>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {isLoading ? (
                        <div className="p-10 flex justify-center text-slate-500">Loading students...</div>
                    ) : (
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-white font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Student ID</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">No-Show Count</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-slate-500">No students found.</td>
                                    </tr>
                                ) : (
                                    currentStudents.map((std) => (
                                        <tr key={std.id} className="hover:bg-slate-50/80 transition-colors group bg-white">
                                            <td className="px-6 py-5 font-semibold text-slate-600 tracking-wide">
                                                {std.roll_number}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${std.status === 'Blacklisted' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#2563eb]'
                                                        }`}>
                                                        {std.initials}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900">{std.name}</span>
                                                        {std.adminIntervention && (
                                                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-red-600 mt-0.5">
                                                                Admin Intervention
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-slate-500">{std.email}</td>
                                            <td className="px-6 py-5 font-semibold">
                                                <span className={std.noShowCount >= 10 ? "text-red-600 font-bold" : "text-slate-600"}>
                                                    {String(std.noShowCount).padStart(2, '0')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${std.status === 'Active'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {std.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setSelectedStudent(std); setIsEditModalOpen(true); }}
                                                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded-md transition-colors"
                                                        title="Edit Record"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedStudent(std); setIsBlacklistModalOpen(true); }}
                                                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md transition-colors"
                                                        title={std.status === 'Active' ? "Blacklist Student" : "Restore Access"}
                                                    >
                                                        {std.status === 'Active' ? <Ban size={16} /> : <Undo size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedStudent(std); setIsDeleteModalOpen(true); }}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                                                        title="Delete Student"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-white gap-4">
                    <span className="text-sm text-slate-500 font-medium">
                        Showing {currentStudents.length} of {filteredStudents.length.toLocaleString()} students
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handlePrevPage} disabled={currentPage === 1}
                            className="px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1 mx-2">
                            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageClick(page)}
                                    className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-lg transition-colors ${currentPage === page
                                        ? 'bg-[#2563eb] text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            {totalPages > 3 && <span className="text-slate-400 px-1">...</span>}
                        </div>

                        <button
                            onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1.5 text-sm font-semibold text-white bg-[#2563eb] rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

           

            {/* ========================================================= */}
            {/* MODALS                                                    */}
            {/* ========================================================= */}

            {/* Add Student Form */}
            {isAddModalOpen && (
                <ModalOverlay onClose={() => setIsAddModalOpen(false)}>
                    {/* ... (Header) ... */}
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h2 className="text-lg font-bold text-slate-900">Add New Student</h2>
                        <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Student ID (Roll No)</label>
                            <input name="studentId" required type="text" placeholder="e.g. B200500CS" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm uppercase" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Full Name</label>
                            <input name="name" required type="text" placeholder="e.g. Aditi Sharma" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Institutional Email</label>
                            <input name="email" required type="email" placeholder="e.g. aditi_k@nitc.ac.in" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Add Student</button>
                        </div>
                    </form>
                </ModalOverlay>
            )}

            {/* Edit Student Modal */}
            {isEditModalOpen && selectedStudent && (
                <ModalOverlay onClose={() => setIsEditModalOpen(false)}>
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h2 className="text-lg font-bold text-slate-900">Edit Student Record</h2>
                        <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Student ID</label>
                            <input name="studentId" defaultValue={selectedStudent.roll_number} required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm uppercase" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Full Name</label>
                            <input name="name" defaultValue={selectedStudent.name} required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Email Address</label>
                            <input name="email" defaultValue={selectedStudent.email} required type="email" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Save Changes</button>
                        </div>
                    </form>
                </ModalOverlay>
            )}

            {/* Blacklist Modal */}
            {isBlacklistModalOpen && selectedStudent && (
                <ModalOverlay onClose={() => setIsBlacklistModalOpen(false)}>
                    <div className="p-6 flex flex-col items-center text-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${selectedStudent.status === 'Active' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                            {selectedStudent.status === 'Active' ? <Ban size={24} /> : <Undo size={24} />}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            {selectedStudent.status === 'Active' ? 'Blacklist Student?' : 'Restore Access?'}
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">
                            {selectedStudent.status === 'Active'
                                ? `Are you sure you want to blacklist ${selectedStudent.name}? They will not be able to book any further appointments.`
                                : `Are you sure you want to restore access for ${selectedStudent.name}? Their booking privileges will be reinstated.`}
                        </p>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => setIsBlacklistModalOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                            <button
                                onClick={handleToggleBlacklist}
                                className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${selectedStudent.status === 'Active' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                            >
                                {selectedStudent.status === 'Active' ? 'Confirm Blacklist' : 'Restore Access'}
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedStudent && (
                <ModalOverlay onClose={() => setIsDeleteModalOpen(false)}>
                    <div className="p-6 flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Student Record?</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to permanently remove <strong>{selectedStudent.name}</strong> from the system? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="flex-1 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm">Delete Record</button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

        </div>
    );
}

// --- REUSABLE SUB-COMPONENTS --- //

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number | string, icon: any, color: string }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={24} strokeWidth={2} />
            </div>
            <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
                <p className="text-2xl font-black text-slate-900 leading-none">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            </div>
        </div>
    );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
                {children}
            </div>
        </div>
    );
}