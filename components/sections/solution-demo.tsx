"use client";

import { motion } from "framer-motion";
import {
    Bell,
    MessageCircle,
    BarChart3,
    Zap,
    ArrowRight,
    TrendingDown,
    TrendingUp,
    CircleDollarSign,
} from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import { cn } from "@/lib/utils";
import React from "react";

/* ─────────────────── Step Data ─────────────────── */
const steps = [
    {
        id: 0,
        icon: Bell,
        stepLabel: "Step 1",
        title: "Wake Up to Clarity",
        description:
            "Every morning at 7 AM, ProfitPulse sends a beautifully simple summary. No logging in required.",
    },
    {
        id: 1,
        icon: MessageCircle,
        stepLabel: "Step 2",
        title: "Ask in Plain English",
        description:
            "No SQL. No filters. No dashboards. Just type your question like you'd ask a CFO.",
    },
    {
        id: 2,
        icon: BarChart3,
        stepLabel: "Step 3",
        title: "Get Instant Answers",
        description:
            "AI crunches 30 days of data across all platforms and delivers clear, contextual insights.",
    },
    {
        id: 3,
        icon: Zap,
        stepLabel: "Step 4",
        title: "Know What to Do Next",
        description:
            "Not just data — actionable recommendations you can execute immediately to improve profit.",
    },
];

/* ─────────────────── Mini Mockup Cards ─────────────────── */

