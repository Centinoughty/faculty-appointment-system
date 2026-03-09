import React from "react";
import { Mail, Briefcase, MapPin, Hash, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function ProfileView() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">
                    Faculty Profile
                </h1>
                <button
                    onClick={() => toast('Edit Profile dialog will open here')}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition text-slate-700"
                >
                    Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Card */}
                <div className="md:col-span-2 glass rounded-2xl p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center border-b border-slate-200 pb-6 mb-6">
                        <div className="h-24 w-24 rounded-full bg-slate-100 border border-slate-200 p-1 shrink-0 flex items-center justify-center">
                            <div className="h-full w-full rounded-full overflow-hidden bg-white">
                                <img
                                    src={"https://api.dicebear.com/7.x/notionists/svg?seed=Alan"}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Dr. Alan Turing</h2>
                            <p className="text-primary-700 font-medium text-lg">Associate Professor</p>
                            <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> a.turing@nitc.ac.in</span>
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> IT Lab 102</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary-600" /> Research Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {["Artificial Intelligence", "Cryptography", "Theory of Computation", "Machine Learning"].map(kw => (
                                    <span key={kw} className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-sm font-medium">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Info */}
                <div className="space-y-6">
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Department Info</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Department</p>
                                    <p className="text-sm text-slate-500">Computer Science & Engineering</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                                    <Hash className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Employee ID</p>
                                    <p className="text-sm text-slate-500">EMP90210</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
