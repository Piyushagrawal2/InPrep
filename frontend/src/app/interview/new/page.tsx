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
        color: "border-emerald-400/50 bg-emerald-400/5",
        activeColor: "border-emerald-400 bg-emerald-400/15",
        icon: "🌱",
        interviewer: "Sarah Mitchell — Senior HR Partner",
    },
    {
        value: "intermediate",
        label: "Intermediate",
        desc: "In-depth technical questions, scenario-based problems.",
        color: "border-amber-400/50 bg-amber-400/5",
        activeColor: "border-amber-400 bg-amber-400/15",
        icon: "⚡",
        interviewer: "David Chen — Engineering Manager",
    },
    {
        value: "hard",
        label: "Hard",
        desc: "Senior-level questions, system design, high pressure.",
        color: "border-rose-400/50 bg-rose-400/5",
        activeColor: "border-rose-400 bg-rose-400/15",
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

    // Form data
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [selfIntro, setSelfIntro] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [duration, setDuration] = useState(30);

    const canProceed = () => {
        switch (step) {
            case 1:
                return jobTitle.trim().length > 0;
            case 2:
                return true; // Resume is optional
            case 3:
                return true; // Self-intro is optional
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleSubmit = async () => {
        if (!token) return router.push("/auth");
        setLoading(true);
        setError("");

        try {
            // 1. Create interview
            const interview = await interviewAPI.create(token, {
                job_title: jobTitle,
                job_description: jobDescription || undefined,
                self_introduction: selfIntro || undefined,
                difficulty,
                duration_minutes: duration,
            });

            // 2. Upload resume if provided
            if (resumeFile) {
                await interviewAPI.uploadResume(token, interview.id, resumeFile);
            }

            // 3. Start interview (AI sends first message)
            await interviewAPI.start(token, interview.id);

            // 4. Navigate to interview chat
            router.push(`/interview/${interview.id}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create interview");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dots">
            {/* Header */}
            <header className="glass sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="text-lg font-bold gradient-text">InPrep</span>
                    </Link>
                    <Link
                        href="/dashboard"
                        className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                        Cancel
                    </Link>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-10">
                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2">
                            <button
                                onClick={() => s.id < step && setStep(s.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${step === s.id
                                        ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                                        : step > s.id
                                            ? "text-emerald-400"
                                            : "text-[var(--color-text-muted)]"
                                    }`}
                            >
                                {step > s.id ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <s.icon className="w-4 h-4" />
                                )}
                                <span className="hidden sm:inline">{s.label}</span>
                            </button>
                            {i < steps.length - 1 && (
                                <div
                                    className={`w-8 h-px ${step > s.id
                                            ? "bg-emerald-400"
                                            : "bg-[var(--color-border)]"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Step 1: Job Title */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className="text-2xl font-bold mb-2">
                            What role are you interviewing for?
                        </h2>
                        <p className="text-[var(--color-text-secondary)] mb-8">
                            We&apos;ll tailor the entire interview to this position
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    Job Title *
                                </label>
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="e.g. Senior Frontend Engineer"
                                    className="input-field text-lg"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    Job Description{" "}
                                    <span className="text-[var(--color-text-muted)]">(optional)</span>
                                </label>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description for more targeted questions..."
                                    className="input-field min-h-[120px] resize-none"
                                    rows={4}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Resume */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className="text-2xl font-bold mb-2">Upload your resume</h2>
                        <p className="text-[var(--color-text-secondary)] mb-8">
                            The AI will ask questions from your experience and projects
                        </p>

                        <div
                            className={`card !p-8 border-2 border-dashed text-center cursor-pointer transition-all ${resumeFile
                                    ? "border-emerald-400/50 bg-emerald-400/5"
                                    : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
                                }`}
                            onClick={() => document.getElementById("resume-input")?.click()}
                        >
                            <input
                                id="resume-input"
                                type="file"
                                accept=".pdf,.docx"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setResumeFile(file);
                                }}
                            />

                            {resumeFile ? (
                                <>
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                                    <p className="font-semibold text-emerald-400">{resumeFile.name}</p>
                                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                        {(resumeFile.size / 1024).toFixed(0)} KB • Click to change
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3" />
                                    <p className="font-semibold">
                                        Drop your resume here or click to upload
                                    </p>
                                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                        PDF or DOCX, up to 10MB
                                    </p>
                                </>
                            )}
                        </div>

                        <p className="text-xs text-[var(--color-text-muted)] mt-3 text-center">
                            You can skip this step — the AI will still interview you based on the job title
                        </p>
                    </motion.div>
                )}

                {/* Step 3: Self Introduction */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
                        <p className="text-[var(--color-text-secondary)] mb-8">
                            A brief introduction so the interviewer knows your background
                        </p>

                        <textarea
                            value={selfIntro}
                            onChange={(e) => setSelfIntro(e.target.value)}
                            placeholder="e.g. I'm a full-stack developer with 3 years of experience in React and Node.js. I've worked at a fintech startup where I built payment processing systems..."
                            className="input-field min-h-[200px] resize-none"
                            rows={8}
                        />

                        <p className="text-xs text-[var(--color-text-muted)] mt-3">
                            The interviewer will reference this instead of asking you to
                            &quot;tell me about yourself&quot;
                        </p>
                    </motion.div>
                )}

                {/* Step 4: Settings */}
                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className="text-2xl font-bold mb-2">Interview settings</h2>
                        <p className="text-[var(--color-text-secondary)] mb-8">
                            Choose your difficulty and duration
                        </p>

                        {/* Difficulty */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                                <Zap className="w-4 h-4 inline mr-1" /> Difficulty Level
                            </label>
                            <div className="space-y-3">
                                {difficulties.map((d) => (
                                    <button
                                        key={d.value}
                                        onClick={() => setDifficulty(d.value)}
                                        className={`w-full text-left card !py-3 !px-4 border transition-all ${difficulty === d.value ? d.activeColor : d.color
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{d.icon}</span>
                                            <div className="flex-1">
                                                <p className="font-semibold">{d.label}</p>
                                                <p className="text-xs text-[var(--color-text-secondary)]">
                                                    {d.desc}
                                                </p>
                                            </div>
                                            <p className="text-xs text-[var(--color-text-muted)] text-right">
                                                {d.interviewer}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                                <Clock className="w-4 h-4 inline mr-1" /> Duration
                            </label>
                            <div className="grid grid-cols-5 gap-3">
                                {durations.map((d) => (
                                    <button
                                        key={d.value}
                                        onClick={() => setDuration(d.value)}
                                        className={`card !p-3 text-center transition-all ${duration === d.value
                                                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                                                : ""
                                            }`}
                                    >
                                        <p className="font-bold text-lg">{d.label}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">
                                            {d.desc}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-10">
                    <button
                        onClick={() => setStep((p) => Math.max(1, p - 1))}
                        className={`btn-secondary flex items-center gap-2 ${step === 1 ? "invisible" : ""
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={() => setStep((p) => Math.min(4, p + 1))}
                            disabled={!canProceed()}
                            className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !canProceed()}
                            className="btn-primary flex items-center gap-2 disabled:opacity-40"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                <>
                                    Start Interview <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}
