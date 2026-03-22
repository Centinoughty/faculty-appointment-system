import ModalOverlay from "../ModalOverlay";

interface DeleteConfirmationModalProps {
    selectedFaculty: any;
    setIsDeleteModalOpen: (val: boolean) => void;
    handleDeleteConfirm: () => void;
}

import { Trash2 } from "lucide-react";

export default function DeleteConfirmationModal({ selectedFaculty, setIsDeleteModalOpen, handleDeleteConfirm }: DeleteConfirmationModalProps) {
    return (
        <ModalOverlay onClose={() => setIsDeleteModalOpen(false)}>
            <div className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <Trash2 size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Faculty Record?</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Are you sure you want to remove <strong>{selectedFaculty.name}</strong>? This action cannot be undone and will erase their timetable data.
                </p>
                <div className="flex gap-3 w-full">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleDeleteConfirm} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">Delete Record</button>
                </div>
            </div>
        </ModalOverlay>
    )
}