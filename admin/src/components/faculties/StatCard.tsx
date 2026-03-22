export default function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={24} strokeWidth={2} />
            </div>
            <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
            </div>
        </div>
    );
}
