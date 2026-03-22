export default function ActionBtn({ icon: Icon, label }: any) {
    return (
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
            <Icon size={16} className="text-slate-500" />
            {label}
        </button>
    );
}