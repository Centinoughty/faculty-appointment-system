import { UploadCloud } from "lucide-react";

export default function TimetableDropzone() {
    return (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer group">
            <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                <UploadCloud size={20} />
            </div>
            <p className="text-sm font-bold text-slate-900">Click to upload or drag & drop</p>
            <p className="text-[11px] text-slate-400 mt-1">XLSX, CSV, or PDF files only (Max 10MB)</p>
        </div>
    );
}