"use client";

import React, { useRef, useId, useEffect, CSSProperties } from "react";

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

function mapRange(
    value: number,
    fromLow: number,
    fromHigh: number,
    toLow: number,
    toHigh: number
): number {
    if (fromLow === fromHigh) return toLow;
    const percentage = (value - fromLow) / (fromHigh - fromLow);
    return toLow + percentage * (toHigh - toLow);
}

const useInstanceId = (): string => {
    const id = useId();
    return `shadowoverlay-${id.replace(/:/g, "")}`;
};

export function ShadowOverlay({
    sizing = "fill",
    color = "#2B2E4A",
    animation = { scale: 50, speed: 30, preview: false },
    style,
    className,
    children,
}: ShadowOverlayProps) {
    const id = useInstanceId();
    const animationEnabled = animation && (animation.scale ?? 0) > 0;
    const hueAnimRef = useRef<number | null>(null);

    const displacementScale = animation
        ? mapRange(animation.scale ?? 50, 1, 100, 20, 100)
        : 0;
    const animationDuration = animation
        ? mapRange(animation.speed ?? 30, 1, 100, 1000, 50)
        : 1;

    // Use a native rAF loop instead of framer-motion animate() to avoid
    // per-frame React overhead. Runs entirely outside React's lifecycle.
    useEffect(() => {
        if (!animationEnabled) return;

        let startTime: number | null = null;
        const cycleDuration = (animationDuration / 2) * 1000; // ms for full 360°

        const tick = (timestamp: number) => {
            if (startTime === null) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const hueValue = (elapsed / cycleDuration) * 360 % 360;

            const matrix = document.getElementById(`${id}-matrix`);
            if (matrix) {
                matrix.setAttribute("values", String(Math.round(hueValue)));
            }

            hueAnimRef.current = requestAnimationFrame(tick);
        };

        hueAnimRef.current = requestAnimationFrame(tick);

        return () => {
            if (hueAnimRef.current) cancelAnimationFrame(hueAnimRef.current);
        };
    }, [animationEnabled, animationDuration, id]);

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
                // Isolate this entire subtree on its own compositor layer
                contain: "strict",
                ...style,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: -displacementScale,
                    filter: animationEnabled ? `url(#${id})` : "none",
                    opacity: 0.9,
                    willChange: "filter",
                    transform: "translateZ(0)", // Force GPU layer
                }}
            >
                {animationEnabled && (
                    <svg
                        style={{ position: "absolute", width: 0, height: 0 }}
                        aria-hidden="true"
                    >
                        <defs>
                            <filter id={id}>
                                <feTurbulence
                                    result="undulation"
                                    numOctaves={2}
                                    baseFrequency={`${mapRange(
                                        animation.scale ?? 50,
                                        0, 100, 0.001, 0.0005
                                    )},${mapRange(
                                        animation.scale ?? 50,
                                        0, 100, 0.004, 0.002
                                    )}`}
                                    seed="0"
                                    type="turbulence"
                                />
                                <feColorMatrix
                                    id={`${id}-matrix`}
                                    in="undulation"
                                    type="hueRotate"
                                    values="0"
                                />
                                <feColorMatrix
                                    in="undulation"
                                    result="circulation"
                                    type="matrix"
                                    values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
                                />
                                <feDisplacementMap
                                    in="SourceGraphic"
                                    in2="undulation"
                                    scale={displacementScale}
                                    result="dist"
                                />
                            </filter>
                        </defs>
                    </svg>
                )}
                <div
                    style={{
                        backgroundColor: color,
                        maskImage: `url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')`,
                        maskSize: sizing === "stretch" ? "100% 100%" : "cover",
                        maskRepeat: "no-repeat",
                        maskPosition: "center",
                        width: "100%",
                        height: "100%",
                    }}
                />
            </div>

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
