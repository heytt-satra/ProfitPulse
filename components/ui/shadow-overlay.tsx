"use client";

import React, { CSSProperties } from "react";

interface ShadowOverlayProps {
    type?: string;
    presetIndex?: number;
    customImage?: any;
    sizing?: "fill" | "stretch";
    color?: string;
    animation?: { scale?: number; speed?: number; preview?: boolean };
    noise?: { opacity?: number; scale?: number };
    style?: CSSProperties;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Premium static background overlay — zero CPU/GPU animation cost.
 * Uses layered CSS gradients for depth, color, and atmosphere.
 * No SVG filters, no JS animations, no CSS keyframes — 
 * scrolling gets 100% of the GPU budget.
 */
export function ShadowOverlay({
    color = "#2B2E4A",
    style,
    className,
    children,
}: ShadowOverlayProps) {
    return (
        <div
            className={className}
            style={{
                overflow: "hidden",
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "#0F0F0F",
                ...style,
            }}
        >
            {/* Static atmospheric gradient — no animation, zero perf cost */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    background: `
                        radial-gradient(ellipse 130% 70% at 50% -10%, ${color} 0%, transparent 60%),
                        radial-gradient(ellipse 80% 50% at 90% 80%, ${color}88 0%, transparent 50%),
                        radial-gradient(ellipse 60% 40% at 10% 60%, #90374930 0%, transparent 45%),
                        radial-gradient(ellipse 50% 35% at 75% 30%, #E8454515 0%, transparent 40%),
                        radial-gradient(ellipse 40% 45% at 20% 90%, #00817018 0%, transparent 40%)
                    `,
                    opacity: 1,
                    pointerEvents: "none",
                }}
            />

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
