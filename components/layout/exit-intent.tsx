"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileSpreadsheet } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export function ExitIntentPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasTriggered) {
                if (!sessionStorage.getItem("exit_intent_shown")) {
                    setIsVisible(true);
                    setHasTriggered(true);
                    sessionStorage.setItem("exit_intent_shown", "true");
                }
            }
        };
        document.addEventListener("mouseleave", handleMouseLeave);
        return () => document.removeEventListener("mouseleave", handleMouseLeave);
    }, [hasTriggered]);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90"
                        onClick={() => setIsVisible(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-indigo rounded-2xl shadow-2xl max-w-md w-full p-8 overflow-hidden border border-white/10"
                    >
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors z-20 cursor-pointer"
                        >
                            <X size={22} />
                        </button>
                        <div className="text-center relative z-10">
                            <div className="w-16 h-16 bg-teal/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FileSpreadsheet size={28} className="text-teal" />
                            </div>
                            <h3 className="text-2xl font-bold font-heading mb-2 text-white">Wait — Get This Free Instead</h3>
                            <p className="text-white/50 mb-6">Not ready to join? Download the exact <strong className="text-white/70">Profit Calculation Spreadsheet</strong> I used before building ProfitPulse.</p>
                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsVisible(false); alert("Template sent! (Demo)"); }}>
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral/50 transition-all"
                                    required
                                />
                                <Button variant="mint" type="submit" className="w-full">
                                    <Logo iconOnly className="scale-[0.4] mr-2" />Send Me the Template
                                </Button>
                            </form>
                            <p className="mt-4 text-xs text-white/30">No spam. Unsubscribe anytime.</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
