import { Users, BadgeCheck, ClipboardList } from "lucide-react";

export default function DashboardStats() {
  const stats = [
    {
      id: 1,
      label: "TODAY'S STUDENTS",
      value: "24",
      icon: <Users className="w-6 h-6 text-primary" />,
      iconBg: "bg-blue-50",
    },
    {
      id: 2,
      label: "COMPLETED",
      value: "12",
      icon: <BadgeCheck className="w-6 h-6 text-[#10b981]" />,
      iconBg: "bg-emerald-50",
    },
    {
      id: 3,
      label: "PENDING",
      value: "08",
      icon: <ClipboardList className="w-6 h-6 text-[#f59e0b]" />,
      iconBg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-5 flex items-center space-x-4"
        >
          <div className={`p-3 rounded-full ${stat.iconBg}`}>{stat.icon}</div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">
              {stat.label}
            </p>
            <p className="text-2xl font-black text-gray-900 leading-none">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
