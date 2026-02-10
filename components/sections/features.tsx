"use client";

import { motion } from "framer-motion";
import { Activity, TrendingUp, Zap, Eye } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

/* ─── Dot Grid Decoration ─── */
function DotGrid() {
    return (
        <div className="grid grid-cols-10 gap-3 opacity-40 mt-16 w-fit">
            {[...Array(40)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-coral/60" />
            ))}
        </div>
    );
}

/* ─── Glass Bubble Circle ─── */
function GlassBubble({
    size,
    label,
    subLabel,
    icon: Icon,
    className,
    delay = 0,
}: {
    size: "lg" | "sm";
    label: string;
    subLabel: string;
    icon: React.ElementType;
    className?: string;
    delay?: number;
}) {
    const dims = size === "lg"
        ? "w-[220px] h-[220px] md:w-[280px] md:h-[280px]"
        : "w-[160px] h-[160px] md:w-[200px] md:h-[200px]";

    const iconSize = size === "lg" ? "w-11 h-11" : "w-9 h-9";
    const textSize = size === "lg" ? "text-xl md:text-2xl" : "text-base md:text-lg";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay, ease: "easeOut" }}
            className={`absolute ${dims} rounded-full ${className}`}
        >
            {/* Glass shell */}
            <div className="relative w-full h-full rounded-full overflow-hidden">
                {/* Base fill — subtle gradient */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent" />

                {/* Border */}
                <div className="absolute inset-0 rounded-full border border-white/[0.12]" />

                {/* Top highlight arc — glossy effect */}
                <div className="absolute inset-[1px] rounded-full border-t-[1.5px] border-white/20" />

                {/* Inner subtle shadow */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_-20px_40px_rgba(0,0,0,0.3)]" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <div className={cn(iconSize, "rounded-lg flex items-center justify-center mb-1 shrink-0")}>
                        {label === "ProfitPulse" ? (
                            <Logo iconOnly className="scale-125" />
                        ) : (
                            <div className="bg-coral p-2 rounded-lg shadow-lg shadow-coral/25">
                                <Icon size={size === "lg" ? 20 : 16} className="text-white" strokeWidth={2.5} />
                            </div>
                        )}
                    </div>
                    <h4 className={`text-white font-bold ${textSize} font-heading leading-tight mt-1`}>{label}</h4>
                    <p className="text-white/40 text-xs italic mt-1">{subLabel}</p>
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Overlapping Circles Graphic ─── */
function VennDiagram() {
    return (
        <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            {/* Center / Top — ProfitPulse (LARGEST) */}
            <GlassBubble
                size="lg"
                icon={Activity}
                label="ProfitPulse"
                subLabel="Single Platform"
                className="top-0 left-1/2 -translate-x-1/2 z-20"
                delay={0.15}
            />

            {/* Left — Pulse */}
            <GlassBubble
                size="sm"
                icon={TrendingUp}
                label="Pulse"
                subLabel="Revenue"
                className="top-[42%] left-0 z-10"
                delay={0.3}
            />

            {/* Right — Clarity */}
            <GlassBubble
                size="sm"
                icon={Eye}
                label="Clarity"
                subLabel="Insights"
                className="top-[36%] right-0 z-10"
                delay={0.45}
            />

            {/* Bottom — Spend */}
            <GlassBubble
                size="sm"
                icon={Zap}
                label="Spend"
                subLabel="Cost"
                className="bottom-[5%] left-1/2 -translate-x-[60%] z-10"
                delay={0.6}
            />
        </div>
    );
}

/* ─── Main Section ─── */
export function Features() {
    return (
        <section id="features" className="py-28 md:py-36 relative overflow-hidden">
            <div className="container relative z-10 mx-auto px-4 md:px-6">

                {/* Two-Column Grid with Vertical Divider */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-0 items-center relative">

                    {/* Vertical Divider */}
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />

                    {/* Left Column — Text */}
                    <div className="lg:pr-16 xl:pr-24">
                        <FadeIn>
                            <p className="text-coral font-bold tracking-widest uppercase text-sm mb-5">
                                The Solution
                            </p>
                            <h2 className="text-4xl md:text-[3.5rem] lg:text-[3.8rem] font-bold font-heading text-white leading-[1.1] mb-8">
                                One platform.<br />
                                Three financial&nbsp;lenses.
                            </h2>
                            <p className="text-base md:text-lg text-white/50 leading-relaxed max-w-lg">
                                ProfitPulse makes your financial data visible across the
                                entire organization and turns it into revenue, spend, and
                                growth insights leaders can act on.
                            </p>
                            <DotGrid />
                        </FadeIn>
                    </div>

                    {/* Right Column — Diagram */}
                    <div className="lg:pl-16 xl:pl-24">
                        <VennDiagram />
                    </div>
                </div>

                {/* Bottom Caption */}
                <FadeIn delay={0.4}>
                    <p className="text-center text-white/40 text-sm md:text-base max-w-2xl mx-auto mt-20 leading-relaxed">
                        A lightweight integration captures every financial data point — without
                        slowing down your teams or changing their workflows.
                    </p>
                </FadeIn>
            </div>
        </section>
    );
}
