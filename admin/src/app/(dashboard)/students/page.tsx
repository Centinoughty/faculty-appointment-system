"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    Plus, Filter, Download, Edit2, Trash2, Ban, Undo,
    Users, UserCheck, Fingerprint, X, AlertTriangle,
    Search
} from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

// --- DUMMY DATA GENERATOR --- //
const generateMockStudents = () => {
    const names = ['Aditi Sharma', 'Rahul Verma', 'Sneha Nair', 'Manoj Kumar', 'Priya Singh', 'David Wilson', 'Arjun Patel', 'Emily Chen'];
    const depts = ['CS', 'EC', 'EE', 'ME', 'CE', 'CH'];

    return Array.from({ length: 45 }, (_, i) => {
        const name = names[i % names.length];
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        const year = 20 + (i % 4);
        const dept = depts[i % depts.length];
        const idNum = String(500 + i).padStart(3, '0');
        const isBlacklisted = i % 10 === 2; // Some students are blacklisted
        const noShowCount = i === 3 ? 12 : i % 8; // Manoj Kumar gets 12, others vary

        return {
            id: `B${year}${idNum}${dept}`,
            name: name,
            initials: initials,
            email: `${name.split(' ')[0].toLowerCase()}_k@nitc.ac.in`,
            noShowCount: noShowCount,
            status: isBlacklisted ? 'Blacklisted' : 'Active',
            adminIntervention: noShowCount >= 10
        };
    });
};

export default function StudentManagementPage() {
    // --- STATE --- //
    const [students, setStudents] = useState(generateMockStudents());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        const mode = searchParams.get('mode');

        if (mode === 'create') {
            setIsAddModalOpen(true);
            const params = new URLSearchParams(searchParams.toString());
            params.delete('mode');

            const newRelativePathQuery = pathname + (params.toString() ? `?${params.toString()}` : '');
            window.history.replaceState(null, '', newRelativePathQuery);
        }
    }, [searchParams, pathname]);

    // --- DERIVED STATS --- //
    const stats = useMemo(() => {
        return {
            total: students.length,
            active: students.filter(s => s.status === 'Active').length,
            blacklisted: students.filter(s => s.status === 'Blacklisted').length,
            pendingBiometrics: 15 // Hardcoded for demo to match design
        };
    }, [students]);

    // --- PAGINATION LOGIC --- //
    const totalPages = Math.ceil(students.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentStudents = students.slice(startIndex, startIndex + itemsPerPage);

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handlePageClick = (page: number) => setCurrentPage(page);

    // --- DUMMY CRUD FUNCTIONS --- //
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;

        const newStudent = {
            id: (formData.get('studentId') as string).toUpperCase(),
            name: name,
            initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
            email: formData.get('email') as string,
            noShowCount: 0,
            status: 'Active',
            adminIntervention: false
        };

        setStudents([newStudent, ...students]);
        setIsAddModalOpen(false);
        setCurrentPage(1);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        setStudents(students.map(std => {
            if (std.id === selectedStudent.id) {
                return {
                    ...std,
                    name: formData.get('name') as string,
                    email: formData.get('email') as string,
                    id: (formData.get('studentId') as string).toUpperCase(),
                };
            }
            return std;
        }));
        setIsEditModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setStudents(students.filter(std => std.id !== selectedStudent.id));
        setIsDeleteModalOpen(false);
        if (currentStudents.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleToggleBlacklist = () => {
        setStudents(students.map(std => {
            if (std.id === selectedStudent.id) {
                return {
                    ...std,
                    status: std.status === 'Active' ? 'Blacklisted' : 'Active'
                };
            }
            return std;
        }));
        setIsBlacklistModalOpen(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total Students" value={stats.total.toLocaleString()} icon={Users} color="bg-blue-50 text-blue-600" />
                <StatCard title="Active Now" value={stats.active.toLocaleString()} icon={UserCheck} color="bg-emerald-50 text-emerald-600" />
                <StatCard title="Blacklisted" value={stats.blacklisted.toString()} icon={Ban} color="bg-red-50 text-red-500" />
                <StatCard title="Pending Biometrics" value={stats.pendingBiometrics.toString()} icon={Fingerprint} color="bg-amber-50 text-amber-500" />
            </div>

            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Directory</h1>
                    <p className="text-slate-500 mt-1 text-sm">Manage institutional student records, access permissions, and biometric logs.</p>
                </div>
                <div className='flex gap-10'>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="pl-10 pr-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm w-64 transition-all outline-none"
                        />
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-600/20 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Add Student
                    </button>

                </div>
            </div>

            {/* Main Data Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                {/* Table Toolbar */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h3 className="text-base font-bold text-slate-900">Enrolled Students</h3>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                            <Filter size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                            <Download size={18} />
                        </button>
                    </div>
                </div>

                {/* Table Wrapper */}
                <div className="overflow-x-auto">
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
                            {currentStudents.map((std) => (
                                <tr key={std.id} className="hover:bg-slate-50/80 transition-colors group bg-white">
                                    <td className="px-6 py-5 font-semibold text-slate-600 tracking-wide">
                                        {std.id}
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
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-white gap-4">
                    <span className="text-sm text-slate-500 font-medium">
                        Showing {currentStudents.length} of {students.length.toLocaleString()} students
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handlePrevPage} disabled={currentPage === 1}
                            className="px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>

                        {/* Pagination Numbers (1, 2, 3...) */}
                        <div className="flex items-center gap-1 mx-2">
                            {[1, 2, 3].map(page => (
                                page <= totalPages && (
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
                                )
                            ))}
                            {totalPages > 3 && <span className="text-slate-400 px-1">...</span>}
                        </div>

                        <button
                            onClick={handleNextPage} disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-sm font-semibold text-white bg-[#2563eb] rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Footer Area */}
            <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                <p>© 2024 National Institute of Technology Calicut. Faculty Appointment Management System.</p>
                <div className="flex items-center gap-6 font-medium">
                    <a href="#" className="hover:text-slate-900 transition-colors">System Status</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Admin Logs</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
                </div>
            </div>

            {/* ========================================================= */}
            {/* MODALS                                                    */}
            {/* ========================================================= */}

            {/* 1. Add Student Modal */}
            {isAddModalOpen && (
                <ModalOverlay onClose={() => setIsAddModalOpen(false)}>
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

            {/* 2. Edit Student Modal */}
            {isEditModalOpen && selectedStudent && (
                <ModalOverlay onClose={() => setIsEditModalOpen(false)}>
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h2 className="text-lg font-bold text-slate-900">Edit Student Record</h2>
                        <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Student ID</label>
                            <input name="studentId" defaultValue={selectedStudent.id} required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm uppercase" />
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

            {/* 3. Blacklist Toggle Modal */}
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

            {/* 4. Delete Confirmation Modal */}
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

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={24} strokeWidth={2} />
            </div>
            <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
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