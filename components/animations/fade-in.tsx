"use client";

import { motion } from "framer-motion";

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
    direction?: "up" | "down" | "left" | "right" | "none";
    fullWidth?: boolean;
}

export function FadeIn({
    children,
    delay = 0,
    duration = 0.5,
    className = "",
    direction = "up",
    fullWidth = false,
}: FadeInProps) {
    const directionOffset = {
        up: { y: 30, x: 0 },
        down: { y: -30, x: 0 },
        left: { x: 30, y: 0 },
        right: { x: -30, y: 0 },
        none: { x: 0, y: 0 },
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...directionOffset[direction]
            }}
            whileInView={{
                opacity: 1,
                x: 0,
                y: 0
            }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.1, 0.25, 1], // CSS ease standard
            }}
            className={className}
            style={{
                width: fullWidth ? "100%" : "auto",
                willChange: "opacity, transform",
            }}
        >
            {children}
        </motion.div>
    );
}
