"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Sparkles,
    Briefcase,
    FileText,
    User,
    Clock,
    Zap,
    Upload,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { interviewAPI } from "@/lib/api";

const steps = [
    { id: 1, label: "Role", icon: Briefcase },
    { id: 2, label: "Resume", icon: FileText },
    { id: 3, label: "About You", icon: User },
    { id: 4, label: "Settings", icon: Clock },
];

const difficulties = [
    {
        value: "easy",
        label: "Easy",
        desc: "Introduction & basic questions. Great for warm-ups.",
        color: "border-border hover:!border-easy hover:bg-easy/10 hover:bg-none",
        activeColor: "!border-easy bg-easy/10 bg-none ring-1 ring-easy",
        icon: "🌱",
        interviewer: "Sarah Mitchell — Senior HR Partner",
    },
    {
        value: "intermediate",
        label: "Intermediate",
        desc: "In-depth technical questions, scenario-based problems.",
        color: "border-border hover:!border-intermediate hover:bg-intermediate/10 hover:bg-none",
        activeColor: "!border-intermediate bg-intermediate/10 bg-none ring-1 ring-intermediate",
        icon: "⚡",
        interviewer: "David Chen — Engineering Manager",
    },
    {
        value: "hard",
        label: "Hard",
        desc: "Senior-level questions, system design, high pressure.",
        color: "border-border hover:!border-hard hover:bg-hard/10 hover:bg-none",
        activeColor: "!border-hard bg-hard/10 bg-none ring-1 ring-hard",
        icon: "🔥",
        interviewer: "Victoria Okafor — VP of Engineering",
    },
];

const durations = [
    { value: 15, label: "15 min", desc: "Quick practice" },
    { value: 30, label: "30 min", desc: "Standard" },
    { value: 45, label: "45 min", desc: "In-depth" },
    { value: 60, label: "60 min", desc: "Full interview" },
    { value: 90, label: "90 min", desc: "Extended" },
];

