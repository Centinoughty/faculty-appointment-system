export default function StatCard({ title, value, trend, icon: Icon, trendUp }: any) {
    const trendColor = trendUp === true ? 'text-emerald-600' : trendUp === false ? 'text-red-600' : 'text-slate-400';

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <div className="p-1 bg-blue-50 text-blue-600 rounded-lg">
                    <Icon size={20} />
                </div>
                {trend && (
                    <span className={`text-xs font-bold ${trendColor}`}>
                        {trend} {trendUp !== undefined && trendUp !== null && (trendUp ? '↑' : '↓')}
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">{title}</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
            </div>
        </div>
    );
}