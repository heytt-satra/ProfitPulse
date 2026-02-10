"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import { ArrowRight, Sparkles, TrendingDown, Lightbulb, Menu, X, ChevronDown, LayoutDashboard, MessageSquare, PieChart, Settings, Search, Bell, User } from "lucide-react";
import { ShadowOverlay } from "@/components/ui/shadow-overlay";
import { Logo } from "@/components/ui/logo";

// --- Dashboard Component (New) ---
function DashboardPreview() {
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        const sequence = [
            { id: 1, role: "user", text: "Why did my profit drop this week?", delay: 800 },
            { id: 2, role: "assistant", text: "profit-drop", delay: 2500 },
            { id: 3, role: "suggestion", text: "3 of your ad sets have ROAS below 1.5x. Pausing them would save ~$180/day.", delay: 5000 },
        ];
        let timeouts: NodeJS.Timeout[] = [];
        sequence.forEach((msg) => {
            timeouts.push(setTimeout(() => setMessages((prev) => [...prev, msg]), msg.delay));
        });
        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div className="relative mx-auto w-full max-w-5xl shadow-2xl shadow-black/50 rounded-xl overflow-hidden border border-white/5 bg-dark">
            {/* Window Controls / Header */}
            <div className="h-10 bg-indigo/50 border-b border-white/5 flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/50" />
                    <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-400/50" />
                </div>
                <div className="text-[10px] text-white/30 font-medium tracking-widest uppercase">ProfitPulse Dashboard</div>
                <div className="w-16" /> {/* Spacer */}
            </div>

            <div className="flex h-[500px] md:h-[600px]">
                {/* Sidebar */}
                <div className="w-16 md:w-64 border-r border-white/5 bg-indigo/30 flex flex-col hidden md:flex">
                    <div className="p-4 border-b border-white/5 flex items-center gap-3">
                        <Logo iconOnly className="scale-75" />
                        <div className="hidden md:block">
                            <div className="text-sm font-bold text-white uppercase tracking-tight">ProfitPulse</div>
                            <div className="text-[10px] text-white/40">v2.0.4</div>
                        </div>
                    </div>

                    <div className="flex-1 py-6 space-y-1 px-3">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-white cursor-pointer border border-white/5">
                            <MessageSquare size={18} className="text-coral" />
                            <span className="text-sm font-medium">AI CFO Chat</span>
                        </div>
                        {[
                            { icon: LayoutDashboard, label: "Overview" },
                            { icon: PieChart, label: "Analytics" },
                            { icon: Settings, label: "Settings" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                                <item.icon size={18} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-teal font-bold text-xs uppercase">JS</div>
                            <div className="hidden md:block overflow-hidden">
                                <div className="text-sm font-medium text-white truncate">John Smith</div>
                                <div className="text-[10px] text-white/40 truncate">Pro Plan</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sidebar Icon Only (simulated for simpler code, or just hide sidebar on mobile and show full chat) */}
                <div className="w-14 border-r border-white/5 bg-indigo/30 flex flex-col items-center py-4 gap-6 md:hidden">
                    <Logo iconOnly className="scale-50" />
                    <MessageSquare size={20} className="text-coral" />
                    <LayoutDashboard size={20} className="text-white/40" />
                    <PieChart size={20} className="text-white/40" />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-dark/80 backdrop-blur-sm relative">
                    {/* Top Bar */}
                    <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-indigo/10">
                        <div className="flex items-center gap-3 text-white/50 text-sm">
                            <span className="flex items-center gap-2"><Sparkles size={14} className="text-coral" /> AI Assistant</span>
                            <span className="text-white/20">/</span>
                            <span className="text-white">New Conversation</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/40">
                            <Search size={18} />
                            <Bell size={18} />
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                        {/* Welcome Message */}
                        <div className="flex justify-start">
                            <div className="bg-indigo border border-white/5 text-white rounded-2xl rounded-tl-sm px-5 py-4 max-w-[90%] md:max-w-[80%] shadow-sm">
                                <p className="text-sm md:text-base leading-relaxed text-white/80">
                                    Good morning, John! ☀️ I've analyzed your Stripe and Meta Ads data.
                                    Your <span className="text-white font-semibold">Net Profit</span> is <span className="text-coral font-bold">$4,250</span> this week (down 8%).
                                    How can I help you?
                                </p>
                            </div>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {messages.map((msg) => (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    {msg.role === "user" && (
                                        <div className="bg-coral text-white rounded-2xl rounded-br-sm px-5 py-4 max-w-[85%] shadow-lg shadow-coral/10 font-medium text-sm md:text-base">
                                            {msg.text}
                                        </div>
                                    )}
                                    {msg.role === "assistant" && (
                                        <div className="bg-indigo border border-white/5 text-white rounded-2xl rounded-tl-sm px-5 py-4 max-w-[90%] md:max-w-[80%] shadow-sm w-full md:w-auto">
                                            <p className="text-sm md:text-base leading-relaxed mb-3">Your profit decreased <span className="font-bold text-coral">12%</span> ($847 vs $963 last week).</p>
                                            <div className="flex items-start gap-3 text-xs md:text-sm bg-black/20 px-4 py-3 rounded-xl border border-white/5">
                                                <TrendingDown className="text-coral w-4 h-4 mt-0.5 shrink-0" />
                                                <span className="text-white/70 leading-relaxed">Meta Ads CPM increased <span className="font-bold text-coral">40%</span> while revenue stayed flat.</span>
                                            </div>
                                        </div>
                                    )}
                                    {msg.role === "suggestion" && (
                                        <div className="bg-teal/5 border border-teal/10 text-white rounded-xl px-4 py-3 max-w-[90%] md:max-w-[80%]">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-lg bg-teal/10 flex items-center justify-center shrink-0 mt-0.5"><Lightbulb size={14} className="text-teal" /></div>
                                                <div><p className="text-xs font-bold text-teal mb-1 uppercase tracking-wide">Recommendation</p><p className="text-sm text-white/80 leading-relaxed">{msg.text}</p></div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {messages.length < 3 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 ml-2 pt-2">
                                {[0, 1, 2].map((i) => (<div key={i} className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />))}
                            </motion.div>
                        )}
                    </div>

                    {/* Input Mockup */}
                    <div className="p-4 md:p-6 border-t border-white/5 bg-indigo/10">
                        <div className="relative">
                            <div className="w-full bg-black/30 border border-white/10 rounded-xl h-14 pl-4 pr-14 flex items-center text-white/30 text-sm">
                                Ask ProfitPulse anything...
                            </div>
                            <div className="absolute right-2 top-2 bottom-2 w-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                                <ArrowRight size={16} className="text-white/30" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Navigation Components ---
function NavItem({ label, hasDropdown = false }: { label: string; hasDropdown?: boolean }) {
    return (
        <div className="flex items-center text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer group">
            <span>{label}</span>
            {hasDropdown && (
                <ChevronDown size={14} className="ml-1 text-white/50 group-hover:text-white transition-colors" />
            )}
        </div>
    );
}

function MobileNavItem({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-between border-b border-white/10 pb-3 text-lg text-white">
            <span>{label}</span>
            <ArrowRight className="h-4 w-4 text-white/40" />
        </div>
    );
}

export function Hero() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div id="hero" className="relative min-h-screen overflow-hidden">
            {/* Background moved to global layout */}

            {/* Content container */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Navigation Removed - Replaced by Floating NavBar in Layout */}

                {/* Mobile Navigation Menu Removed */}

                {/* Centered Hero Content */}
                <div className="container mx-auto pt-36 px-4 text-center flex-1 flex flex-col justify-center pb-20">



                    <FadeIn delay={0.1}>
                        <h1 className="mx-auto max-w-5xl text-5xl md:text-6xl lg:text-[5rem] font-bold leading-[1.1] tracking-tight text-white mb-8 font-heading drop-shadow-lg">
                            Your Business Has a <span className="text-coral">Profit Problem</span>.
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <p className="mx-auto max-w-2xl text-lg md:text-xl text-white/50 leading-relaxed mb-10">
                            ProfitPulse turns your scattered financial data into a conversational AI CFO that actually answers your questions.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.3}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                            <Button
                                variant="mint"
                                size="lg"
                                className="h-14 px-8 rounded-full text-lg shadow-xl shadow-teal/20 w-full sm:w-auto"
                                onClick={() => document.getElementById("waitlist_form")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                Join Early Access <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 rounded-full text-lg border-white/10 text-white hover:bg-white/5 hover:text-white w-full sm:w-auto"
                                onClick={() => document.getElementById("solution_demo")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                See How It Works
                            </Button>
                        </div>
                    </FadeIn>

                    {/* New Dashboard Hero Visual */}
                    <FadeIn delay={0.4} className="relative mx-auto w-full max-w-6xl px-2 sm:px-4">
                        {/* Glow effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-indigo/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

                        {/* Dashboard Mockup */}
                        <DashboardPreview />
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}
