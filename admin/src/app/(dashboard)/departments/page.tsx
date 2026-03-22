"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    Plus, Filter, Download, Edit2, Trash2,
    Building2, Users, CheckCircle2, LayoutGrid, X, AlertTriangle,
    Search
} from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

// --- DUMMY DATA GENERATOR --- //
const generateMockDepartments = () => {
    const depts = [
        { code: 'CSE', name: 'Computer Science & Engineering', head: 'Dr. John Smith', count: 42, status: 'Active' },
        { code: 'ECE', name: 'Electronics & Communication', head: 'Dr. Sarah Parker', count: 38, status: 'Active' },
        { code: 'EEE', name: 'Electrical & Electronics', head: 'Dr. Jane Doe', count: 35, status: 'Active' },
        { code: 'MEC', name: 'Mechanical Engineering', head: 'Dr. Amit Kumar', count: 45, status: 'Active' },
        { code: 'CIV', name: 'Civil Engineering', head: 'Dr. Rahul Verma', count: 40, status: 'Active' },
        { code: 'CHE', name: 'Chemical Engineering', head: 'Dr. Emily Chen', count: 28, status: 'Active' },
        { code: 'ARC', name: 'Architecture & Planning', head: 'Ar. David Wilson', count: 22, status: 'Active' },
        { code: 'MAT', name: 'Mathematics', head: 'Dr. Robert Brown', count: 25, status: 'Active' },
        { code: 'PHY', name: 'Physics', head: 'Dr. Priya Singh', count: 20, status: 'Active' },
        { code: 'CHY', name: 'Chemistry', head: 'Dr. Michael Chang', count: 18, status: 'Under Maintenance' },
        { code: 'SMC', name: 'School of Management', head: 'Dr. Anita Roy', count: 15, status: 'Active' },
        { code: 'SBT', name: 'School of Biotechnology', head: 'Dr. Kiran Patel', count: 12, status: 'Active' },
    ];

    return depts.map((d, i) => ({
        id: `D${String(i + 1).padStart(2, '0')}`,
        ...d
    }));
};

