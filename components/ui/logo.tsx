"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    iconOnly?: boolean;
    variant?: "default" | "light" | "dark" | "monochrome";
}

export function Logo({ className, iconOnly = false, variant = "default" }: LogoProps) {
    // Colors based on the ProfitPulse palette
    // Coral/Red: #FF4D4D (approximate from screenshot)
    const iconColor = "#FFFFFF"; // Icon is always white in the squared version
    const textColor = variant === "light" ? "#FFFFFF" : variant === "monochrome" ? "currentColor" : "#F1F1F1";

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className={cn(
                "relative shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300",
                variant === "default" ? "w-10 h-10 rounded-xl" : "w-11 h-11 rounded-xl",
                "bg-linear-to-br from-coral to-[#ff3a3a] shadow-lg shadow-coral/25"
            )}>
                {/* 
                  The Pulse Icon (SVG)
                */}
                <svg
                    width="24"
                    height="20"
                    viewBox="0 0 60 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative z-10"
                >
                    <path
                        d="M4 28H14L28 12L38 32L52 8M52 8H42M52 8V18"
                        stroke={iconColor}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                {/* Subtle shine overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-linear-to-b from-white/20 to-transparent pointer-events-none" />
            </div>

            {!iconOnly && (
                <span
                    className="font-bold tracking-tight font-heading text-xl"
                    style={{ color: textColor }}
                >
                    Profit<span className="text-coral">Pulse</span>
                </span>
            )}
        </div>
    );
}
