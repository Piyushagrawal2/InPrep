"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Sparkles,
    Send,
    Clock,
    Phone,
    User as UserIcon,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { interviewAPI } from "@/lib/api";

interface Message {
    id: string;
    role: string;
    content: string;
    timestamp: string;
}

interface InterviewData {
    id: string;
    job_title: string;
    difficulty: string;
    duration_minutes: number;
    status: string;
}

const personaNames: Record<string, { name: string; role: string }> = {
    easy: { name: "Sarah Mitchell", role: "Senior HR Partner" },
    intermediate: { name: "David Chen", role: "Engineering Manager" },
    hard: { name: "Victoria Okafor", role: "VP of Engineering" },
};

export default function InterviewChatPage() {
    const { token, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const interviewId = params.id as string;

    const [interview, setInterview] = useState<InterviewData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [ending, setEnding] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Load interview data
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
                setMessages(data.messages);
            })
            .catch(() => router.push("/dashboard"))
            .finally(() => setLoading(false));
    }, [token, interviewId, authLoading, router]);

    // Timer
    useEffect(() => {
        if (interview?.status === "in_progress") {
            timerRef.current = setInterval(() => {
                setElapsedTime((p) => p + 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [interview?.status]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleSend = async () => {
        if (!input.trim() || sending || !token) return;

        const userMessage = input.trim();
        setInput("");
        setSending(true);

        const tempMsg: Message = {
            id: `temp-${Date.now()}`,
            role: "candidate",
            content: userMessage,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);

        try {
            const response = await interviewAPI.sendMessage(token, interviewId, userMessage);
            setMessages((prev) => [...prev, response]);
        } catch (err) {
            console.error("Failed to send message:", err instanceof Error ? err.message : String(err));
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleEndInterview = async () => {
        if (!token || ending) return;
        setEnding(true);

        try {
            await interviewAPI.end(token, interviewId);
            router.push(`/interview/${interviewId}/summary`);
        } catch (err) {
            console.error("Failed to end interview:", err instanceof Error ? err.message : String(err));
            setEnding(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin shadow-glow mb-4" />
                <p className="text-text-secondary font-bold animate-pulse">Initializing Virtual Interviewer...</p>
            </div>
        );
    }

    if (!interview) return null;

    const persona = personaNames[interview.difficulty] || personaNames.easy;

    return (
        <div className="h-screen flex flex-col bg-mesh overflow-hidden">
            {/* Top Bar */}
            <header className="glass px-8 py-5 flex items-center justify-between shrink-0 border-b border-white/5 relative z-20">
                <div className="flex items-center gap-6">
                    <Link
                        href="/dashboard"
                        className="p-3 rounded-2xl glass hover:bg-white/5 text-text-muted hover:text-white transition-all border-white/5"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-0.5 shadow-lg relative">
                             <div className="w-full h-full bg-bg-primary rounded-[inherit] flex items-center justify-center">
                                <UserIcon className="w-7 h-7 text-accent" />
                             </div>
                            {interview.status === "in_progress" && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-4 border-bg-primary shadow-lg" />
                            )}
                        </div>
                        <div>
                            <p className="font-black text-lg leading-tight">{persona.name}</p>
                            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-1">
                                {persona.role} • {interview.job_title}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex flex-col items-end mr-6">
                         <div className="flex items-center gap-3 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest text-text-muted">Live Session</span>
                         </div>
                         <div className="text-2xl font-black font-mono tracking-tighter text-white">
                            {formatTime(elapsedTime)}
                         </div>
                    </div>
                    
                    <button
                        onClick={handleEndInterview}
                        disabled={ending}
                        className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 active:scale-95 transition-all text-sm font-black uppercase tracking-widest"
                    >
                        {ending ? (
                            <div className="w-4 h-4 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
                        ) : (
                            <Phone className="w-5 h-5" />
                        )}
                        End Session
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-8 py-10 scroll-smooth relative">
                {/* Decorative background elements */}
                <div className="absolute top-[20%] left-[5%] w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[20%] right-[5%] w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                    <div className="text-center mb-12">
                         <div className="inline-block px-4 py-1.5 rounded-full glass border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4">
                            History started at {new Date(interview.id.split("-")[0] ? parseInt(interview.id.split("-")[0]) : Date.now()).toLocaleTimeString()}
                         </div>
                    </div>

                    {messages.map((msg, i) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 30, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={`flex ${msg.role === "candidate" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex max-w-[85%] ${msg.role === "candidate" ? "flex-row-reverse" : "flex-row"} gap-4`}>
                                <div className={`w-10 h-10 rounded-2xl shrink-0 mt-1 shadow-lg flex items-center justify-center ${
                                    msg.role === "interviewer" 
                                    ? "bg-linear-to-br from-indigo-500 to-purple-600" 
                                    : "bg-white/10 glass"
                                }`}>
                                    {msg.role === "interviewer" ? (
                                        <Sparkles className="w-5 h-5 text-white" />
                                    ) : (
                                        <UserIcon className="w-5 h-5 text-white/50" />
                                    )}
                                </div>
                                <div
                                    className={
                                        msg.role === "interviewer"
                                            ? "chat-bubble-interviewer shadow-xl border-glow"
                                            : "chat-bubble-candidate shadow-glow"
                                    }
                                >
                                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                                        {msg.content}
                                    </p>
                                    <div className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${msg.role === "interviewer" ? "text-text-muted" : "text-white/40"}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {sending && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                             <div className="flex max-w-[85%] flex-row gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 shrink-0 mt-1 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="chat-bubble-interviewer flex items-center gap-2 py-4 px-6!">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2.5 h-2.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2.5 h-2.5 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-accent ml-2">Interviewer is thinking</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} className="h-12" />
                </div>
            </div>

            {/* Input Bar */}
            <div className="px-8 py-8 glass border-t border-white/5 bg-bg-secondary/80 relative z-20">
                <div className="max-w-4xl mx-auto">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-10 group-focus-within:opacity-30 transition-opacity" />
                        <div className="relative flex gap-4 p-2 glass bg-bg-primary rounded-[2rem] border-white/10 group-focus-within:border-accent/40 transition-colors">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="State your answer clearly..."
                                className="bg-transparent flex-1 resize-none py-4 px-6 text-[15px] font-medium text-white outline-none placeholder:text-text-muted min-h-[56px] max-h-[160px]"
                                rows={1}
                                disabled={sending || interview.status !== "in_progress"}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || sending}
                                className="btn-primary w-14 h-14 !rounded-2xl !p-0 flex items-center justify-center disabled:opacity-20 active:scale-90 transition-all shadow-glow"
                            >
                                <Send className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

