import { Plus } from 'lucide-react';

export default function Header({ setIsCreateModalOpen }: { setIsCreateModalOpen: (open: boolean) => void }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Directory</h1>
                <p className="text-slate-500 mt-1 text-sm">Manage faculty records, designations, and departmental allocations.</p>
            </div>
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-600/20 transition-all active:scale-95"
            >
                <Plus size={18} />
                Create Faculty
            </button>
        </div>
    )
}