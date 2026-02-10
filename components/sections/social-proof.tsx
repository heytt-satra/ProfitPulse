"use client";

import { FadeIn } from "@/components/animations/fade-in";
import { motion } from "framer-motion";
import {
    CreditCard,
    ShoppingBag,
    Megaphone,
    BarChart3,
    Quote,
    Sparkles,
    Users,
    DollarSign,
    Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

const integrations = [
    { name: "Stripe", icon: CreditCard, desc: "Payments" },
    { name: "Shopify", icon: ShoppingBag, desc: "E-commerce" },
    { name: "Meta Ads", icon: Megaphone, desc: "Advertising" },
    { name: "Google Ads", icon: BarChart3, desc: "Advertising" },
];

const stats = [
    { icon: Users, value: "50+", label: "Founding Members" },
    { icon: Plug, value: "4", label: "Integrations" },
    { icon: DollarSign, value: "$2M+", label: "Revenue Tracked" },
];

/* ─── Floating Integration Card ─── */
function IntegrationPill({
    integration,
    index,
}: {
    integration: (typeof integrations)[0];
    index: number;
}) {
    const Icon = integration.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
                duration: 0.6,
                delay: 0.15 * index,
                ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -6, scale: 1.03 }}
            className="group relative"
        >
            {/* Glow on hover */}
            <div className="absolute -inset-px rounded-2xl bg-coral/0 group-hover:bg-coral/20 blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100" />

            <div className="relative bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 group-hover:border-coral/30 group-hover:bg-white/[0.07]">
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-coral/15 flex items-center justify-center shrink-0 group-hover:bg-coral/25 transition-colors duration-300">
                    <Icon
                        size={20}
                        className="text-coral"
                        strokeWidth={2}
                    />
                </div>

                {/* Text */}
                <div>
                    <p className="font-bold text-white text-sm">
                        {integration.name}
                    </p>
                    <p className="text-white/30 text-xs">{integration.desc}</p>
                </div>

                {/* Connected indicator */}
                <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                    <span className="text-teal text-[10px] font-medium uppercase tracking-wider">
                        Live
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Main Export ─── */
export function SocialProof() {
    return (
        <section id="social_proof" className="py-28 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* ── Header ── */}
                <FadeIn className="text-center mb-16">
                    <p className="text-sm font-semibold tracking-widest uppercase text-teal mb-3">
                        Our Story
                    </p>
                    <h2 className="text-3xl md:text-5xl font-bold font-heading text-white">
                        Built by a Founder,{" "}
                        <span className="text-coral">For Founders</span>
                    </h2>
                </FadeIn>

                {/* ── Main Content Grid ── */}
                <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start max-w-6xl mx-auto">
                    {/* ── Left: Founder Quote Card ── */}
                    <FadeIn delay={0.1}>
                        <div className="relative">
                            {/* Subtle card glow */}
                            <div className="absolute -inset-1 bg-gradient-to-br from-coral/10 via-transparent to-teal/10 rounded-3xl blur-xl opacity-60" />

                            <div className="relative bg-indigo/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10">
                                {/* Quote mark decoration */}
                                <div className="absolute top-6 left-6 md:top-8 md:left-8">
                                    <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                                        <Quote
                                            size={18}
                                            className="text-coral"
                                        />
                                    </div>
                                </div>

                                {/* Quote text */}
                                <blockquote className="text-lg md:text-xl text-white/70 italic leading-relaxed mt-14 mb-8">
                                    &ldquo;After spending 6 hours/week manually
                                    reconciling Stripe, Meta, and bank
                                    statements in Google Sheets, I built the
                                    tool I wish existed.&rdquo;
                                </blockquote>

                                {/* Divider */}
                                <div className="w-12 h-0.5 bg-coral/40 mb-6" />

                                {/* Author */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center text-sm font-bold font-heading text-white shadow-lg shadow-coral/25">
                                        HS
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">
                                            heytt satra
                                        </p>
                                        <p className="text-sm text-white/40">
                                            Founder, ProfitPulse
                                        </p>
                                    </div>
                                </div>

                                {/* Decorative dots — bottom right */}
                                <div className="absolute bottom-6 right-6 grid grid-cols-4 gap-1.5 opacity-20">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 h-1 rounded-full bg-white"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* ── Right: Integrations + Hub ── */}
                    <div className="space-y-4">
                        {/* Hub header */}
                        <FadeIn delay={0.2}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-coral/15 flex items-center justify-center">
                                    <Sparkles
                                        size={16}
                                        className="text-coral"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg font-heading">
                                        Works With Your Stack
                                    </h3>
                                    <p className="text-white/30 text-xs">
                                        Connect in under 2 minutes
                                    </p>
                                </div>
                            </div>
                        </FadeIn>

                        {/* Integration pills */}
                        <div className="space-y-3">
                            {integrations.map((integration, i) => (
                                <IntegrationPill
                                    key={i}
                                    integration={integration}
                                    index={i}
                                />
                            ))}
                        </div>

                        {/* "More coming soon" teaser */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8 }}
                            className="flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 rounded-xl"
                        >
                            <Plug size={14} className="text-white/20" />
                            <span className="text-xs text-white/30 font-medium">
                                QuickBooks, Xero, WooCommerce &mdash; coming
                                soon
                            </span>
                        </motion.div>
                    </div>
                </div>


            </div>
        </section>
    );
}