function NotificationCard() {
    return (
        <div className="bg-indigo/80 rounded-2xl shadow-2xl shadow-black/30 border border-white/10 overflow-hidden w-full">
            <div className="bg-coral/90 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <Bell size={11} className="text-white" />
                    </div>
                    <span className="text-white/90 text-[11px] font-medium">
                        ProfitPulse
                    </span>
                </div>
                <span className="text-white/50 text-[10px]">7:00 AM</span>
            </div>
            <div className="p-4 space-y-2.5">
                <h4 className="font-bold text-xs text-white">
                    Your Morning Pulse
                </h4>
                <div className="space-y-1.5">
                    {[
                        {
                            label: "Net Profit",
                            value: "$847",
                            color: "text-white",
                        },
                        {
                            label: "vs Last Week",
                            value: "-12%",
                            color: "text-coral",
                        },
                        {
                            label: "Top Expense",
                            value: "Meta Ads",
                            color: "text-white",
                        },
                    ].map((row, i) => (
                        <div
                            key={i}
                            className="flex justify-between items-center py-1 border-b border-white/5 last:border-0"
                        >
                            <span className="text-[10px] text-white/40">
                                {row.label}
                            </span>
                            <span
                                className={`text-xs font-bold ${row.color}`}
                            >
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="bg-teal/10 text-white text-[10px] px-2.5 py-1.5 rounded-lg font-medium border border-teal/20">
                    ROAS is 2.1x — targeting adjustments could push it higher.
                </div>
            </div>
        </div>
    );
}

function ChatQuestionCard() {
    return (
        <div className="bg-indigo/80 rounded-2xl shadow-2xl shadow-black/30 border border-white/10 overflow-hidden w-full">
            <div className="bg-coral/90 px-4 py-2.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                <span className="text-white/90 text-[11px] font-medium">
                    ProfitPulse AI &bull; Online
                </span>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex justify-end">
                    <div className="bg-coral text-white rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%] font-medium text-xs shadow-sm">
                        Why is profit down?
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-coral/80 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageCircle size={9} className="text-white" />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm px-3 py-2">
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="w-1.5 h-1.5 bg-white/30 rounded-full"
                                    style={{
                                        animationDelay: `${i * 200}ms`,
                                    }}
                                />
                            ))}
                        </div>
                        <p className="text-[9px] text-white/40 mt-1">
                            Analyzing your data...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChatAnswerCard() {
    return (
        <div className="bg-indigo/80 rounded-2xl shadow-2xl shadow-black/30 border border-white/10 overflow-hidden w-full">
            <div className="bg-teal px-4 py-2.5 flex items-center gap-2">
                <BarChart3 size={12} className="text-white" />
                <span className="text-white/90 text-[11px] font-medium">
                    Analysis Complete
                </span>
            </div>
            <div className="p-4 space-y-2.5">
                <div className="space-y-1.5">
                    {[
                        {
                            icon: TrendingUp,
                            label: "Revenue:",
                            value: "Stable at $6.8K",
                            color: "text-teal",
                        },
                        {
                            icon: TrendingDown,
                            label: "Ads CPM:",
                            value: "+40% up",
                            color: "text-coral",
                        },
                        {
                            icon: CircleDollarSign,
                            label: "Net Profit:",
                            value: "-12% down",
                            color: "text-coral",
                        },
                    ].map((row, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 text-xs"
                        >
                            <row.icon size={12} className={row.color} />
                            <span className="text-white/40">{row.label}</span>
                            <span className={`font-bold ${row.color}`}>
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="h-10 bg-white/5 rounded-lg flex items-end px-1 pb-1 gap-[2px] overflow-hidden">
                    {[32, 38, 35, 40, 50, 62, 58, 70, 65, 78, 72, 85].map(
                        (h, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 rounded-t-sm bg-linear-to-t from-coral to-coral/60"
                                initial={{ height: 0 }}
                                whileInView={{ height: `${h}%` }}
                                viewport={{ once: true }}
                                transition={{
                                    delay: 0.04 * i,
                                    duration: 0.4,
                                }}
                            />
                        )
                    )}
                </div>
                <p className="text-[10px] text-white/60 bg-coral/10 px-2 py-1.5 rounded-lg border border-coral/20">
                    <span className="font-bold text-white">Root cause:</span>{" "}
                    You are paying more for the same clicks.
                </p>
            </div>
        </div>
    );
}

function ActionCard() {
    return (
        <div className="bg-indigo/80 rounded-2xl shadow-2xl shadow-black/30 border border-white/10 overflow-hidden w-full">
            <div className="bg-coral/90 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap size={12} className="text-white" />
                    <span className="text-white/90 text-[11px] font-medium">
                        Action Required
                    </span>
                </div>
                <span className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    HIGH
                </span>
            </div>
            <div className="p-4 space-y-2.5">
                <h4 className="font-bold text-xs text-white">
                    3 Ad Sets Underperforming
                </h4>
                <div className="space-y-1.5">
                    {[
                        { name: "Winter Sale 2026", roas: "0.8x", bad: true },
                        { name: "Retargeting Broad", roas: "1.2x", bad: false },
                        { name: "Lookalike 5%", roas: "1.4x", bad: false },
                    ].map((ad, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg"
                        >
                            <span className="text-[10px] text-white font-medium">
                                {ad.name}
                            </span>
                            <span
                                className={`text-[10px] font-bold ${ad.bad ? "text-coral" : "text-teal"
                                    }`}
                            >
                                {ad.roas}
                            </span>
                        </div>
                    ))}
                </div>
                <button className="w-full bg-coral text-white py-2 rounded-xl text-xs font-semibold hover:bg-coral/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-coral/20">
                    Pause &amp; Save $180/day{" "}
                    <ArrowRight size={12} />
                </button>
            </div>
        </div>
    );
}

const mockups = [NotificationCard, ChatQuestionCard, ChatAnswerCard, ActionCard];

/* ─────────────────── Timeline Step Component ─────────────────── */

function TimelineStep({
    step,
    index,
    isLast,
}: {
    step: (typeof steps)[0];
    index: number;
    isLast: boolean;
}) {
    const Icon = step.icon;
    const Mockup = mockups[index];
    const isEven = index % 2 === 0;

    return (
        <div className="relative">
            {/* ── Connecting line (not on last step) ── */}
            {!isLast && (
                <div className="absolute left-1/2 -translate-x-1/2 top-12 bottom-0 w-px bg-linear-to-b from-coral/30 via-white/10 to-transparent hidden md:block" />
            )}

            <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                    duration: 0.7,
                    delay: 0.1,
                    ease: [0.22, 1, 0.36, 1],
                }}
                className="relative z-10"
            >
                {/* ── Desktop: Zigzag layout ── */}
                <div className="hidden md:grid md:grid-cols-[1fr_80px_1fr] items-start gap-0">
                    {/* Left column */}
                    <div
                        className={cn(
                            "flex",
                            isEven ? "justify-end" : "justify-end"
                        )}
                    >
                        {isEven ? (
                            /* Text card on left */
                            <div className="max-w-md w-full text-right pr-6">
                                <span className="text-[11px] font-bold tracking-widest uppercase text-coral">
                                    {step.stepLabel}
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold text-white font-heading mt-1 mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        ) : (
                            /* Mockup on left */
                            <div className="max-w-[260px] w-full mr-6">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, x: -20 }}
                                    whileInView={{
                                        opacity: 1,
                                        scale: 1,
                                        x: 0,
                                    }}
                                    viewport={{ once: true, margin: "-60px" }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    <Mockup />
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* Center node */}
                    <div className="flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                                delay: 0.2,
                            }}
                            className="relative"
                        >
                            {/* Glow ring */}
                            <div className="absolute -inset-2 rounded-full bg-coral/20 blur-md" />
                            {/* Icon circle */}
                            <div className="relative w-12 h-12 rounded-full bg-coral flex items-center justify-center shadow-lg shadow-coral/30 border-2 border-coral/50">
                                <Icon
                                    size={20}
                                    className="text-white"
                                    strokeWidth={2.5}
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Right column */}
                    <div
                        className={cn(
                            "flex",
                            isEven ? "justify-start" : "justify-start"
                        )}
                    >
                        {isEven ? (
                            /* Mockup on right */
                            <div className="max-w-[260px] w-full ml-6">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                    whileInView={{
                                        opacity: 1,
                                        scale: 1,
                                        x: 0,
                                    }}
                                    viewport={{ once: true, margin: "-60px" }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    <Mockup />
                                </motion.div>
                            </div>
                        ) : (
                            /* Text card on right */
                            <div className="max-w-md w-full text-left pl-6">
                                <span className="text-[11px] font-bold tracking-widest uppercase text-coral">
                                    {step.stepLabel}
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold text-white font-heading mt-1 mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Mobile: Stacked layout ── */}
                <div className="md:hidden flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    <div className="relative">
                        <div className="absolute -inset-2 rounded-full bg-coral/20 blur-md" />
                        <div className="relative w-12 h-12 rounded-full bg-coral flex items-center justify-center shadow-lg shadow-coral/30 border-2 border-coral/50">
                            <Icon
                                size={20}
                                className="text-white"
                                strokeWidth={2.5}
                            />
                        </div>
                    </div>
                    {/* Text */}
                    <div>
                        <span className="text-[11px] font-bold tracking-widest uppercase text-coral">
                            {step.stepLabel}
                        </span>
                        <h3 className="text-xl font-bold text-white font-heading mt-1 mb-2">
                            {step.title}
                        </h3>
                        <p className="text-sm text-white/50 leading-relaxed max-w-sm mx-auto">
                            {step.description}
                        </p>
                    </div>
                    {/* Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full max-w-[280px]"
                    >
                        <Mockup />
                    </motion.div>
                    {/* Connector line */}
                    {!isLast && (
                        <div className="w-px h-12 bg-linear-to-b from-coral/30 to-transparent" />
                    )}
                </div>
            </motion.div>
        </div>
    );
}

/* ─────────────────── Main Export ─────────────────── */

export function SolutionDemo() {
    return (
        <section id="solution_demo" className="relative py-28">
            <div className="container relative z-10 mx-auto px-4 md:px-6">
                {/* Header */}
                <FadeIn className="text-center mb-20">
                    <p className="text-sm font-semibold tracking-widest uppercase text-teal mb-3">
                        How It Works
                    </p>
                    <h2 className="text-3xl md:text-5xl font-bold font-heading text-white">
                        From Chaos to Clarity in{" "}
                        <span className="text-coral">4 Steps</span>
                    </h2>
                    <p className="text-white/40 text-lg mt-4 max-w-xl mx-auto">
                        Connect your tools, ask questions, and get answers that
                        move the needle.
                    </p>
                </FadeIn>

                {/* Timeline */}
                <div className="space-y-16 md:space-y-20">
                    {steps.map((step, index) => (
                        <TimelineStep
                            key={step.id}
                            step={step}
                            index={index}
                            isLast={index === steps.length - 1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
