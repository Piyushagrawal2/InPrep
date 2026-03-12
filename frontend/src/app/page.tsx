"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Mic,
  Code,
  BarChart3,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Interviewers with Personality",
    desc: "Three distinct personas — from a warm HR screener to a tough VP of Engineering. Each feels like a real person, not a chatbot.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Mic,
    title: "Natural Conversation Flow",
    desc: "Follow-up questions, pushback, and natural reactions. The AI listens and adapts — just like a real interviewer.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Code,
    title: "Coding Sandbox",
    desc: "Write, run, and debug code in a real IDE. The AI reviews your approach, asks about complexity, and suggests optimizations.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Layers,
    title: "Multi-Round Pipeline",
    desc: "Simulate the entire hiring process — Phone Screen → Technical → Coding → System Design → Behavioral.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: BarChart3,
    title: "Intelligence Dashboard",
    desc: "Get a hire/no-hire probability score, communication metrics, technical depth analysis, and improvement roadmaps.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    desc: "Schedule interviews at your convenience. The system uses spaced repetition to optimize your preparation.",
    gradient: "from-indigo-500 to-blue-600",
  },
];

const stats = [
  { value: "35%", label: "Better performance" },
  { value: "3", label: "Interviewer personas" },
  { value: "30-90", label: "Min sessions" },
  { value: "10+", label: "Question types" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mesh selection:bg-accent/30 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-0.5 shadow-lg group-hover:scale-105 transition-transform">
               <div className="w-full h-full bg-bg-primary rounded-[inherit] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-accent" />
               </div>
            </div>
            <span className="text-2xl font-black tracking-tight gradient-text">InPrep</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 mr-auto ml-12 text-sm font-medium text-text-secondary">
             <Link href="#features" className="hover:text-white transition-colors">Features</Link>
             <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/auth"
              className="text-sm text-text-secondary hover:text-white transition-colors font-semibold"
            >
              Sign In
            </Link>
            <Link href="/auth?mode=register" className="btn-primary text-sm py-2.5! px-6! shadow-xl">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0, 0.71, 0.2, 1.01] }}
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass border-white/10 text-xs font-bold uppercase tracking-widest text-accent mb-10 shadow-glow mx-auto">
              <Star className="w-4 h-4 fill-accent" />
              <span>Future of Interview Prep</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-[1.1] mb-6 tracking-tight">
              Master the interview, <br />
              <span className="gradient-text italic">effortlessly.</span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Experience hypers-realistic AI interviews that adapt to your profile. 
              Get feedback that actually lands you the job.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth?mode=register" className="btn-primary group min-w-[200px]">
                Start Practice <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn-secondary backdrop-blur-md">
                <Users className="w-4 h-4 text-accent" /> Join 10k+ Candidates
              </button>
            </div>
          </motion.div>

          {/* Stats Section with Glass Cards */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="card p-6 group border-glow hover:bg-white/5">
                <div className="text-3xl font-black text-white mb-1.5 group-hover:scale-105 transition-transform origin-left">
                  {stat.value}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features with Multi-Layered Cards */}
      <section id="features" className="py-32 px-6 relative">
         <div className="absolute inset-0 bg-bg-secondary/50 -skew-y-3 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              Engineered for <br /><span className="gradient-text">Success</span>
            </h2>
            <p className="text-text-secondary text-xl max-w-2xl mx-auto font-medium">
              Every tool you need to transform from a candidate to a top-tier hire.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card group cursor-pointer border-glow relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/10 transition-colors" />
                <div
                  className={`w-14 h-14 rounded-2xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:-rotate-6 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-text-secondary text-base leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-20 tracking-tight">
            How it <span className="gradient-text italic">Works</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "01",
                icon: Layers,
                title: "Setup Your Profile",
                desc: "Choose your role, upload your resume, and let the AI build a custom interview persona just for you.",
              },
              {
                step: "02",
                icon: Mic,
                title: "Practice Live",
                desc: "Engage in a rich, natural conversation. The AI probes your depth and tests your technical knowledge.",
              },
              {
                step: "03",
                icon: BarChart3,
                title: "Analyze & Improve",
                desc: "Review your detailed analytics, identify weak spots, and track your progress over time.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="relative group p-8 glass rounded-4xl text-center border-glow"
              >
                <div className="text-[120px] font-black text-white/5 absolute -top-8 left-1/2 -translate-x-1/2 select-none group-hover:text-accent/10 transition-colors">
                  {item.step}
                </div>
                <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-white/5">
                   <item.icon className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-2xl font-extrabold mb-4">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed font-medium">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl md:rounded-4xl overflow-hidden p-12 md:p-20 text-center">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-3xl" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(108,99,255,0.2),transparent)]" />
            
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-accent mx-auto mb-8 animate-float" />
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-[1.05] tracking-tighter">
                Ready to land <br />your <span className="gradient-text">dream job?</span>
              </h2>
              <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-xl mx-auto font-medium leading-relaxed">
                Unlock your full potential with the world's most sophisticated interview simulator.
              </p>
              <Link href="/auth?mode=register" className="btn-primary text-xl py-5! px-12! shadow-2xl hover:scale-105 active:scale-95 transition-all">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center p-0.5 shadow-lg">
               <div className="w-full h-full bg-bg-primary rounded-[inherit] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-accent" />
               </div>
            </div>
            <span className="text-xl font-black tracking-tighter">InPrep</span>
          </div>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest">
            © 2026 InPrep. Built for the Elite.
          </p>
          <div className="flex gap-8">
            {["Privacy", "Terms", "Support"].map((item) => (
              <Link key={item} href="#" className="text-xs font-bold text-text-muted hover:text-white transition-colors uppercase tracking-widest">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
