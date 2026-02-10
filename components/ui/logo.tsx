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
    // Teal/Mint: #008170 (from your globals) or slightly brighter for the logo
    const iconColor = variant === "monochrome" ? "currentColor" : "#008170";
    const textColor = variant === "light" ? "#FFFFFF" : variant === "monochrome" ? "currentColor" : "#F1F1F1";

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* The Pulse Icon (SVG) */}
            <svg
                width="40"
                height="32"
                viewBox="0 0 60 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
            >
                {/* 
                  The path recreates the "Pulse" logo from the image:
                  1. Horizontal start
                  2. Sharp peak (Up)
                  3. Sharp trough (Down)
                  4. Sharp peak (Up) with arrow head
                */}
                <path
                    d="M4 28H14L28 12L38 32L52 8M52 8H42M52 8V18"
                    stroke={iconColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {!iconOnly && (
                <span
                    className="font-bold tracking-tight font-heading text-xl"
                    style={{ color: textColor }}
                >
                    Profit<span className="text-white">Pulse</span>
                </span>
            )}
        </div>
    );
}
