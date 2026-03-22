"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, GraduationCap, Building2, 
  CalendarCheck, FileBarChart, LogOut, GraduationCap as LogoIcon, Menu, X
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/analytics', icon: LayoutDashboard },
        { name: 'Faculties', href: '/faculties', icon: Users },
        { name: 'Students', href: '/students', icon: GraduationCap },
        { name: 'Departments', href: '/departments', icon: Building2 },
        // { name: 'Appointments', href: '/appointments', icon: CalendarCheck },
        // { name: 'Reports', href: '/reports', icon: FileBarChart },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                
                {/* Logo Area */}
                <div className="flex items-center gap-3 px-6 py-6 h-20 border-b border-slate-100">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <LogoIcon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 leading-tight">NITC FAMS</h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Admin Portal</p>
                    </div>
                    {/* Mobile Close Button */}
                    <button className="ml-auto lg:hidden text-slate-400" onClick={() => setIsOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        
                        return (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                    isActive 
                                        ? 'bg-blue-50 text-blue-700' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                            JD
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">John Doe</p>
                            <p className="text-xs text-slate-500 truncate">Super Admin</p>
                        </div>
                        <LogOut size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                    </div>
                </div>
            </aside>
        </>
    );
}