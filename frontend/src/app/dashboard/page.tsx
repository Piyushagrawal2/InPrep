"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    Clock,
    Plus,
    Target,
    Zap,
    LogOut,
    ChevronRight,
    Sparkles,
    BarChart3,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { interviewAPI } from "@/lib/api";

interface Interview {
    id: string;
    job_title: string;
    difficulty: string;
    duration_minutes: number;
    status: string;
    overall_score: number | null;
    created_at: string;
}

const difficultyColor: Record<string, string> = {
    easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    hard: "text-rose-400 bg-rose-400/10 border-rose-400/30",
};

const statusColor: Record<string, string> = {
    scheduled: "text-blue-400 bg-blue-400/10",
    in_progress: "text-amber-400 bg-amber-400/10",
    completed: "text-emerald-400 bg-emerald-400/10",
    cancelled: "text-gray-400 bg-gray-400/10",
};

export default function DashboardPage() {
    const { user, token, logout, isLoading } = useAuth();
    const router = useRouter();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/auth");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (token) {
            interviewAPI
                .list(token)
                .then((data) => setInterviews(data.interviews))
                .catch((err) => console.error(err instanceof Error ? err.message : String(err)))
                .finally(() => setLoading(false));
        }
    }, [token]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin shadow-glow" />
            </div>
        );
    }

    const completedInterviews = interviews.filter((i) => i.status === "completed");
    const avgScore =
        completedInterviews.length > 0
            ? completedInterviews.reduce((sum, i) => sum + (i.overall_score || 0), 0) /
            completedInterviews.length
            : 0;

    return (
        <div className="min-h-screen bg-mesh">
            {/* Header */}
            <header className="glass sticky top-0 z-50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center p-0.5 shadow-lg group-hover:scale-105 transition-transform">
                             <div className="w-full h-full bg-bg-primary rounded-[inherit] flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-accent" />
                             </div>
                        </div>
                        <span className="text-xl font-black tracking-tight gradient-text">InPrep</span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Candidate</span>
                            <span className="text-sm font-bold text-white">{user.name}</span>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden sm:block" />
                        <button
                            onClick={() => {
                                logout();
                                router.push("/");
                            }}
                            className="p-2.5 rounded-xl glass hover:bg-white/5 transition-all text-text-muted hover:text-rose-400 group border-white/5 hover:border-rose-500/30"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome + New Interview */}
                <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter">Your <span className="gradient-text">Dashboard</span></h1>
                        <p className="text-text-secondary text-base font-medium">
                            The command center for your career growth.
                        </p>
                    </div>
                    <Link
                        href="/interview/new"
                        className="btn-primary group shadow-2xl"
                    >
                        <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                             <Plus className="w-3 h-3 text-white" />
                        </div>
                        Start Interview
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card p-6 group border-glow shimmer-effect"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                                <Target className="w-6 h-6 text-violet-400" />
                            </div>
                            <span className="text-[10px] font-bold py-1 px-2.5 rounded-full bg-white/5 text-text-muted">Lifetime</span>
                        </div>
                        <h3 className="text-3xl font-black mb-1 leading-none">{interviews.length}</h3>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Total Interviews</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card p-6 group border-glow shimmer-effect"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <BarChart3 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-bold py-1 px-2.5 rounded-full bg-emerald-500/10 text-emerald-400">Mastery</span>
                        </div>
                        <h3 className="text-3xl font-black mb-1 leading-none gradient-text">
                            {avgScore > 0 ? avgScore.toFixed(1) : "0.0"}
                        </h3>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Average Performance</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card p-6 group border-glow shimmer-effect"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Zap className="w-6 h-6 text-amber-400" />
                            </div>
                            <span className="text-[10px] font-bold py-1 px-2.5 rounded-full bg-white/5 text-text-muted">Volume</span>
                        </div>
                        <h3 className="text-3xl font-black mb-1 leading-none">{completedInterviews.length}</h3>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Sessions Completed</p>
                    </motion.div>
                </div>

                {/* Interview History */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h2 className="text-2xl font-black tracking-tight">Recent <span className="gradient-text">History</span></h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                           <Clock className="w-4 h-4" /> Updated just now
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="glass h-24 w-full rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : interviews.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="card py-24! text-center border-dashed border-white/10"
                        >
                            <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                                <Sparkles className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-black mb-3">
                                Your journey starts here
                            </h3>
                            <p className="text-text-secondary mb-10 max-w-sm mx-auto font-medium">
                                Take your first step toward mastery by starting an AI-led practice session.
                            </p>
                            <Link href="/interview/new" className="btn-primary inline-flex items-center gap-3">
                                Create First Interview Session <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid gap-6">
                            {interviews.map((interview, i) => (
                                <motion.div
                                    key={interview.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link
                                        href={
                                            interview.status === "in_progress"
                                                ? `/interview/${interview.id}`
                                                : interview.status === "completed"
                                                    ? `/interview/${interview.id}/summary`
                                                    : `/interview/${interview.id}`
                                        }
                                        className="card p-5! group border-glow flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                                    >
                                        <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center border border-white/5">
                                            <Sparkles className="w-6 h-6 text-accent" />
                                        </div>
                                            <div>
                                                <p className="text-xl font-bold group-hover:text-accent transition-colors">{interview.job_title}</p>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className={`badge ${difficultyColor[interview.difficulty]}`}>
                                                        {interview.difficulty}
                                                    </span>
                                                    <span className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {interview.duration_minutes}m Duration
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-10 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                                            {interview.overall_score && (
                                                <div className="text-right">
                                                    <p className="text-2xl font-black gradient-text leading-none mb-1">
                                                        {interview.overall_score.toFixed(1)}
                                                    </p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                                        Final Score
                                                    </p>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-4">
                                                <span className={`badge uppercase tracking-tighter ${statusColor[interview.status]}`}>
                                                    {interview.status.replace("_", " ")}
                                                </span>
                                                <div className="w-10 h-10 rounded-full glass flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

