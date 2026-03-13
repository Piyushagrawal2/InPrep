"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Suspense } from "react";

function AuthContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login, register, user } = useAuth();

    const [isRegister, setIsRegister] = useState(searchParams.get("mode") === "register");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) router.push("/dashboard");
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isRegister) {
                await register(email, name, password);
            } else {
                await login(email, password);
            }
            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-mesh relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[440px] relative z-10"
            >
                <div className="text-center mb-12">
                     <Link href="/" className="inline-flex items-center gap-3 group mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center p-0.5 shadow-xl group-hover:scale-110 transition-transform">
                             <div className="w-full h-full bg-bg-primary rounded-[inherit] flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-accent" />
                             </div>
                        </div>
                        <span className="text-3xl font-black tracking-tighter gradient-text">InPrep</span>
                    </Link>
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-3">
                        {isRegister ? "Join the Elite" : "Let's Grind"}
                    </h1>
                    <p className="text-text-secondary font-medium uppercase tracking-widest text-[10px]">
                        {isRegister ? "Start your high-performance career path" : "The portal to your next big break"}
                    </p>
                </div>

                <div className="card p-10! border-glow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
                    
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-3"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isRegister && (
                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 ml-1 group-focus-within:text-accent transition-colors">
                                    Full Identity
                                </label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Alex Rivera"
                                        className="input-field pl-14! font-medium w-full"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 ml-1 group-focus-within:text-accent transition-colors">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="alex@nexus.com"
                                    className="input-field pl-14! font-medium w-full"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <div className="flex justify-between items-center mb-2 mx-1">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted group-focus-within:text-accent transition-colors">
                                    Password
                                </label>
                                {!isRegister && (
                                    <button type="button" className="text-[10px] font-bold text-accent hover:text-white transition-colors uppercase tracking-widest">
                                        Forgot?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-14! pr-14! font-medium w-full"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-5! flex items-center justify-center gap-3 mt-4 group shadow-2xl active:scale-95 transition-all"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="text-sm font-black uppercase tracking-widest">{isRegister ? "Request Access" : "Authenticate"}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
                            {isRegister ? "Already part of the network?" : "New to the platform?"}{" "}
                            <button
                                onClick={() => {
                                    setIsRegister(!isRegister);
                                    setError("");
                                }}
                                className="text-accent hover:text-white transition-colors ml-1 animate-pulse"
                            >
                                {isRegister ? "Sign In" : "Register Now"}
                            </button>
                        </p>
                    </div>
                </div>

                <p className="mt-12 text-center text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] opacity-40">
                    Trusted by 50,000+ Engineers Worldwide
                </p>
            </motion.div>
        </div>
    );
}


export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-dots" />}>
            <AuthContent />
        </Suspense>
    );
}
