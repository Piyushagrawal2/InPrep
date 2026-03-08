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
    <div className="min-h-screen bg-dots">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">InPrep</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link href="/auth?mode=register" className="btn-primary text-sm py-2.5! px-5!">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-text-secondary mb-8">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <span>The most realistic AI interview platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Interviews that feel
              <br />
              <span className="gradient-text">impossibly real</span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Practice with AI interviewers who have personalities, ask
              follow-ups, and push back on your answers. Upload your resume, pick
              your role, and experience interviews that actually prepare you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?mode=register" className="btn-primary text-lg py-4! px-8! flex items-center gap-2 justify-center">
                Start Your First Interview <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="btn-secondary text-lg py-4! px-8! flex items-center gap-2 justify-center">
                <Shield className="w-5 h-5" /> No credit card required
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <div key={i} className="card text-center">
                <div className="text-3xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">ace your interview</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              From resume-aware questioning to live coding challenges — InPrep
              covers every aspect of modern technical interviews.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card group cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Ready in <span className="gradient-text">3 simple steps</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Set up your interview",
                desc: "Enter your target job title, upload your resume, and tell us about yourself. Choose your difficulty level and duration.",
              },
              {
                step: "02",
                title: "Meet your interviewer",
                desc: "Start the interview and meet your AI interviewer. They'll greet you and begin with questions tailored to your profile.",
              },
              {
                step: "03",
                title: "Get detailed feedback",
                desc: "Receive a comprehensive scorecard with communication, technical depth, and hire probability scores.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl font-bold gradient-text mb-4 opacity-60">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-12! relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-violet-600/10 to-purple-600/10" />
            <div className="relative z-10">
              <Users className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Your dream job is one interview away
              </h2>
              <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">
                Join thousands of candidates who improved their interview
                performance by 35% with InPrep.
              </p>
              <Link href="/auth?mode=register" className="btn-primary text-lg py-4! px-10! inline-flex items-center gap-2">
                Start Practicing Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">InPrep</span>
          </div>
          <p className="text-text-muted text-sm">
            © 2026 InPrep. Built with ❤️ for job seekers everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
