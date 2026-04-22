import ModalOverlay from "../ModalOverlay";
import TimetableDropzone from "../TimetableDropzone";
import { Department } from '@/src/types/type';
import { X } from "lucide-react";

interface CreateFacultyModalProps {
    setIsCreateModalOpen: (val: boolean) => void;
    handleCreateSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    departments: Department[];
}

export default function CreateFacultyModal({ setIsCreateModalOpen, handleCreateSubmit, departments }: CreateFacultyModalProps) {
    return (
        <ModalOverlay onClose={() => setIsCreateModalOpen(false)}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="text-lg font-bold text-slate-900">Create New Faculty</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                
                {/* Profile Info */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Details</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Full Name</label>
                            <input name="name" required type="text" placeholder="e.g. Dr. John Smith" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Short Code (e.g. [SM])</label>
                            <input name="short_code" type="text" placeholder="e.g. SM" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm not-placeholder-shown:uppercase" />
                        </div>
                    </div>

                    {/* Added Email and Designation to the grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Email Address</label>
                            <input name="email" required type="email" placeholder="john@nitc.ac.in" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Designation</label>
                            <input name="designation" type="text" placeholder="e.g. Assistant Professor" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                            <select
                                name="department_id"
                                required
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-600 outline-none text-sm bg-white"
                            >
                                <option value="">Select a Department...</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Office Location</label>
                            <input name="office" required type="text" placeholder="e.g. CSE-102" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm not-placeholder-shown:uppercase" />
                        </div>
                    </div>
                </div>

                {/* Timetable Upload Section in Create Modal */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Initial Timetable (Optional)</h3>
                    <TimetableDropzone />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Create Faculty</button>
                </div>
            </form>
        </ModalOverlay>
    )
}