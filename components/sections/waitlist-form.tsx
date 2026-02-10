"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Lock, Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/animations/fade-in";
import { Logo } from "@/components/ui/logo";

const formSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    monthlyRevenue: z.string().min(1, "Please select your revenue range"),
    platform: z.string().min(1, "Please select your primary platform"),
    biggestPain: z.string().optional(),
    honeypot: z.string().max(0, "Spam detected"),
});

type FormValues = z.infer<typeof formSchema>;

export function WaitlistForm() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            monthlyRevenue: "",
            platform: "",
            biggestPain: "",
            honeypot: "",
        },
    });

    async function onSubmit(values: FormValues) {
        setIsLoading(true);
        setServerError(null);

        try {
            const response = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to join waitlist");
            }

            setIsSubmitted(true);
            form.reset();
        } catch (error: any) {
            setServerError(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const inputStyle = "w-full px-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral/40 transition-all duration-300 hover:bg-white/[0.05]";
    const labelStyle = "text-xs font-bold tracking-widest uppercase text-white/40 mb-1.5 block";

    return (
        <section id="join" className="py-32 relative overflow-hidden">
            <div className="max-w-2xl mx-auto relative z-10 px-4 md:px-6">
                <FadeIn className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral/10 border border-coral/20 text-coral text-[10px] font-bold uppercase tracking-wider mb-4">
                        <Logo iconOnly className="scale-[0.3]" />
                        Early Access
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4 text-white">
                        Stop Guessing. <span className="text-coral">Start Knowing.</span>
                    </h2>
                    <p className="text-lg text-white/50 max-w-lg mx-auto leading-relaxed">
                        Join 50+ founders who have ditched manual spreadsheets for
                        real-time profitability insights.
                    </p>
                </FadeIn>

                <FadeIn delay={0.2}>
                    <div className="relative">
                        {/* Decorative background glow */}
                        <div className="absolute -inset-1 bg-linear-to-br from-coral/20 via-transparent to-teal/10 rounded-4xl blur-2xl opacity-50" />

                        <div className="relative bg-indigo/40 backdrop-blur-xl p-8 md:p-12 rounded-4xl border border-white/10 shadow-2xl">
                            <AnimatePresence mode="wait">
                                {isSubmitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-6"
                                    >
                                        <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal/20">
                                            <CheckCircle2 size={40} className="text-teal" />
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 font-heading">You&apos;re on the list! 🎉</h3>
                                        <p className="text-white/50 mb-8 max-w-sm mx-auto">
                                            We&apos;ve sent a confirmation to your inbox. Early access rolls out in March 2026.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-6"
                                    >
                                        <input type="text" {...form.register("honeypot")} className="hidden" aria-hidden="true" />

                                        <div className="space-y-2">
                                            <label htmlFor="email" className={labelStyle}>Email Address</label>
                                            <input
                                                id="email"
                                                type="email"
                                                placeholder="founder@yourcompany.com"
                                                {...form.register("email")}
                                                className={cn(inputStyle, form.formState.errors.email && "border-coral/50 ring-coral/10")}
                                            />
                                            {form.formState.errors.email && (
                                                <p className="text-[11px] text-coral flex items-center gap-1 mt-1 font-medium">
                                                    <AlertCircle size={12} /> {form.formState.errors.email.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label htmlFor="revenue" className={labelStyle}>Monthly Revenue</label>
                                                <div className="relative">
                                                    <select
                                                        id="revenue"
                                                        {...form.register("monthlyRevenue")}
                                                        className={cn(inputStyle, "appearance-none cursor-pointer")}
                                                    >
                                                        <option value="" className="bg-indigo">Select range</option>
                                                        <option value="under_10k" className="bg-indigo">Under $10K</option>
                                                        <option value="10k_50k" className="bg-indigo">$10K - $50K</option>
                                                        <option value="50k_100k" className="bg-indigo">$50K - $100K</option>
                                                        <option value="100k_500k" className="bg-indigo">$100K - $500K</option>
                                                        <option value="over_500k" className="bg-indigo">$500K+</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                {form.formState.errors.monthlyRevenue && (
                                                    <p className="text-[11px] text-coral mt-1 font-medium">{form.formState.errors.monthlyRevenue.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="platform" className={labelStyle}>Primary Platform</label>
                                                <div className="relative">
                                                    <select
                                                        id="platform"
                                                        {...form.register("platform")}
                                                        className={cn(inputStyle, "appearance-none cursor-pointer")}
                                                    >
                                                        <option value="" className="bg-indigo">Select platform</option>
                                                        <option value="stripe" className="bg-indigo">Stripe</option>
                                                        <option value="shopify" className="bg-indigo">Shopify</option>
                                                        <option value="woocommerce" className="bg-indigo">WooCommerce</option>
                                                        <option value="meta_ads" className="bg-indigo">Meta Ads</option>
                                                        <option value="google_ads" className="bg-indigo">Google Ads</option>
                                                        <option value="other" className="bg-indigo">Other</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                {form.formState.errors.platform && (
                                                    <p className="text-[11px] text-coral mt-1 font-medium">{form.formState.errors.platform.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="pain" className={labelStyle}>
                                                Biggest financial blind spot? <span className="lowercase font-normal opacity-50">(Optional)</span>
                                            </label>
                                            <textarea
                                                id="pain"
                                                {...form.register("biggestPain")}
                                                rows={3}
                                                className={cn(inputStyle, "resize-none")}
                                                placeholder="e.g., I never know my real profit margin after ad spend..."
                                            />
                                        </div>

                                        {serverError && (
                                            <div className="p-3 rounded-xl bg-coral/10 border border-coral/20 text-coral text-sm flex items-center gap-2">
                                                <AlertCircle size={16} />
                                                {serverError}
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <Button
                                                variant="mint"
                                                type="submit"
                                                className="w-full h-14 text-lg font-bold shadow-xl shadow-coral/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                                isLoading={isLoading}
                                            >
                                                {isLoading ? "Securing your spot..." : "Join the Waitlist"}
                                                {!isLoading && <Send size={18} className="ml-2" />}
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-center gap-6 pt-4">
                                            <p className="text-[10px] text-white/20 flex items-center gap-1.5 uppercase tracking-tighter font-bold">
                                                <Lock size={10} className="text-teal/40" />
                                                Bank-Grade Security
                                            </p>
                                            <div className="w-1 h-1 rounded-full bg-white/10" />
                                            <p className="text-[10px] text-white/20 flex items-center gap-1.5 uppercase tracking-tighter font-bold">
                                                <Logo iconOnly className="scale-[0.25] opacity-40" />
                                                Early Access Invite
                                            </p>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
