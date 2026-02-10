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
            {/* Lightweight CSS gradients instead of SVG filters */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: `
                        radial-gradient(ellipse 80% 60% at 50% 0%, ${color}40 0%, transparent 70%),
                        radial-gradient(ellipse 60% 50% at 80% 80%, ${color}20 0%, transparent 60%),
                        radial-gradient(ellipse 50% 40% at 20% 60%, ${color}15 0%, transparent 50%)
                    `,
                    opacity: 0.9,
                    willChange: "auto",
                }}
            />

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
