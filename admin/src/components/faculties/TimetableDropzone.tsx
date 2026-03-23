import { UploadCloud, File, X } from "lucide-react";
import { useState, useRef } from "react";

export default function TimetableDropzone() {
    // State to show the user which file they selected
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Reference to the hidden HTML file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Trigger the hidden input when the user clicks the dropzone div
    const handleBoxClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle file selection via clicking
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Handle Drag & Drop events
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setSelectedFile(e.dataTransfer.files[0]);

            // Sync the dropped file into the hidden input so FormData catches it
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(e.dataTransfer.files[0]);
                fileInputRef.current.files = dataTransfer.files;
            }
        }
    };

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the click from opening the file browser again
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div
            onClick={handleBoxClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300'}
            `}
        >
            {/* CRITICAL: The hidden input that actually holds the data for your form */}
            <input
                type="file"
                name="file" // This name is what formData.get('file') looks for!
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv, .xlsx, .pdf"
                className="hidden"
            />

            {selectedFile ? (
                // State 1: A file is selected
                <div className="flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                        <File size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
                        {selectedFile.name}
                    </p>
                    <button
                        onClick={clearFile}
                        className="mt-3 flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1.5 rounded-md"
                    >
                        <X size={14} /> Remove File
                    </button>
                </div>
            ) : (
                // State 2: Empty, waiting for file
                <div className="flex flex-col items-center justify-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 border transition-all
                        ${isDragging ? 'bg-blue-100 border-blue-300 text-blue-600' : 'bg-white text-blue-600 border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50'}
                    `}>
                        <UploadCloud size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                        {isDragging ? "Drop file here!" : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">XLSX, CSV, or PDF files only (Max 10MB)</p>
                </div>
            )}
        </div>
    );
}