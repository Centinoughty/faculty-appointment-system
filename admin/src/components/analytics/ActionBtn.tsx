interface ActionBtnProps {
    icon: any;
    label: string;
    onClick: () => void;
}

export default function ActionBtn({ icon: Icon, label, onClick }: ActionBtnProps) {
    return (
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition-colors" onClick={onClick}>
            <Icon size={16} className="text-slate-500" />
            {label}
        </button>
    );
}