"use client";

import React, { CSSProperties } from "react";

interface ShadowOverlayProps {
    color?: string;
    animation?: { scale?: number; speed?: number; preview?: boolean };
    noise?: { opacity?: number; scale?: number };
    style?: CSSProperties;
    className?: string;
    children?: React.ReactNode;
    sizing?: string;
    type?: string;
    presetIndex?: number;
    customImage?: any;
}

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
            {/* Animated ambient glow — GPU-only CSS transforms, no layout/paint */}
            <div className="shadow-glow-layer" aria-hidden="true">
                {/* Primary large glow — top center */}
                <div
                    className="shadow-glow-orb shadow-glow-orb-1"
                    style={{
                        background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
                    }}
                />
                {/* Secondary glow — bottom right */}
                <div
                    className="shadow-glow-orb shadow-glow-orb-2"
                    style={{
                        background: `radial-gradient(ellipse at center, ${color} 0%, transparent 65%)`,
                    }}
                />
                {/* Accent glow — left */}
                <div
                    className="shadow-glow-orb shadow-glow-orb-3"
                    style={{
                        background: `radial-gradient(ellipse at center, #E8454540 0%, transparent 60%)`,
                    }}
                />
            </div>

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
