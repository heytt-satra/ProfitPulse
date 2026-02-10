"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type IntegrationType = "stripe" | "shopify" | "meta" | "google";

interface IntegrationLogoProps {
    type: IntegrationType;
    className?: string;
    size?: number;
}

const logoConfig: Record<IntegrationType, { src: string; alt: string }> = {
    stripe: { src: "/logos/stripe.svg", alt: "Stripe" },
    shopify: { src: "/logos/shopify.svg", alt: "Shopify" },
    meta: { src: "/logos/meta.svg", alt: "Meta" },
    google: { src: "/logos/google-ads.svg", alt: "Google Ads" },
};

export function IntegrationLogo({ type, className, size = 22 }: IntegrationLogoProps) {
    const config = logoConfig[type];
    if (!config) return null;

    return (
        <Image
            src={config.src}
            alt={config.alt}
            width={size}
            height={size}
            className={cn("object-contain", className)}
            unoptimized
        />
    );
}
