"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

/* ─── Custom Hook for Media Query ─── */
function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [matches, query]);
    return matches;
}

interface PricingPlan {
    name: string;
    price: string;
    yearlyPrice: string;
    period: string;
    features: string[];
    description: string;
    buttonText: string;
    href: string;
    isPopular: boolean;
}

interface PricingProps {
    plans?: PricingPlan[];
    title?: string;
    description?: string;
}

const defaultPlans: PricingPlan[] = [
    {
        name: "Starter",
        price: "10",
        yearlyPrice: "8",
        period: "month",
        features: [
            "Real-time profit tracking",
            "Daily Morning Pulse",
            "Basic insights",
            "Email support",
        ],
        description: "Perfect for solo founders starting out.",
        buttonText: "Start Free Trial",
        href: "#waitlist_form",
        isPopular: false,
    },
    {
        name: "Founder",
        price: "25",
        yearlyPrice: "20",
        period: "month",
        features: [
            "Everything in Starter",
            "Natural Language AI Queries",
            "All integrations (Stripe, Ads)",
            "Priority Beta Access",
            "Lifetime Price Lock",
        ],
        description: "Best value for growing businesses.",
        buttonText: "Join Waitlist",
        href: "#waitlist_form",
        isPopular: true,
    },
    {
        name: "Growth",
        price: "50",
        yearlyPrice: "40",
        period: "month",
        features: [
            "Everything in Founder",
            "Multi-user access",
            "Advanced custom reports",
            "Dedicated account manager",
            "API Access",
        ],
        description: "For scaling teams needing power.",
        buttonText: "Contact Sales",
        href: "#waitlist_form",
        isPopular: false,
    },
];

export function Pricing({
    plans = defaultPlans,
    title = "Simple, Transparent Pricing",
    description = "Choose the plan that works for you.\\nAll plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
    const [isMonthly, setIsMonthly] = useState(true);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const switchRef = useRef<HTMLButtonElement>(null);

    const handleToggle = (checked: boolean) => {
        setIsMonthly(!checked);
        if (checked && switchRef.current) {
            const rect = switchRef.current.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            confetti({
                particleCount: 50,
                spread: 60,
                origin: {
                    x: x / window.innerWidth,
                    y: y / window.innerHeight,
                },
                colors: [
                    "#E84545", // Coral
                    "#008170", // Teal
                    "#2B2E4A", // Indigo
                    "#ffffff", // White
                ],
                ticks: 200,
                gravity: 1.2,
                decay: 0.94,
                startVelocity: 30,
                shapes: ["circle"],
            });
        }
    };

    return (
        <section id="pricing" className="container py-16 md:py-20 relative px-4 md:px-6">
            <div className="text-center space-y-4 mb-10 md:mb-12 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight sm:text-5xl font-heading text-white">
                    {title}
                </h2>
                <p className="text-white/60 text-base md:text-lg whitespace-pre-line max-w-2xl mx-auto">
                    {description}
                </p>
            </div>

            <div className="flex justify-center mb-8 md:mb-10 relative z-10">
                <label className="relative inline-flex items-center cursor-pointer">
                    <Label>
                        <Switch
                            ref={switchRef as any}
                            checked={!isMonthly}
                            onCheckedChange={handleToggle}
                            className="relative data-[state=checked]:bg-teal"
                        />
                    </Label>
                </label>
                <span className="ml-2 font-semibold text-white text-sm md:text-base">
                    Annual billing <span className="text-teal">(Save 20%)</span>
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative z-10 lg:items-center max-w-sm md:max-w-none mx-auto">
                {plans.map((plan, index) => (
                    <motion.div
                        key={index}
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={
                            isDesktop
                                ? {
                                    y: plan.isPopular ? -20 : 0,
                                    opacity: 1,
                                    x: index === 2 ? -30 : index === 0 ? 30 : 0,
                                    scale: index === 0 || index === 2 ? 0.94 : 1.0,
                                }
                                : { opacity: 1, y: 0 }
                        }
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{
                            duration: 0.8,
                            type: "spring",
                            stiffness: 100,
                            damping: 30,
                            delay: index * 0.1,
                            opacity: { duration: 0.5 },
                        }}
                        className={cn(
                            `rounded-2xl border-[1px] p-5 md:p-6 text-center lg:flex lg:flex-col lg:justify-center relative`,
                            plan.isPopular ? "border-coral border-2 bg-indigo/50 shadow-2xl shadow-coral/10 z-20" : "border-white/10 bg-white/[0.03] z-10 hover:border-white/20 transition-colors",
                            "flex flex-col h-full",
                            !plan.isPopular && "mt-0 lg:mt-5",
                        )}
                    >
                        {plan.isPopular && (
                            <div className="absolute top-0 right-0 bg-coral py-1 px-3 rounded-bl-xl rounded-tr-xl flex items-center shadow-lg shadow-coral/20">
                                <Star className="text-white h-3.5 w-3.5 fill-current" />
                                <span className="text-white ml-1 font-sans font-bold text-xs uppercase tracking-wide">
                                    Popular
                                </span>
                            </div>
                        )}
                        <div className="flex-1 flex flex-col">
                            <p className={cn("text-base font-semibold", plan.isPopular ? "text-coral" : "text-white/60")}>
                                {plan.name}
                            </p>
                            <div className="mt-4 md:mt-6 flex items-center justify-center gap-x-1">
                                <span className="text-4xl md:text-5xl font-bold tracking-tight text-white flex items-start justify-center">
                                    <span className="text-2xl md:text-3xl mt-1">$</span>
                                    <NumberFlow
                                        value={
                                            isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                                        }
                                        format={{
                                            style: "decimal",
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                        }}
                                        transformTiming={{
                                            duration: 500,
                                            easing: "ease-out",
                                        }}
                                        willChange
                                        className="font-variant-numeric: tabular-nums"
                                    />
                                </span>
                                {plan.period !== "Next 3 months" && (
                                    <span className="text-xs md:text-sm font-semibold leading-6 tracking-wide text-white/40 self-end mb-1.5 md:mb-2">
                                        / {plan.period}
                                    </span>
                                )}
                            </div>

                            <p className="text-xs leading-5 text-white/40 mt-1">
                                {isMonthly ? "billed monthly" : "billed annually"}
                            </p>

                            <hr className={cn("w-full my-4 md:my-6", plan.isPopular ? "border-white/10" : "border-white/5")} />

                            <ul className="gap-2.5 md:gap-3 flex flex-col text-left mb-6 md:mb-8 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 md:gap-3">
                                        <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", plan.isPopular ? "bg-coral/20 text-coral" : "bg-white/10 text-white/60")}>
                                            <Check className="h-3 w-3" />
                                        </div>
                                        <span className="text-sm text-white/80 leading-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById("waitlist_form")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className={cn(
                                    "inline-flex items-center justify-center font-semibold transition-all duration-300 active:scale-[0.97] h-11 md:h-12 px-5 md:px-6 text-sm md:text-base rounded-xl group relative w-full gap-2 overflow-hidden tracking-wide",
                                    plan.isPopular
                                        ? "bg-coral hover:bg-coral/90 text-white shadow-lg shadow-coral/25 border-none"
                                        : "border-2 border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white hover:border-white/20"
                                )}
                            >
                                {plan.buttonText}
                            </Link>
                            <p className="mt-3 md:mt-4 text-xs leading-5 text-white/30">
                                {plan.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
