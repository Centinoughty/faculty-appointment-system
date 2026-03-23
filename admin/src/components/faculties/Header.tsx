import { Plus, Search, UploadCloud, Loader2 } from 'lucide-react';
import { useRef } from 'react';

interface HeaderProps {
    setIsCreateModalOpen: (open: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleBulkUpload: (file: File) => void; // New prop for bulk upload
    isUploading?: boolean; // Loading state to disable the button while uploading
}

export default function Header({ setIsCreateModalOpen, searchQuery, setSearchQuery, handleBulkUpload, isUploading }: HeaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleBulkUpload(e.target.files[0]);
            // Clear the input value so the exact same file can be selected again if needed
            e.target.value = ''; 
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Directory</h1>
                <p className="text-slate-500 mt-1 text-sm">Manage faculty records, designations, and departmental allocations.</p>
            </div>

            <div className='flex flex-wrap sm:flex-nowrap gap-4 sm:gap-6 lg:gap-10'>

                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search records..."
                        className="pl-10 pr-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm w-full sm:w-64 transition-all outline-none"
                    />
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    {/* Hidden File Input */}
                    <input 
                        type="file" 
                        accept=".csv" 
                        ref={fileInputRef} 
                        onChange={onFileChange} 
                        className="hidden" 
                    />

                    {/* Secondary Bulk Upload Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isUploading ? <Loader2 className="animate-spin text-slate-400" size={18} /> : <UploadCloud size={18} />}
                        Bulk Upload
                    </button>

                    {/* Primary Add Faculty Button */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-600/20 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Add Faculty
                    </button>
                </div>

            </div>
        </div>
    )
}