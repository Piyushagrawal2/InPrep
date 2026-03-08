"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Plus,
    Clock,
    BarChart3,
    Sparkles,
    LogOut,
    ChevronRight,
    Target,
    Zap,
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
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [token]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
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
        <div className="min-h-screen bg-dots">
            {/* Header */}
            <header className="glass sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="text-lg font-bold gradient-text">InPrep</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                            Hey, <strong className="text-[var(--color-text-primary)]">{user.name}</strong>
                        </span>
                        <button
                            onClick={() => {
                                logout();
                                router.push("/");
                            }}
                            className="p-2 rounded-lg hover:bg-[var(--color-bg-card)] transition-colors text-[var(--color-text-muted)]"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome + New Interview */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                        <p className="text-[var(--color-text-secondary)]">
                            Track your interview practice and improvements
                        </p>
                    </div>
                    <Link
                        href="/interview/new"
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> New Interview
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0 }}
                        className="card flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <Target className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{interviews.length}</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Total Interviews
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {avgScore > 0 ? avgScore.toFixed(1) : "—"}
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Avg Score
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{completedInterviews.length}</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Completed
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Interview History */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Interview History</h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="skeleton h-20 w-full" />
                            ))}
                        </div>
                    ) : interviews.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="card !py-16 text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-card-hover)] flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-[var(--color-text-muted)]" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                No interviews yet
                            </h3>
                            <p className="text-[var(--color-text-secondary)] mb-6">
                                Start your first AI interview and get personalized feedback
                            </p>
                            <Link href="/interview/new" className="btn-primary inline-flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Create Your First Interview
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            {interviews.map((interview, i) => (
                                <motion.div
                                    key={interview.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
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
                                        className="card flex items-center justify-between !py-4 group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                                                <Target className="w-5 h-5 text-violet-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{interview.job_title}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColor[interview.difficulty]
                                                            }`}
                                                    >
                                                        {interview.difficulty}
                                                    </span>
                                                    <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />{" "}
                                                        {interview.duration_minutes} min
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {interview.overall_score && (
                                                <div className="text-right mr-2">
                                                    <p className="text-lg font-bold gradient-text">
                                                        {interview.overall_score.toFixed(1)}
                                                    </p>
                                                    <p className="text-xs text-[var(--color-text-muted)]">
                                                        Score
                                                    </p>
                                                </div>
                                            )}
                                            <span
                                                className={`text-xs px-3 py-1 rounded-full ${statusColor[interview.status]
                                                    }`}
                                            >
                                                {interview.status.replace("_", " ")}
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
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
