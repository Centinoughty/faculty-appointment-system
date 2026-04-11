import React from 'react';

export default function Footer() {
    return (
        <footer className="pt-8 mt-auto border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 mb-6">
            <p>© {new Date().getFullYear()} National Institute of Technology Calicut. Faculty Appointment Management System.</p>
            <div className="flex items-center gap-6 font-medium">
                
            </div>
        </footer>
    );
}
