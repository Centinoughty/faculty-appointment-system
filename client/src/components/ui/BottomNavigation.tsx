import Link from 'next/link';
import { LayoutGrid, Users, Calendar, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function BottomNavigation() {
    const pathname = usePathname();

    const navItems = [
        {
            label: 'Dashboard',
            icon: LayoutGrid,
            href: '/admin/dashboard',
        },
        {
            label: 'Users',
            icon: Users,
            href: '/admin/faculty', // Assuming this is the main users landing page for now
        },
        {
            label: 'Schedule',
            icon: Calendar,
            href: '/admin/schedule', // Placeholder
        },
        {
            label: 'Settings',
            icon: Settings,
            href: '/admin/settings', // Placeholder
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
            {navItems.map((item) => {
                const Icon = item.icon;
                // Check if the current path starts with the href (for active state handling)
                const isActive = pathname.startsWith(item.href);

                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 min-w-[64px] ${isActive ? 'text-purple-700' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