export default function DepartmentManagementPage() {
    // --- STATE --- //
    const [departments, setDepartments] = useState(generateMockDepartments());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Showing slightly more per page as depts are fewer

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedDept, setSelectedDept] = useState<any>(null);

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
        const totalFaculty = departments.reduce((sum, d) => sum + d.count, 0);
        return {
            total: departments.length,
            active: departments.filter(d => d.status === 'Active').length,
            totalFaculty: totalFaculty,
            avgFaculty: Math.round(totalFaculty / departments.length) || 0
        };
    }, [departments]);

    // --- PAGINATION LOGIC --- //
    const totalPages = Math.ceil(departments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentDepartments = departments.slice(startIndex, startIndex + itemsPerPage);

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handlePageClick = (page: number) => setCurrentPage(page);

    // --- DUMMY CRUD FUNCTIONS --- //
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        const newDept = {
            id: `D${String(departments.length + 1).padStart(2, '0')}`,
            code: (formData.get('code') as string).toUpperCase(),
            name: formData.get('name') as string,
            head: formData.get('head') as string,
            count: 0, // New departments start with 0 faculty
            status: 'Active'
        };

        setDepartments([newDept, ...departments]);
        setIsAddModalOpen(false);
        setCurrentPage(1);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        setDepartments(departments.map(dept => {
            if (dept.id === selectedDept.id) {
                return {
                    ...dept,
                    code: (formData.get('code') as string).toUpperCase(),
                    name: formData.get('name') as string,
                    head: formData.get('head') as string,
                };
            }
            return dept;
        }));
        setIsEditModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setDepartments(departments.filter(dept => dept.id !== selectedDept.id));
        setIsDeleteModalOpen(false);
        if (currentDepartments.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total Departments" value={stats.total} icon={Building2} color="bg-indigo-50 text-indigo-600" />
                <StatCard title="Active Departments" value={stats.active} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
                <StatCard title="Total Faculty Assigned" value={stats.totalFaculty} icon={Users} color="bg-blue-50 text-blue-600" />
                <StatCard title="Avg. Faculty per Dept" value={stats.avgFaculty} icon={LayoutGrid} color="bg-amber-50 text-amber-500" />
            </div>

            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Departments</h1>
                    <p className="text-slate-500 mt-1 text-sm">Manage institute faculties, department heads, and structural organization.</p>
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
                        Add Department
                    </button>

                </div>
            </div>

            {/* Main Data Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                {/* Table Toolbar */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h3 className="text-base font-bold text-slate-900">Department Directory</h3>
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
                        <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50/80 font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Department Details</th>
                                <th className="px-6 py-4">Head of Department</th>
                                <th className="px-6 py-4">Faculty Count</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentDepartments.map((dept) => (
                                <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors group bg-white">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-black tracking-tight border border-indigo-100 shrink-0">
                                                {dept.code}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{dept.name}</span>
                                                <span className="text-[11px] font-semibold text-slate-500 mt-0.5">ID: {dept.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                {dept.head.split(' ').pop()?.[0]}
                                            </div>
                                            <span className="text-slate-700 font-medium">{dept.head}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5">
                                            <Users size={14} className="text-slate-400" />
                                            <span className="font-bold text-slate-700">{dept.count}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${dept.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                                            }`}>
                                            {dept.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setSelectedDept(dept); setIsEditModalOpen(true); }}
                                                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-md transition-colors"
                                                title="Edit Department"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedDept(dept); setIsDeleteModalOpen(true); }}
                                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                                                title="Delete Department"
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
                        Showing {currentDepartments.length} of {departments.length} departments
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handlePrevPage} disabled={currentPage === 1}
                            className="px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1 mx-2">
                            {Array.from({ length: totalPages }).map((_, idx) => {
                                const page = idx + 1;
                                return (
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
                                );
                            })}
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
                <p>© 2026 National Institute of Technology Calicut. Faculty Appointment Management System.</p>
                <div className="flex items-center gap-6 font-medium">
                    <a href="#" className="hover:text-slate-900 transition-colors">System Status</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Admin Logs</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
                </div>
            </div>

            {/* ========================================================= */}
            {/* MODALS                                                    */}
            {/* ========================================================= */}

            {/* 1. Add Department Modal */}
            {isAddModalOpen && (
                <ModalOverlay onClose={() => setIsAddModalOpen(false)}>
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h2 className="text-lg font-bold text-slate-900">Add New Department</h2>
                        <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Department Code</label>
                            <input name="code" required type="text" placeholder="e.g. CSE" maxLength={4} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm uppercase" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Full Department Name</label>
                            <input name="name" required type="text" placeholder="e.g. Computer Science & Engineering" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Head of Department (HOD)</label>
                            <input name="head" required type="text" placeholder="e.g. Dr. John Smith" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Create Department</button>
                        </div>
                    </form>
                </ModalOverlay>
            )}

            {/* 2. Edit Department Modal */}
            {isEditModalOpen && selectedDept && (
                <ModalOverlay onClose={() => setIsEditModalOpen(false)}>
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h2 className="text-lg font-bold text-slate-900">Edit Department</h2>
                        <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Department Code</label>
                            <input name="code" defaultValue={selectedDept.code} required type="text" maxLength={4} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm uppercase" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Full Department Name</label>
                            <input name="name" defaultValue={selectedDept.name} required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Head of Department (HOD)</label>
                            <input name="head" defaultValue={selectedDept.head} required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Save Changes</button>
                        </div>
                    </form>
                </ModalOverlay>
            )}

            {/* 3. Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedDept && (
                <ModalOverlay onClose={() => setIsDeleteModalOpen(false)}>
                    <div className="p-6 flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Department?</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to remove <strong>{selectedDept.name} ({selectedDept.code})</strong>? This action cannot be undone. Make sure no faculties are actively assigned to this department.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">Delete Department</button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

        </div>
    );
}

// --- REUSABLE SUB-COMPONENTS --- //

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={24} strokeWidth={2} />
            </div>
            <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{value.toLocaleString()}</p>
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