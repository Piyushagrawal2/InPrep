"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Sparkles,
    ArrowLeft,
    Trophy,
    Target,
    TrendingUp,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    BarChart3,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { interviewAPI } from "@/lib/api";

interface InterviewSummary {
    id: string;
    job_title: string;
    difficulty: string;
    duration_minutes: number;
    overall_score: number | null;
    feedback_summary: string | null;
    status: string;
    started_at: string | null;
    completed_at: string | null;
}

export default function InterviewSummaryPage() {
    const { token, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const interviewId = params.id as string;

    const [interview, setInterview] = useState<InterviewSummary | null>(null);
    const [messageCount, setMessageCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState<Record<string, unknown> | null>(null);

    useEffect(() => {
        if (!authLoading && !token) {
            router.push("/auth");
            return;
        }
        if (!token) return;

        interviewAPI
            .get(token, interviewId)
            .then((data) => {
                setInterview(data.interview);
                setMessageCount(data.messages.length);

                // Try to parse feedback summary
                if (data.interview.feedback_summary) {
                    try {
                        const parsed = JSON.parse(
                            data.interview.feedback_summary
                                .replace(/'/g, '"')
                                .replace(/True/g, "true")
                                .replace(/False/g, "false")
                                .replace(/None/g, "null")
                        );
                        setFeedback(parsed);
                    } catch {
                        setFeedback(null);
                    }
                }
            })
            .catch(() => router.push("/dashboard"))
            .finally(() => setLoading(false));
    }, [token, interviewId, authLoading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
            </div>
        );
    }

    if (!interview) return null;

    const score = interview.overall_score || (feedback as Record<string, number>)?.overall_score || 0;
    const recommendation = (feedback as Record<string, string>)?.hire_recommendation || "unknown";

    const scoreColor =
        score >= 7 ? "text-emerald-400" : score >= 5 ? "text-amber-400" : "text-rose-400";
    const recColor: Record<string, string> = {
        strong_hire: "text-emerald-400 bg-emerald-400/10",
        hire: "text-emerald-400 bg-emerald-400/10",
        maybe: "text-amber-400 bg-amber-400/10",
        no_hire: "text-rose-400 bg-rose-400/10",
        unknown: "text-gray-400 bg-gray-400/10",
    };
    const recLabel: Record<string, string> = {
        strong_hire: "Strong Hire",
        hire: "Hire",
        maybe: "Maybe",
        no_hire: "No Hire",
        unknown: "N/A",
    };

    const strengths = (feedback as Record<string, string[]>)?.strengths || [];
    const improvements = (feedback as Record<string, string[]>)?.improvements || [];
    const summary = (feedback as Record<string, string>)?.summary || "";

    const communicationScore = (feedback as Record<string, number>)?.communication_score || 0;
    const technicalScore = (feedback as Record<string, number>)?.technical_score || 0;
    const confidenceScore = (feedback as Record<string, number>)?.confidence_score || 0;
    const problemSolvingScore = (feedback as Record<string, number>)?.problem_solving_score || 0;

    return (
        <div className="min-h-screen bg-dots">
            {/* Header */}
            <header className="glass sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-4.5 h-4.5 text-white" />
                        </div>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                {/* Hero Score */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card !p-10 text-center mb-8 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-purple-600/5" />
                    <div className="relative z-10">
                        <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-1">Interview Complete</h1>
                        <p className="text-[var(--color-text-secondary)] mb-6">
                            {interview.job_title} •{" "}
                            <span className="capitalize">{interview.difficulty}</span> Level
                        </p>

                        <div className={`text-7xl font-bold ${scoreColor} mb-2`}>
                            {score.toFixed(1)}
                        </div>
                        <p className="text-[var(--color-text-muted)] mb-4">out of 10</p>

                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${recColor[recommendation]}`}>
                            Recommendation: {recLabel[recommendation]}
                        </span>
                    </div>
                </motion.div>

                {/* Score Breakdown */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Communication", score: communicationScore, icon: MessageSquare },
                        { label: "Technical", score: technicalScore, icon: Target },
                        { label: "Confidence", score: confidenceScore, icon: TrendingUp },
                        { label: "Problem Solving", score: problemSolvingScore, icon: BarChart3 },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card text-center"
                        >
                            <item.icon className="w-6 h-6 text-[var(--color-accent)] mx-auto mb-2" />
                            <p className="text-2xl font-bold mb-1">
                                {item.score > 0 ? item.score.toFixed(1) : "—"}
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                                {item.label}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Strengths & Improvements */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {strengths.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="card"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <ThumbsUp className="w-5 h-5 text-emerald-400" />
                                <h3 className="font-semibold">Strengths</h3>
                            </div>
                            <ul className="space-y-2">
                                {strengths.map((s: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    {improvements.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="card"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <ThumbsDown className="w-5 h-5 text-amber-400" />
                                <h3 className="font-semibold">Areas to Improve</h3>
                            </div>
                            <ul className="space-y-2">
                                {improvements.map((s: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </div>

                {/* Detailed Summary */}
                {summary && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="card mb-8"
                    >
                        <h3 className="font-semibold mb-3">Detailed Feedback</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {summary}
                        </p>
                    </motion.div>
                )}

                {/* Interview Stats */}
                <div className="card mb-8 flex items-center justify-around py-6">
                    <div className="text-center">
                        <p className="text-xl font-bold">{messageCount}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">Messages</p>
                    </div>
                    <div className="w-px h-8 bg-[var(--color-border)]" />
                    <div className="text-center">
                        <p className="text-xl font-bold capitalize">{interview.difficulty}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">Difficulty</p>
                    </div>
                    <div className="w-px h-8 bg-[var(--color-border)]" />
                    <div className="text-center">
                        <p className="text-xl font-bold">{interview.duration_minutes} min</p>
                        <p className="text-xs text-[var(--color-text-muted)]">Duration</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/interview/new"
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        Practice Again <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                        href="/dashboard"
                        className="btn-secondary flex items-center justify-center gap-2"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        </div>
    );
}
