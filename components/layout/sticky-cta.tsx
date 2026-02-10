"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function StickyCTA() {
    const [isVisible, setIsVisible] = useState(false);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        let lastVisible = false;

        const handleScroll = () => {
            if (rafRef.current) return;
            rafRef.current = requestAnimationFrame(() => {
                const visible = window.scrollY > window.innerHeight * 0.5;
                if (visible !== lastVisible) {
                    lastVisible = visible;
                    setIsVisible(visible);
                }
                rafRef.current = null;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="fixed top-0 left-0 right-0 z-50 bg-dark/90 border-b border-white/10 py-3 px-4"
                    style={{ willChange: "transform, opacity" }}
                >
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Logo iconOnly className="scale-[0.4]" />
                            <span className="font-bold text-lg font-heading text-white hidden sm:block">ProfitPulse</span>
                        </div>
                        <div className="flex items-center gap-4 ml-auto">
                            <p className="text-sm text-white/40 hidden md:block">Join 50+ founders in early access</p>
                            <Button variant="mint" size="sm" onClick={() => document.getElementById("waitlist_form")?.scrollIntoView({ behavior: "smooth" })}>
                                Join Waitlist <ArrowRight size={14} className="ml-1.5" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
