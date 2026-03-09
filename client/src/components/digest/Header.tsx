import React from 'react';

export default function Header() {
    return (
        <header className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">Faculty Daily Digest</h1>
                    <p className="text-xs text-gray-500 font-medium tracking-wide">Monday, October 23, 2023</p>
                </div>
            </div>
            <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center overflow-hidden">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full text-orange-300 mt-1">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </div>
        </header>
    );
}
