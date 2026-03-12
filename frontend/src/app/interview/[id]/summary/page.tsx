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
            <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin shadow-glow mb-4" />
                <p className="text-text-secondary font-bold animate-pulse">Generating Insights...</p>
            </div>
        );
    }

    if (!interview) return null;

    const score = interview.overall_score || (feedback as Record<string, number>)?.overall_score || 0;
    const recommendation = (feedback as Record<string, string>)?.hire_recommendation || "unknown";

    const scoreColor =
        score >= 7 ? "text-emerald-400" : score >= 5 ? "text-amber-400" : "text-rose-400";
    
    const recConfig: Record<string, { label: string; color: string; icon: any }> = {
        strong_hire: { label: "Strong Hire", color: "text-emerald-400 bg-emerald-400/10", icon: Trophy },
        hire: { label: "Hire", color: "text-emerald-400 bg-emerald-400/10", icon: ThumbsUp },
        maybe: { label: "Maybe", color: "text-amber-400 bg-amber-400/10", icon: Target },
        no_hire: { label: "No Hire", color: "text-rose-400 bg-rose-400/10", icon: ThumbsDown },
        unknown: { label: "N/A", color: "text-gray-400 bg-gray-400/10", icon: AlertCircle },
    };

    const currentRec = recConfig[recommendation] || recConfig.unknown;

    const strengths = (feedback as Record<string, string[]>)?.strengths || [];
    const improvements = (feedback as Record<string, string[]>)?.improvements || [];
    const summary = (feedback as Record<string, string>)?.summary || "";

    const scores = [
        { label: "Communication", val: (feedback as Record<string, number>)?.communication_score || 0, icon: MessageSquare },
        { label: "Technical", val: (feedback as Record<string, number>)?.technical_score || 0, icon: Target },
        { label: "Confidence", val: (feedback as Record<string, number>)?.confidence_score || 0, icon: TrendingUp },
        { label: "Logic", val: (feedback as Record<string, number>)?.problem_solving_score || 0, icon: BarChart3 },
    ];

    return (
        <div className="min-h-screen bg-mesh selection:bg-accent/30">
            {/* Header */}
            <header className="glass sticky top-0 z-50 border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <ArrowLeft className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" />
                        <span className="text-sm font-bold uppercase tracking-widest text-text-muted transition-colors group-hover:text-white">Exit Summary</span>
                    </Link>
                    <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center p-0.5 shadow-lg">
                         <div className="w-full h-full bg-bg-primary rounded-[inherit] flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-accent" />
                         </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Core Score */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 space-y-8"
                    >
                        <div className="card p-10! relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Trophy className="w-24 h-24 text-white" />
                            </div>
                            <div className="relative z-10 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-8">Performance Index</p>
                                <div className={`text-8xl font-black mb-4 tracking-tighter shadow-glow ${scoreColor}`}>
                                    {score.toFixed(1)}
                                </div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-10">Out of 10.0</p>
                                
                                <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/5 ${currentRec.color}`}>
                                    <currentRec.icon className="w-4 h-4" />
                                    {currentRec.label}
                                </div>
                            </div>
                        </div>

                        <div className="card p-8! space-y-8 border-glow">
                            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted border-b border-white/5 pb-4">Competency Breakdown</h3>
                            <div className="space-y-6">
                                {scores.map((s, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-3">
                                                <s.icon className="w-4 h-4 text-accent" />
                                                <span className="text-xs font-bold text-white uppercase tracking-widest">{s.label}</span>
                                            </div>
                                            <span className="text-sm font-black text-white">{s.val > 0 ? s.val.toFixed(1) : "N/A"}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${s.val * 10}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                className="h-full bg-accent shadow-glow rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Insights */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card p-10! border-glow"
                        >
                            <h1 className="text-4xl font-black mb-2 tracking-tighter">Session <span className="gradient-text">Debrief</span></h1>
                            <p className="text-text-secondary text-lg font-medium mb-10">{interview.job_title} • <span className="capitalize">{interview.difficulty} Challenge</span></p>

                            <div className="space-y-12">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-accent mb-6">Executive Summary</h3>
                                    <p className="text-text-primary text-xl leading-relaxed font-serif font-medium">
                                        {summary || "Analyzing interview performance patterns..."}
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Competitive Edge</h3>
                                        <ul className="space-y-4">
                                            {strengths.map((s: string, i: number) => (
                                                <li key={i} className="flex items-start gap-4">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                    </div>
                                                    <span className="text-[15px] font-medium text-text-secondary leading-snug">{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-rose-400">Growth Opportunities</h3>
                                        <ul className="space-y-4">
                                            {improvements.map((s: string, i: number) => (
                                                <li key={i} className="flex items-start gap-4">
                                                    <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/20">
                                                        <AlertCircle className="w-3 h-3 text-rose-400" />
                                                    </div>
                                                    <span className="text-[15px] font-medium text-text-secondary leading-snug">{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link
                                href="/interview/new"
                                className="btn-primary flex-1 !p-6 flex items-center justify-center gap-3 group shadow-2xl"
                            >
                                <span className="text-sm font-black uppercase tracking-widest">Master New Skills</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/dashboard"
                                className="glass flex-1 !p-6 flex items-center justify-center gap-3 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-white/5 transition-all text-text-muted hover:text-white"
                            >
                                Back to Control Center
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

