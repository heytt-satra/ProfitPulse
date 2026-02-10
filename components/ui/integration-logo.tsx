"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type IntegrationType = "stripe" | "shopify" | "meta" | "google";

interface IntegrationLogoProps {
    type: IntegrationType;
    className?: string;
}

export function IntegrationLogo({ type, className }: IntegrationLogoProps) {
    switch (type) {
        case "stripe":
            return (
                <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn("w-6 h-6", className)}
                >
                    <path
                        d="M21.2 16.5c-2.4-.3-3.6-.9-3.6-2.1 0-1.1 1.2-1.7 3.2-1.7 1.8 0 3.1.5 4.1 1l.5-3.3c-.9-.3-2.3-.8-4.5-.8-4 0-6.9 2-6.9 6.1 0 3.3 2.1 4.5 5.7 5.2 2.7.5 3.5 1.1 3.5 2.1 0 1.2-1.2 2-3.8 2.1-2.2 0-4-.7-5.1-1.3l-.6 3.4c1.1.5 3.1 1.1 5.6 1.1 4.3 0 7.5-2.1 7.5-6.2 0-3.5-2.2-4.8-5.6-5.4M3.7 19.3h6.6v3.7H3.7v-3.7zM3.7 12.3h6.6V16H3.7v-3.7zM29.7 19.3h6.6v3.7h-6.6v-3.7zM29.7 12.3h6.6V16h-6.6v-3.7z"
                        fill="currentColor"
                    />
                </svg>
            );
        case "shopify":
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn("w-6 h-6", className)}
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.322 3.197a1 1 0 0 0-.96.726l-1.42 4.966 9.423 2.693-1.688-6.186a1 1 0 0 0-.825-.724l-4.53-.475zm6.51 10.66l-9.423-2.692-.614 2.148c-.512 1.792-.768 2.688-.475 3.483a3 3 0 0 0 1.597 1.597c.795.293 1.691.037 3.483-.475l10.87-3.106-5.438-.955zM12.9 6.51l1.688 6.186 2.503-.715-1.93-7.073-2.26.59zM22.062 10.235c.512-1.792.768-2.688.475-3.483a3 3 0 0 0-1.597-1.597c-.795-.293-1.691-.037-3.483.475l-1.264.361 2.399 8.795 3.47-.551z"
                        fill="currentColor"
                    />
                </svg>
            );
        case "meta":
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn("w-6 h-6", className)}
                >
                    <path
                        d="M22.3 8.3c-1.1-2.9-4.1-3.6-6.4-3-1.7.5-2.8 1.6-3.9 2.7-1.1-1.1-2.2-2.2-3.9-2.7-2.3-.6-5.3.1-6.4 3C.8 10.5 1.4 13.9 3.5 15.6c1.6 1.3 3.8 1.3 5.4 0 1.1-1 2.2-2.1 3.1-3.1.9 1 2 2.1 3.1 3.1 1.6 1.3 3.8 1.3 5.3 0 2.2-1.7 2.8-5.1 1.9-7.3zM8.2 13.6c-1 1-2.2 1-3.1 0-1-1-1-2.8 0-3.8C6 8.8 7.3 8.8 8.2 9.8c.8 1 .8 2.7 0 3.8zm7.6 0c-1 1-2.2 1-3.1 0-.8-1.1-.8-2.8 0-3.8 1-1 2.2-1 3.1 0 1 1 1 2.8 0 3.8z"
                        fill="currentColor"
                    />
                </svg>
            );
        case "google":
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn("w-6 h-6", className)}
                >
                    <path
                        d="M21.35 11.1h-9.17v2.73h6.51c-.33 1.56-1.71 4.54-6.51 4.54-4.15 0-7.53-3.44-7.53-7.67s3.38-7.67 7.53-7.67c2.35 0 3.93.98 4.84 1.85l2.15-2.07C17.37 1.5 14.88 0 12.18 0 5.45 0 0 5.45 0 12.18s5.45 12.18 12.18 12.18c7.03 0 11.7-4.94 11.7-11.91 0-.83-.09-1.46-.23-2.1h-.3z"
                        fill="currentColor"
                    />
                </svg>
            );
        default:
            return null;
    }
}
