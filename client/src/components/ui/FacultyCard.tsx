import Image from 'next/image';
import { MoreVertical } from 'lucide-react';

interface FacultyCardProps {
    name: string;
    department: string;
    id: string;
    status: 'ACTIVE' | 'INACTIVE';
    imageUrl: string;
    onManage?: () => void;
    onOptions?: () => void;
}

export function FacultyCard({
    name,
    department,
    id,
    status,
    imageUrl,
    onManage,
    onOptions,
}: FacultyCardProps) {
    return (
        <div className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 gap-4">
            {/* Avatar Section */}
            <div className="relative">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
                    <Image
                        src={imageUrl}
                        alt={name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* Status Indicator */}
                <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white 
            ${status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}
                />
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 truncate">{name}</h3>
                    <button
                        onClick={onOptions}
                        className="text-gray-400 hover:text-gray-600 p-1 -mt-1 -mr-1"
                    >
                        <MoreVertical size={18} />
                    </button>
                </div>

                <p className="text-xs text-gray-500 truncate mt-0.5">
                    {department} | ID: {id}
                </p>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {status}
                    </span>
                    <button
                        onClick={onManage}
                        className="bg-purple-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-purple-800 transition-colors"
                    >
                        Manage
                    </button>
                </div>
            </div>
        </div>
    );
}
