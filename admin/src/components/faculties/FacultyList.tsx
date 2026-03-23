interface FacultyListProps {
    currentFaculties: {
        id: string;
        name: string;
        department: string;
        designation: string;
        office: string;
        status: 'Active' | 'On Leave' | 'Retired';
        initials: string;
    }[];
    startIndex: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    searchQuery: string;
    faculties: any[];
    handlePrevPage: () => void;
    handleNextPage: () => void;
    setSelectedFaculty: (fac: any) => void;
    setIsUploadModalOpen: (val: boolean) => void;
    setIsEditModalOpen: (val: boolean) => void;
    setIsDeleteModalOpen: (val: boolean) => void;
}

import { FileUp, Edit2, Trash2 } from 'lucide-react';


export default function FacultyList({ currentFaculties, startIndex, itemsPerPage, totalPages, currentPage, searchQuery, faculties, handlePrevPage, handleNextPage, setSelectedFaculty, setIsUploadModalOpen, setIsEditModalOpen, setIsDeleteModalOpen }: FacultyListProps) {

    const updatedFaculties = currentFaculties.filter(fac => 
        (fac.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (fac.department || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (fac.designation || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50/80 font-bold border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Faculty Name</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Designation</th>
                            <th className="px-6 py-4">Office</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {updatedFaculties.map((fac) => (
                            <tr key={fac.id} className="hover:bg-slate-50/80 transition-colors group bg-white">
                                <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center text-xs font-bold border border-blue-100">
                                        {fac.initials}
                                    </div>
                                    {fac.name}
                                </td>
                                <td className="px-6 py-4 text-slate-600">{fac.department}</td>
                                <td className="px-6 py-4 text-slate-600">{fac.designation}</td>
                                <td className="px-6 py-4 text-slate-600 font-medium">{fac.office}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${fac.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                        }`}>
                                        {fac.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setSelectedFaculty(fac); setIsUploadModalOpen(true); }}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Upload Timetable"
                                        >
                                            <FileUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedFaculty(fac); setIsEditModalOpen(true); }}
                                            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                            title="Edit Faculty"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedFaculty(fac); setIsDeleteModalOpen(true); }}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Faculty"
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

            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-white gap-4">
                <span className="text-sm text-slate-500 font-medium">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, faculties.length)} of {faculties.length} faculties
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-semibold text-white bg-[#2563eb] rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}