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

        // Optimistic update — show candidate message immediately
        const tempMsg: Message = {
            id: `temp-${Date.now()}`,
            role: "candidate",
            content: userMessage,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);

        try {
            const response = await interviewAPI.sendMessage(token, interviewId, userMessage);
            // Add the AI response
            setMessages((prev) => [...prev, response]);
        } catch (err) {
            console.error("Failed to send message:", err);
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
            console.error("Failed to end interview:", err);
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[var(--color-text-secondary)]">Loading interview...</p>
                </div>
            </div>
        );
    }

    if (!interview) return null;

    const persona = personaNames[interview.difficulty] || personaNames.easy;

    return (
        <div className="h-screen flex flex-col bg-[var(--color-bg-primary)]">
            {/* Top Bar */}
            <header className="glass px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-lg hover:bg-[var(--color-bg-card)] text-[var(--color-text-muted)]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center relative">
                            <UserIcon className="w-5 h-5 text-white" />
                            {interview.status === "in_progress" && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[var(--color-bg-primary)]" />
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{persona.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                {persona.role} • {interview.job_title}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">{formatTime(elapsedTime)}</span>
                        <span className="text-[var(--color-text-muted)]">
                            / {interview.duration_minutes}:00
                        </span>
                    </div>

                    <button
                        onClick={handleEndInterview}
                        disabled={ending}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors text-sm font-medium"
                    >
                        {ending ? (
                            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                            <Phone className="w-4 h-4" />
                        )}
                        End Interview
                    </button>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-3xl mx-auto space-y-4">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
                            className={`flex ${msg.role === "candidate" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "interviewer" && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mr-3 mt-1 shrink-0">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div
                                className={
                                    msg.role === "interviewer"
                                        ? "chat-bubble-interviewer"
                                        : "chat-bubble-candidate"
                                }
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.content}
                                </p>
                            </div>
                        </motion.div>
                    ))}

                    {sending && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mr-3 mt-1 shrink-0">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="chat-bubble-interviewer">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="glass px-6 py-4 shrink-0">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                        className="input-field flex-1 resize-none min-h-[48px] max-h-[120px] !py-3"
                        rows={1}
                        disabled={sending || interview.status !== "in_progress"}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        className="btn-primary !px-4 !py-3 self-end disabled:opacity-40"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
