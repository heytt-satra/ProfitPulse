"use client";

import { motion } from "framer-motion";
import { Plug, Quote, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import { IntegrationLogo, type IntegrationType } from "@/components/ui/integration-logo";

const integrations: { name: string; type: IntegrationType; desc: string }[] = [
    { name: "Stripe", type: "stripe", desc: "Payments" },
    { name: "Shopify", type: "shopify", desc: "E-commerce" },
    { name: "Meta Ads", type: "meta", desc: "Advertising" },
    { name: "Google Ads", type: "google", desc: "Advertising" },
];

function IntegrationPill({
    integration,
    index,
}: {
    integration: (typeof integrations)[number];
    index: number;
}) {
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
            <div className="absolute -inset-px rounded-2xl bg-coral/0 opacity-0 blur-xl transition-all duration-500 group-hover:bg-coral/20 group-hover:opacity-100" />

            <div className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 group-hover:border-coral/30 group-hover:bg-white/[0.07]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 transition-colors duration-300 group-hover:bg-coral/25">
                    <IntegrationLogo
                        type={integration.type}
                        className="transition-transform duration-300 group-hover:scale-110"
                    />
                </div>

                <div>
                    <p className="text-sm font-bold text-white">{integration.name}</p>
                    <p className="text-xs text-white/30">{integration.desc}</p>
                </div>

                <div className="ml-auto flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-teal" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-teal">Live</span>
                </div>
            </div>
        </motion.div>
    );
}

export function SocialProof() {
    return (
        <section id="social_proof" className="relative overflow-hidden py-28">
            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <FadeIn className="mb-16 text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-teal">Our Story</p>
                    <h2 className="font-heading text-3xl font-bold text-white md:text-5xl">
                        Built by a Founder, <span className="text-coral">For Founders</span>
                    </h2>
                </FadeIn>

                <div className="mx-auto grid max-w-6xl items-start gap-10 md:grid-cols-2 lg:gap-16">
                    <FadeIn delay={0.1}>
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-coral/10 via-transparent to-teal/10 opacity-60 blur-xl" />

                            <div className="relative rounded-3xl border border-white/10 bg-indigo/80 p-8 md:p-10">
                                <div className="absolute left-6 top-6 md:left-8 md:top-8">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/10">
                                        <Quote size={18} className="text-coral" />
                                    </div>
                                </div>

                                <blockquote className="mb-8 mt-14 text-lg italic leading-relaxed text-white/70 md:text-xl">
                                    &ldquo;After spending 6 hours/week manually reconciling Stripe, Meta, and bank statements in Google Sheets, I built the tool I wish existed.&rdquo;
                                </blockquote>

                                <div className="mb-6 h-0.5 w-12 bg-coral/40" />

                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coral font-heading text-sm font-bold text-white shadow-lg shadow-coral/25">
                                        HS
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">heytt satra</p>
                                        <p className="text-sm text-white/40">Founder, ProfitPulse</p>
                                    </div>
                                </div>

                                <div className="absolute bottom-6 right-6 grid grid-cols-4 gap-1.5 opacity-20">
                                    {Array.from({ length: 16 }).map((_, index) => (
                                        <div key={index} className="h-1 w-1 rounded-full bg-white" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    <div className="space-y-4">
                        <FadeIn delay={0.2}>
                            <div className="mb-2 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral/15">
                                    <Sparkles size={16} className="text-coral" />
                                </div>
                                <div>
                                    <h3 className="font-heading text-lg font-bold text-white">Works With Your Stack</h3>
                                    <p className="text-xs text-white/30">Connect in under 2 minutes</p>
                                </div>
                            </div>
                        </FadeIn>

                        <div className="space-y-3">
                            {integrations.map((integration, index) => (
                                <IntegrationPill key={integration.name} integration={integration} index={index} />
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8 }}
                            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-3"
                        >
                            <Plug size={14} className="text-white/20" />
                            <span className="text-xs font-medium text-white/30">
                                QuickBooks, Xero, WooCommerce - coming soon
                            </span>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
