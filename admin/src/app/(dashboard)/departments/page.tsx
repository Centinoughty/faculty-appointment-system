"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Plus, Filter, Download, Edit2, Trash2,
    Building2, Users, X, AlertTriangle,
    Search
} from 'lucide-react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { adminApi } from '@/src/api/admin';
import { Department } from '@/src/types/type';

export default function DepartmentManagementPage() {
    // --- STATE --- //
    const [departments, setDepartments] = useState<any[]>([]);
    const [faculties, setFaculties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedDept, setSelectedDept] = useState<Department | null>(null);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // --- FETCH DATA --- //
    const fetchDepartments = useCallback(async () => {
        setIsLoading(true);
        try {
            const [deptRes, facRes] = await Promise.all([
                adminApi.getDepartments(),
                adminApi.getFaculties()
            ]);

            setFaculties(facRes.data);

            const formattedDepartments = deptRes.data.map((dept: any) => {
                const derivedCode = dept.name.split(' ').map((n: string) => n[0]).join('').substring(0, 3).toUpperCase() || 'DEP';

                return {
                    id: dept.id,
                    name: dept.name,
                    code: derivedCode,
                    head: dept.hod_name || 'Not Assigned',
                    head_id: dept.hod_id,
                    count: dept.faculty_count || 0,
                    status: (dept.faculty_count || 0) > 0 ? 'Active' : 'Unstaffed'
                };
            });

            setDepartments(formattedDepartments);
        } catch (error) {
            console.error("Failed to fetch departments:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

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
        const totalFaculty = departments.reduce((sum, d) => sum + d.count, 0);
        return {
            total: departments.length,
            totalFaculty: totalFaculty,
        };
    }, [departments]);

    // --- SEARCH & PAGINATION LOGIC --- //
    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentDepartments = filteredDepartments.slice(startIndex, startIndex + itemsPerPage);

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handlePageClick = (page: number) => setCurrentPage(page);

    // --- ASYNC CRUD FUNCTIONS --- //

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        // Note: Our backend DepartmentBase schema accepts name and hod_id now.
        const deptData = {
            name: formData.get('name') as string,
            hod_id: formData.get('hod_id') ? parseInt(formData.get('hod_id') as string) : null,
        };

        try {
            await adminApi.createDepartment(deptData);
            setIsAddModalOpen(false);
            await fetchDepartments(); // Refresh table
            setCurrentPage(1);
            alert("Department created successfully!");
        } catch (error: any) {
            console.error("Error creating department:", error);
            alert(error.response?.data?.detail || "Failed to create department");
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDept) return;

        const formData = new FormData(e.target as HTMLFormElement);

        const deptData = {
            name: formData.get('name') as string,
            hod_id: formData.get('hod_id') ? parseInt(formData.get('hod_id') as string) : null,
        };

        try {
            await adminApi.updateDepartment(selectedDept.id, deptData);
            setIsEditModalOpen(false);
            await fetchDepartments();
            alert("Department updated successfully!");
        } catch (error: any) {
            console.error("Error updating department:", error);
            alert(error.response?.data?.detail || "Failed to update department");
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedDept) return;

        try {
            await adminApi.deleteDepartment(selectedDept.id);
            setIsDeleteModalOpen(false);
            await fetchDepartments();

            if (currentDepartments.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error: any) {
            console.error("Error deleting department:", error);
            alert(error.response?.data?.detail || "Failed to delete department");
        }
    };

    const [isUploading, setIsUploading] = useState(false);

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await adminApi.uploadBulkDepartments(formData);
            await fetchDepartments();
            setCurrentPage(1);

            const createdCount = response.data.created_departments?.length || 0;
            const skipped = response.data.skipped_rows || [];

            let message = `Successfully created ${createdCount} departments.`;
            if (skipped.length > 0) {
                message += `\n\nSkipped ${skipped.length} rows:`;
                skipped.forEach((s: any) => {
                    message += `\n- Row ${s.row}: ${s.name || 'Unknown'} (${s.reason})`;
                });
            }
            alert(message);
        } catch (error: any) {
            console.error("Error bulk uploading departments:", error);
            alert(error.response?.data?.detail || "Failed to process bulk upload.");
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset file input
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="Total Departments" value={stats.total} icon={Building2} color="bg-indigo-50 text-indigo-600" />
                <StatCard title="Total Faculty Assigned" value={stats.totalFaculty} icon={Users} color="bg-blue-50 text-blue-600" />
            </div>

            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Departments</h1>
                    <p className="text-slate-500 mt-1 text-sm">Manage institute faculties, department heads, and structural organization.</p>
                </div>
                <div className='flex gap-4 items-center'>

                    {/* WIRED UP SEARCH INPUT */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm w-48 transition-all outline-none"
                        />
                    </div>

                    <div className="relative">
                        <input
                            type="file"
                            id="bulk-upload-dept"
                            className="hidden"
                            accept=".csv"
                            onChange={handleBulkUpload}
                        />
                        <button
                            onClick={() => document.getElementById('bulk-upload-dept')?.click()}
                            disabled={isUploading}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all active:scale-95"
                        >
                            <Download size={18} className="translate-y-px" />
                            {isUploading ? 'Uploading...' : 'Bulk Upload'}
                        </button>
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
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h3 className="text-base font-bold text-slate-900">Department Directory</h3>
                </div>

                <div className="overflow-x-auto min-h-75">
                    {isLoading ? (
                        <div className="p-10 flex justify-center text-slate-500">Loading departments...</div>
                    ) : (
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
                                {currentDepartments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No departments found.</td>
                                    </tr>
                                ) : (
                                    currentDepartments.map((dept) => (
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
                                                    : 'bg-red-50 text-red-700 border border-red-100'
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-white gap-4">
                    <span className="text-sm text-slate-500 font-medium">
                        Showing {currentDepartments.length} of {filteredDepartments.length} departments
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

            {/* 1. Add Department Modal */}
            {isAddModalOpen && (
                <ModalOverlay onClose={() => setIsAddModalOpen(false)}>
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h2 className="text-lg font-bold text-slate-900">Add New Department</h2>
                        <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Department Code (For UI only)</label>
                            <input name="code" type="text" placeholder="e.g. CSE" maxLength={4} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm not-placeholder-shown:uppercase" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Full Department Name</label>
                            <input name="name" required type="text" placeholder="e.g. Computer Science & Engineering" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Head of Department (HOD)</label>
                            <select name="hod_id" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm">
                                <option value="">Assign Later</option>
                                {faculties.map(f => (
                                    <option key={f.id} value={f.id}>{f.name} ({f.designation})</option>
                                ))}
                            </select>
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
                            <label className="text-xs font-semibold text-slate-600">Department Code (For UI only)</label>
                            <input name="code" defaultValue={selectedDept.code} type="text" maxLength={4} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm not-placeholder-shown:uppercase" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Full Department Name</label>
                            <input name="name" defaultValue={selectedDept.name} required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Head of Department (HOD)</label>
                            <select name="hod_id" defaultValue={selectedDept.head_id || ""} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm">
                                <option value="">Not Assigned</option>
                                {faculties.map(f => (
                                    <option key={f.id} value={f.id}>{f.name} ({f.designation})</option>
                                ))}
                            </select>
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
                            Are you sure you want to remove <strong>{selectedDept.name}</strong>? This action cannot be undone. Make sure no faculties are actively assigned to this department.
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