"use client";

import { useEffect, useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuth from "@/src/hooks/useAuth";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [isForgotLoading, setIsForgotLoading] = useState(false);
    const { formData, handleChange, handleLogin, isLoading, isAuthenticated } = useAuth();

    const router = useRouter();

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsForgotLoading(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${baseUrl}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await res.json();
            toast.info(data.message || "If that email is in our system, we've sent a password reset link.");
            setIsForgotModalOpen(false);
        } catch (error) {
            toast.error("Failed to request password reset.");
        } finally {
            setIsForgotLoading(false);
        }
    };


    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    return (
        <div className="h-screen w-full bg-[#f6f7f9] flex flex-col text-slate-900 font-sans overflow-hidden">
            <main className="grow flex items-center justify-center p-4">
                <div className="w-full max-w-237.5 max-h-[80vh] bg-white rounded-2xl shadow-xl flex flex-col-reverse md:flex-row overflow-hidden border border-slate-200">

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

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        id="rememberMe"
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600"
                                    />
                                    <label htmlFor="rememberMe" className="text-sm text-slate-600 cursor-pointer">Keep me logged in</label>
                                </div>
                                <button type="button" onClick={() => setIsForgotModalOpen(true)} className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                    Forgot Password?
                                </button>
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

                    {/* Right Side Info */}
                    <div className="hidden md:block w-1/2 relative bg-slate-900 overflow-hidden">
                        {/* Elegant Geometric Background Pattern */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600 blur-3xl animate-pulse" />
                            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-600 blur-3xl animate-pulse delay-700" />
                        </div>

                        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/40 to-transparent p-10 flex flex-col justify-end text-white z-10">
                            
                            <h2 className="text-4xl font-extrabold tracking-tight">FAMS <span className="text-blue-400">NIT Calicut</span></h2>
                            <p className="text-slate-400 mt-2 text-sm max-w-xs">Faculty Appointment Management System – Streamlining institutional interactions.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Forgot Password Modal */}
            {isForgotModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={() => setIsForgotModalOpen(false)} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Reset Password</h3>
                        <p className="text-sm text-slate-500 mb-4">Enter your email address to receive a password reset link.</p>
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <input
                                type="email"
                                required
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="name@nitc.ac.in"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                            />
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setIsForgotModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isForgotLoading} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 min-w-[100px] justify-center">
                                    {isForgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Link"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}