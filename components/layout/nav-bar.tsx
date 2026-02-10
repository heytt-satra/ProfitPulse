"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { LucideIcon, Home, Sparkles, Zap, CreditCard, UserPlus, ArrowRight, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

interface NavItem {
    name: string
    url: string
    icon: LucideIcon
}

interface NavBarProps {
    items?: NavItem[]
    className?: string
}

const defaultItems: NavItem[] = [
    { name: "Home", url: "#hero", icon: Home },
    { name: "Features", url: "#features", icon: Sparkles },
    { name: "How It Works", url: "#solution_demo", icon: Zap },
    { name: "Pricing", url: "#pricing", icon: CreditCard },
    { name: "Join Waitlist", url: "#waitlist_form", icon: UserPlus },
]

export function NavBar({ items = defaultItems, className }: NavBarProps) {
    const [activeTab, setActiveTab] = useState(items[0]?.name || "")
    const [isMobile, setIsMobile] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }

        handleResize()
        handleScroll()
        window.addEventListener("resize", handleResize)
        window.addEventListener("scroll", handleScroll)
        return () => {
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => { document.body.style.overflow = "" }
    }, [mobileMenuOpen])

    const handleScrollTo = (url: string) => {
        setMobileMenuOpen(false)
        const element = document.querySelector(url);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    }

    return (
        <>
            {/* Desktop Navigation (Oximy Style Top Pill) */}
            <div className={cn(
                "hidden md:flex fixed inset-x-0 mx-auto z-50 items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                isScrolled ? "top-4 w-[60%] max-w-2xl px-5 py-2.5 bg-black/60 shadow-black/40" : "top-6 w-[95%] max-w-5xl px-6 py-3 bg-black/40 shadow-black/20",
                "backdrop-blur-lg border border-white/10 rounded-full shadow-2xl",
                className
            )}>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <Logo />
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    {items.map((item) => {
                        // Skip "Join Waitlist" in the middle links, we have a button for it
                        if (item.name === "Join Waitlist") return null;

                        const isActive = activeTab === item.name
                        return (
                            <Link
                                key={item.name}
                                href={item.url}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab(item.name);
                                    handleScrollTo(item.url);
                                }}
                                className={cn(
                                    "relative transition-colors rounded-full font-medium",
                                    "text-white/70 hover:text-white",
                                    isActive && "text-coral bg-white/5",
                                    isScrolled ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
                                )}
                            >
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="desktop-nav"
                                        className="absolute inset-0 rounded-full bg-white/5 -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* CTA */}
                <Button
                    className={cn(
                        "rounded-full bg-coral hover:bg-coral/90 text-white shadow-lg shadow-coral/20 transition-all duration-300",
                        isScrolled ? "px-4 h-8 text-xs" : "px-6 h-10 text-sm"
                    )}
                    onClick={() => handleScrollTo("#waitlist_form")}
                >
                    Join Waitlist <ArrowRight size={isScrolled ? 14 : 16} className="ml-2" />
                </Button>
            </div>

            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 py-3 bg-black/70 backdrop-blur-xl border-b border-white/10">
                <Link href="/" className="flex items-center">
                    <Logo className="scale-90 origin-left" />
                </Link>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden fixed inset-0 z-40 bg-black/90 backdrop-blur-xl"
                    >
                        <motion.nav
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="flex flex-col gap-2 px-6 pt-24 pb-8"
                        >
                            {items.map((item, index) => {
                                const Icon = item.icon
                                const isActive = activeTab === item.name
                                return (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15 + index * 0.05 }}
                                    >
                                        <Link
                                            href={item.url}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveTab(item.name);
                                                handleScrollTo(item.url);
                                            }}
                                            className={cn(
                                                "flex items-center gap-4 px-4 py-4 rounded-xl transition-all",
                                                isActive
                                                    ? "bg-coral/10 border border-coral/20 text-coral"
                                                    : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent"
                                            )}
                                        >
                                            <Icon size={20} strokeWidth={2} />
                                            <span className="text-base font-semibold">{item.name}</span>
                                            {isActive && (
                                                <span className="ml-auto w-2 h-2 bg-coral rounded-full" />
                                            )}
                                        </Link>
                                    </motion.div>
                                )
                            })}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-6"
                            >
                                <Button
                                    className="w-full rounded-xl bg-coral hover:bg-coral/90 text-white h-14 text-base font-bold shadow-lg shadow-coral/20"
                                    onClick={() => handleScrollTo("#waitlist_form")}
                                >
                                    Join Waitlist <ArrowRight size={18} className="ml-2" />
                                </Button>
                            </motion.div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
