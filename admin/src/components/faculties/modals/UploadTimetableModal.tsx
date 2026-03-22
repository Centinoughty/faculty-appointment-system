import ModalOverlay from "../ModalOverlay";

interface UploadTimetableModalProps {
    selectedFaculty: any;
    setIsUploadModalOpen: (val: boolean) => void;
    handleTimetableUpload: (e: React.FormEvent<HTMLFormElement>) => void;
}

import { X, AlertCircle } from "lucide-react";
import TimetableDropzone from "../TimetableDropzone";

export default function UploadTimetableModal({ selectedFaculty, setIsUploadModalOpen, handleTimetableUpload }: UploadTimetableModalProps) {
    return (
        <ModalOverlay onClose={() => setIsUploadModalOpen(false)}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Upload Timetable</h2>
                    <p className="text-xs text-slate-500 mt-0.5">For {selectedFaculty.name}</p>
                </div>
                <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleTimetableUpload} className="p-6 space-y-5">
                <TimetableDropzone />

                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex gap-2 border border-blue-100">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <p>Uploading a new timetable will overwrite any existing schedule for this faculty member.</p>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm">Process Upload</button>
                </div>
            </form>
        </ModalOverlay>
    )
};