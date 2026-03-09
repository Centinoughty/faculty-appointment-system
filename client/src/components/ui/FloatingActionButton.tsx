import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
    onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-6 bg-purple-800 text-white p-4 rounded-full shadow-lg hover:bg-purple-900 transition-colors z-20"
            aria-label="Add"
        >
            <Plus size={32} />
        </button>
    );
}
