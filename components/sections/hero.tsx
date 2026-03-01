"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Bell,
    LayoutDashboard,
    Lightbulb,
    MessageSquare,
    PieChart,
    Search,
    Settings,
    Sparkles,
    TrendingDown,
} from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

interface PreviewMessage {
    id: number;
    role: "user" | "assistant" | "suggestion";
    text: string;
    delay?: number;
}

function DashboardPreview() {
    const [messages, setMessages] = useState<PreviewMessage[]>([]);

    useEffect(() => {
        const sequence: PreviewMessage[] = [
            { id: 1, role: "user", text: "Why did my profit drop this week?", delay: 800 },
            { id: 2, role: "assistant", text: "profit-drop", delay: 2500 },
            {
                id: 3,
                role: "suggestion",
                text: "3 of your ad sets have ROAS below 1.5x. Pausing them would save ~$180/day.",
                delay: 5000,
            },
        ];

        const timeouts: NodeJS.Timeout[] = [];
        sequence.forEach((message) => {
            timeouts.push(
                setTimeout(() => {
                    setMessages((prev) => [...prev, message]);
                }, message.delay),
            );
        });

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-white/5 bg-dark shadow-2xl shadow-black/50">
            <div className="flex h-10 items-center justify-between border-b border-white/5 bg-indigo/50 px-4">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full border border-red-400/50 bg-red-400/20" />
                    <div className="h-3 w-3 rounded-full border border-amber-400/50 bg-amber-400/20" />
                    <div className="h-3 w-3 rounded-full border border-green-400/50 bg-green-400/20" />
                </div>
                <div className="text-[10px] font-medium uppercase tracking-widest text-white/30">
                    ProfitPulse Dashboard
                </div>
                <div className="w-16" />
            </div>

            <div className="flex h-[500px] md:h-[600px]">
                <div className="hidden w-16 flex-col border-r border-white/5 bg-indigo/30 py-4 md:flex md:w-64">
                    <div className="flex items-center gap-3 border-b border-white/5 p-4">
                        <Logo iconOnly className="scale-75" />
                        <div className="hidden md:block">
                            <div className="text-sm font-bold uppercase tracking-tight text-white">ProfitPulse</div>
                            <div className="text-[10px] text-white/40">v2.0.4</div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-1 px-3 py-6">
                        <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-white">
                            <MessageSquare size={18} className="text-coral" />
                            <span className="text-sm font-medium">AI CFO Chat</span>
                        </div>
                        {[
                            { icon: LayoutDashboard, label: "Overview" },
                            { icon: PieChart, label: "Analytics" },
                            { icon: Settings, label: "Settings" },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                <item.icon size={18} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/5 p-4">
                        <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/20 text-xs font-bold uppercase text-teal">
                                JS
                            </div>
                            <div className="hidden overflow-hidden md:block">
                                <div className="truncate text-sm font-medium text-white">John Smith</div>
                                <div className="truncate text-[10px] text-white/40">Pro Plan</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex w-14 flex-col items-center gap-6 border-r border-white/5 bg-indigo/30 py-4 md:hidden">
                    <Logo iconOnly className="scale-50" />
                    <MessageSquare size={20} className="text-coral" />
                    <LayoutDashboard size={20} className="text-white/40" />
                    <PieChart size={20} className="text-white/40" />
                </div>

                <div className="relative flex flex-1 flex-col bg-dark/90">
                    <div className="flex h-16 items-center justify-between border-b border-white/5 bg-indigo/10 px-6">
                        <div className="flex items-center gap-3 text-sm text-white/50">
                            <span className="flex items-center gap-2">
                                <Sparkles size={14} className="text-coral" />
                                AI Assistant
                            </span>
                            <span className="text-white/20">/</span>
                            <span className="text-white">New Conversation</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/40">
                            <Search size={18} />
                            <Bell size={18} />
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto p-4 md:p-8">
                        <div className="flex justify-start">
                            <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-white/5 bg-indigo px-5 py-4 text-white shadow-sm md:max-w-[80%]">
                                <p className="text-sm leading-relaxed text-white/80 md:text-base">
                                    Good morning, John! I&apos;ve analyzed your Stripe and Meta Ads data. Your{" "}
                                    <span className="font-semibold text-white">Net Profit</span> is{" "}
                                    <span className="font-bold text-coral">$4,250</span> this week (down 8%).
                                    How can I help you?
                                </p>
                            </div>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {message.role === "user" && (
                                        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-coral px-5 py-4 text-sm font-medium text-white shadow-lg shadow-coral/10 md:text-base">
                                            {message.text}
                                        </div>
                                    )}

                                    {message.role === "assistant" && (
                                        <div className="w-full max-w-[90%] rounded-2xl rounded-tl-sm border border-white/5 bg-indigo px-5 py-4 text-white shadow-sm md:max-w-[80%] md:w-auto">
                                            <p className="mb-3 text-sm leading-relaxed md:text-base">
                                                Your profit decreased{" "}
                                                <span className="font-bold text-coral">12%</span> ($847 vs $963 last week).
                                            </p>
                                            <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-xs md:text-sm">
                                                <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                                                <span className="leading-relaxed text-white/70">
                                                    Meta Ads CPM increased{" "}
                                                    <span className="font-bold text-coral">40%</span> while revenue stayed
                                                    flat.
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {message.role === "suggestion" && (
                                        <div className="max-w-[90%] rounded-xl border border-teal/10 bg-teal/5 px-4 py-3 text-white md:max-w-[80%]">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal/10">
                                                    <Lightbulb size={14} className="text-teal" />
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-teal">
                                                        Recommendation
                                                    </p>
                                                    <p className="text-sm leading-relaxed text-white/80">{message.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {messages.length < 3 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-2 flex items-center gap-1.5 pt-2">
                                {[0, 1, 2].map((index) => (
                                    <div
                                        key={index}
                                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30"
                                        style={{ animationDelay: `${index * 200}ms`, animationDuration: "1.5s" }}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </div>

                    <div className="border-t border-white/5 bg-indigo/10 p-4 md:p-6">
                        <div className="relative">
                            <div className="flex h-14 w-full items-center rounded-xl border border-white/10 bg-black/30 pl-4 pr-14 text-sm text-white/30">
                                Ask ProfitPulse anything...
                            </div>
                            <div className="absolute bottom-2 right-2 top-2 flex w-10 items-center justify-center rounded-lg border border-white/5 bg-white/5">
                                <ArrowRight size={16} className="text-white/30" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Hero() {
    const router = useRouter();

    return (
        <div id="hero" className="relative min-h-screen overflow-hidden">
            <div className="relative z-10 flex min-h-screen flex-col">
                <div className="container mx-auto flex flex-1 flex-col justify-center px-4 pb-20 pt-36 text-center">
                    <FadeIn delay={0.1}>
                        <h1 className="mx-auto mb-8 max-w-5xl font-heading text-5xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-[5rem]">
                            Your Business Has a <span className="text-coral">Profit Problem</span>.
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/50 md:text-xl">
                            ProfitPulse turns your scattered financial data into a conversational AI CFO that actually answers your questions.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.3}>
                        <div className="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button
                                variant="mint"
                                size="lg"
                                className="h-14 w-full rounded-full px-8 text-lg shadow-xl shadow-teal/20 sm:w-auto"
                                onClick={() => router.push("/dashboard")}
                            >
                                Open Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-14 w-full rounded-full border-white/10 px-8 text-lg text-white hover:bg-white/5 hover:text-white sm:w-auto"
                                onClick={() => document.getElementById("solution_demo")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                See How It Works
                            </Button>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.4} className="relative mx-auto w-full max-w-6xl px-2 sm:px-4">
                        <div
                            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[400px] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo/15"
                            style={{ filter: "blur(80px)" }}
                        />
                        <DashboardPreview />
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}
