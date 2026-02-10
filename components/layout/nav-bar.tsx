"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon, Home, Sparkles, Zap, CreditCard, UserPlus, ArrowRight } from "lucide-react"
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

    const handleScrollTo = (url: string) => {
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

            {/* Mobile Navigation (Bottom Pill) */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-3 bg-black/60 border border-white/10 backdrop-blur-xl py-2 px-2 rounded-full shadow-2xl shadow-black/40">
                    {items.map((item) => {
                        const Icon = item.icon
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
                                    "relative p-3 rounded-full transition-all duration-300",
                                    "text-white/60 hover:text-coral",
                                    isActive && "bg-white/10 text-coral shadow-inner shadow-white/5",
                                )}
                            >
                                <Icon size={20} strokeWidth={2.5} />
                                {isActive && (
                                    <span className="absolute -top-1 right-1 w-2 h-2 bg-coral rounded-full animate-pulse" />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </>
    )
}
