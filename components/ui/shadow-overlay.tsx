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
 * Replaces SVG feTurbulence/feDisplacementMap with CSS-only animated mesh.
 * Uses multiple soft gradient blobs with slow CSS transform animations.
 * All keyframes use ONLY transform + opacity (GPU compositor properties)
 * so scrolling and blob movement happen on separate threads = zero jank.
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
            {/* Atmospheric mesh gradient layer */}
            <div
                className="shadow-mesh-layer"
                aria-hidden="true"
            >
                {/* Primary indigo cloud — large, dominant */}
                <div
                    className="mesh-blob mesh-blob-1"
                    style={{
                        background: `radial-gradient(circle, ${color} 0%, ${color}99 25%, ${color}33 50%, transparent 70%)`,
                    }}
                />

                {/* Secondary indigo — offset, creates depth */}
                <div
                    className="mesh-blob mesh-blob-2"
                    style={{
                        background: `radial-gradient(circle, ${color}cc 0%, ${color}66 30%, ${color}1a 55%, transparent 70%)`,
                    }}
                />

                {/* Coral accent glow — warm contrast */}
                <div
                    className="mesh-blob mesh-blob-3"
                    style={{
                        background: "radial-gradient(circle, #E8454530 0%, #E8454518 35%, #E845450a 55%, transparent 70%)",
                    }}
                />

                {/* Deep plum undertone — richness */}
                <div
                    className="mesh-blob mesh-blob-4"
                    style={{
                        background: "radial-gradient(circle, #90374940 0%, #90374920 30%, #9037490a 50%, transparent 70%)",
                    }}
                />

                {/* Teal whisper — subtle cool accent */}
                <div
                    className="mesh-blob mesh-blob-5"
                    style={{
                        background: "radial-gradient(circle, #00817020 0%, #00817010 35%, transparent 60%)",
                    }}
                />
            </div>

            {/* Subtle grain texture for depth (pure CSS) */}
            <div
                className="shadow-noise"
                aria-hidden="true"
            />

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
