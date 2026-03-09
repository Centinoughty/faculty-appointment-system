import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

interface TopNavigationProps {
    title: string;
    onBack?: () => void;
    onSearch?: () => void;
}

export function TopNavigation({ title, onBack, onSearch }: TopNavigationProps) {
    return (
        <div className="flex items-center justify-between px-4 py-4 bg-white sticky top-0 z-10">
            <button
                onClick={onBack}
                className="p-2 -ml-2 text-purple-700 hover:bg-purple-50 rounded-full transition-colors"
            >
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <button
                onClick={onSearch}
                className="p-2 -mr-2 text-purple-700 hover:bg-purple-50 rounded-full transition-colors"
            >
                <Search size={24} />
            </button>
        </div>
    );
}