export default function NewInterviewPage() {
    const { token } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [selfIntro, setSelfIntro] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [duration, setDuration] = useState(30);

    const canProceed = () => {
        switch (step) {
            case 1: return jobTitle.trim().length > 0;
            case 2: return resumeFile !== null;
            case 3: return selfIntro.trim().length > 0;
            case 4: return true;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        if (!token) return router.push("/auth");
        setLoading(true);
        setError("");

        try {
            const interview = await interviewAPI.create(token, {
                job_title: jobTitle,
                job_description: jobDescription || undefined,
                self_introduction: selfIntro || undefined,
                difficulty,
                duration_minutes: duration,
            });
            if (resumeFile) await interviewAPI.uploadResume(token, interview.id, resumeFile);
            await interviewAPI.start(token, interview.id);
            router.push(`/interview/${interview.id}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create interview");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh selection:bg-accent/30">
            {/* Header */}
            <header className="glass sticky top-0 z-50 border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center p-0.5 shadow-lg group-hover:scale-105 transition-transform">
                             <div className="w-full h-full bg-bg-primary rounded-[inherit] flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-accent" />
                             </div>
                        </div>
                        <span className="text-xl font-black tracking-tight gradient-text font-serif">InPrep</span>
                    </Link>
                    <Link
                        href="/dashboard"
                        className="text-sm font-bold uppercase tracking-widest text-text-muted hover:text-white transition-colors"
                    >
                        Cancel Session
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-16">
                {/* Progress Steps */}
                <div className="relative mb-20 px-4">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2" />
                    <div className="relative flex justify-between">
                        {steps.map((s, i) => (
                            <div key={s.id} className="flex flex-col items-center">
                                <button
                                    onClick={() => s.id < step && setStep(s.id)}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center relative z-10 transition-all duration-500 border ${
                                        step === s.id
                                            ? "bg-accent text-white scale-125 shadow-glow border-accent"
                                            : step > s.id
                                                ? "bg-emerald-500 text-white border-emerald-500"
                                                : "bg-bg-secondary text-text-muted border-white/10"
                                    }`}
                                >
                                    {step > s.id ? (
                                        <CheckCircle2 className="w-6 h-6" />
                                    ) : (
                                        <s.icon className="w-5 h-5" />
                                    )}
                                </button>
                                <span className={`absolute -bottom-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${step === s.id ? "text-accent" : "text-text-muted"}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold flex items-center gap-3 shadow-xl"
                    >
                        <Zap className="w-5 h-5" /> {error}
                    </motion.div>
                )}

                <div className="min-h-[400px]">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        {step === 1 && (
                            <div className="space-y-8">
                                <div className="text-center md:text-left">
                                    <h2 className="text-4xl font-black mb-3 tracking-tighter">What role are we <span className="gradient-text">conquering?</span></h2>
                                    <p className="text-text-secondary text-lg font-medium">Precision matters. We&apos;ll build the interview around your target.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-3 ml-1 group-focus-within:text-accent transition-colors">Job Title</label>
                                        <input
                                            type="text"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            placeholder="e.g. Senior Principal Architect"
                                            className="input-field text-base w-full border-glow"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-3 ml-1">Job Description <span className="text-text-muted/50 font-medium lowercase italic">(for hyper-realistic questions)</span></label>
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the requirements or key responsibilities here..."
                                            className="input-field min-h-[160px] text-base resize-none w-full border-glow"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8">
                                <div className="text-center md:text-left">
                                    <h2 className="text-4xl font-black mb-3 tracking-tighter">Your <span className="gradient-text">Professional Record</span></h2>
                                    <p className="text-text-secondary text-lg font-medium">The AI analyzes your trajectory to ask the deep-dive questions.</p>
                                </div>
                                <div
                                    className={`card p-16! border-2 border-dashed text-center cursor-pointer group transition-all duration-500 relative overflow-hidden ${resumeFile
                                        ? "border-emerald-500/40 bg-emerald-500/5"
                                        : "border-white/10 hover:border-accent shadow-2xl hover:bg-white/5"
                                        }`}
                                    onClick={() => document.getElementById("resume-input")?.click()}
                                >
                                    <input id="resume-input" type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setResumeFile(f); }} />
                                    <div className="relative z-10">
                                        {resumeFile ? (
                                            <>
                                                <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                                                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                                </div>
                                                <p className="text-2xl font-black text-white mb-2">{resumeFile.name}</p>
                                                <p className="text-xs font-bold uppercase tracking-widest text-text-muted">READY FOR ANALYSIS • CLICK TO REPLACE</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/5 group-hover:scale-110 transition-transform">
                                                    <Upload className="w-10 h-10 text-text-muted group-hover:text-accent transition-colors" />
                                                </div>
                                                <p className="text-2xl font-black mb-2 tracking-tight">Drop your resume here</p>
                                                <p className="text-sm font-bold uppercase tracking-widest text-text-muted">PDF or DOCX • Up to 10MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8">
                                <div className="text-center md:text-left">
                                    <h2 className="text-4xl font-black mb-3 tracking-tighter">The <span className="gradient-text">Human Element</span></h2>
                                    <p className="text-text-secondary text-lg font-medium">What should the interviewer know about your recent work?</p>
                                </div>
                                <div className="relative group">
                                     <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-10 group-focus-within:opacity-30 transition-opacity" />
                                     <textarea
                                        value={selfIntro}
                                        onChange={(e) => setSelfIntro(e.target.value)}
                                        placeholder="I've spent the last 4 years building high-frequency trading platforms at ScaleX. Recently I've been focusing on Rust-based microservices and distributed databases..."
                                        className="input-field min-h-[250px] !py-8 !px-8 resize-none w-full border-glow relative bg-bg-primary/50"
                                    />
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-2xl glass border-white/5 bg-white/5">
                                    <Sparkles className="w-5 h-5 text-accent" />
                                    <p className="text-xs font-medium text-text-secondary leading-relaxed">
                                        Our AI uses this context to skip generic pleasantries and jump straight into high-impact questioning.
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-10">
                                <div className="text-center md:text-left">
                                    <h2 className="text-4xl font-black mb-3 tracking-tighter">Final <span className="gradient-text">Configuration</span></h2>
                                    <p className="text-text-secondary text-lg font-medium">Choose your challenge level and session length.</p>
                                </div>

                                <div className="space-y-6">
                                    <label className="block text-xs font-black uppercase tracking-widest text-text-muted ml-1">Challenge Intensity</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        {difficulties.map((d) => (
                                            <button
                                                key={d.value}
                                                onClick={() => setDifficulty(d.value)}
                                                className={`card !p-6 flex flex-col items-center text-center transition-all cursor-pointer relative group overflow-hidden ${
                                                    difficulty === d.value 
                                                    ? "border-accent shadow-glow scale-[1.02] ring-1 ring-accent/30" 
                                                    : "hover:border-white/20"
                                                }`}
                                            >
                                                {difficulty === d.value && (
                                                    <div className="absolute top-0 right-0 p-2">
                                                        <CheckCircle2 className="w-4 h-4 text-accent" />
                                                    </div>
                                                )}
                                                <span className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">{d.icon}</span>
                                                <h3 className="text-lg font-black mb-1 text-white">{d.label}</h3>
                                                <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase tracking-widest">Interviewer: {d.interviewer.split(' — ')[0]}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="block text-xs font-black uppercase tracking-widest text-text-muted ml-1">Session Duration</label>
                                    <div className="grid grid-cols-5 gap-3">
                                        {durations.map((d) => (
                                            <button
                                                key={d.value}
                                                onClick={() => setDuration(d.value)}
                                                className={`card p-5! text-center transition-all cursor-pointer border border-white/5 ${
                                                    duration === d.value
                                                        ? "bg-accent/10 border-accent/50 text-accent font-black shadow-inner"
                                                        : "hover:bg-white/5 text-text-muted"
                                                }`}
                                            >
                                                <p className="text-lg mb-0.5">{d.value}</p>
                                                <p className="text-[8px] font-black uppercase tracking-[0.15em] opacity-60">MIN</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-20 pt-10 border-t border-white/5">
                    <button
                        onClick={() => setStep((p) => Math.max(1, p - 1))}
                        className={`flex items-center gap-3 px-8 py-5 rounded-2xl glass font-black uppercase tracking-widest text-sm transition-all hover:bg-white/5 active:scale-95 ${step === 1 ? "invisible" : ""}`}
                    >
                        <ArrowLeft className="w-5 h-5" /> Previous
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={() => setStep((p) => Math.min(4, p + 1))}
                            disabled={!canProceed()}
                            className="btn-primary !px-12 !py-5 flex items-center gap-3 group disabled:opacity-20 shadow-2xl"
                        >
                            Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !canProceed()}
                                className="btn-primary flex-1 !py-6 !px-8 flex items-center justify-center gap-3 shadow-2xl group"
                            >
                                <span className="text-sm font-black uppercase tracking-widest">{loading ? "Initializing..." : "Proceed to Content"}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <Link
                                href="/dashboard"
                                className="glass flex-1 !py-6 !px-8 flex items-center justify-center rounded-4xl font-black uppercase tracking-widest text-sm hover:bg-white/5 transition-all text-text-muted hover:text-white"
                            >
                                Cancel Session
                            </Link>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
