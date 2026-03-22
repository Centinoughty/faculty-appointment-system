import { Download, Filter } from "lucide-react";

export default function TableToolbar() {
    return (
    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
        <h3 className="text-base font-bold text-slate-900">Active Faculty List</h3>
        <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Filter size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Download size={18} />
            </button>
        </div>
    </div>
    );
}