import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <div className="p-1 bg-blue-50 text-blue-600 rounded-lg">
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="text-2xl font-black text-slate-900 leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}
