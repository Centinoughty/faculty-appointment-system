"use client";

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuth from "@/src/hooks/useAuth"; // Your custom hook

export default function LoginPage() {
    // Local state for UI only
    const [showPassword, setShowPassword] = useState(false);

    const { formData, handleChange, handleLogin, isLoading } = useAuth();

    return (
        <div className="h-screen w-full bg-[#f6f7f9] flex flex-col text-slate-900 font-sans overflow-hidden">
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-[950px] max-h-[80vh] bg-white rounded-2xl shadow-xl flex flex-col-reverse md:flex-row overflow-hidden border border-slate-200">

                    <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">

                        {/* 1. Changed action to onSubmit to use your hook's handler */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">Admin Portal</h1>
                                <p className="text-slate-500 text-sm">Secure institutional access</p>
                            </div>

                            <div className="space-y-4">
                                {/* Email Input */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-500 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            name="email" 
                                            type="email"
                                            required
                                            value={formData.email || ''} // 2. Bind value
                                            onChange={handleChange}      // 3. Bind onChange
                                            className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-500 ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            name="password" 
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={formData.password || ''} // 2. Bind value
                                            onChange={handleChange}         // 3. Bind onChange
                                            className="w-full px-4 py-2.5 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    id="rememberMe"
                                    onChange={handleChange} // Optional: if your hook tracks this
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                                />
                                <label htmlFor="rememberMe" className="text-sm text-slate-600 cursor-pointer">Keep me logged in</label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading} // 4. Using isLoading from your hook instead of isPending
                                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign In"}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    </div>

                    {/* Right Side Image */}
                    <div className="hidden md:block w-1/2 relative bg-slate-900">
                        <img
                            src="https://images.unsplash.com/photo-1541339907198-e08756defefe?q=80&w=1600&auto=format&fit=crop"
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                            alt="NITC"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent p-10 flex flex-col justify-end text-white">
                            <h2 className="text-2xl font-bold">Facility & Asset Management</h2>
                            <p className="text-sm opacity-80 mt-2">National Institute of Technology Calicut</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}