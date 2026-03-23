import ModalOverlay from "../ModalOverlay";

interface EditFacultyModalProps {
    selectedFaculty: any;
    setIsEditModalOpen: (val: boolean) => void;
    handleEditSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

import { X } from "lucide-react";

export default function EditFacultyModal({ selectedFaculty, setIsEditModalOpen, handleEditSubmit }: EditFacultyModalProps) {
    return (
        <ModalOverlay onClose={() => setIsEditModalOpen(false)}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="text-lg font-bold text-slate-900">Edit Faculty Profile</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Full Name</label>
                    <input name="name" defaultValue={selectedFaculty.name} required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Department</label>
                        <input name="dept" defaultValue={selectedFaculty.dept} required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Designation</label>
                        <select name="desig" defaultValue={selectedFaculty.desig} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-white">
                            <option value="Professor">Professor</option>
                            <option value="Associate Professor">Associate Professor</option>
                            <option value="Assistant Professor">Assistant Professor</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Office Location</label>
                    <input name="office" defaultValue={selectedFaculty.office} required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Save Changes</button>
                </div>
            </form>
        </ModalOverlay>
    )
}