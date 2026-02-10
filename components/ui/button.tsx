import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "mint";
    size?: "sm" | "md" | "lg" | "xl";
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: "bg-coral text-white hover:bg-coral/90 shadow-lg shadow-coral/20 glow-red hover:glow-red-strong",
            secondary: "bg-teal text-white hover:bg-teal/90 shadow-lg shadow-teal/20",
            outline: "border-2 border-border bg-transparent hover:bg-surface text-white",
            ghost: "bg-transparent hover:bg-white/5 text-text-secondary hover:text-white",
            danger: "bg-wine text-white hover:bg-wine/90",
            mint: "bg-coral text-white font-bold hover:brightness-110 glow-red hover:glow-red-strong",
        };

        const sizes = {
            sm: "h-9 px-4 text-sm rounded-lg",
            md: "h-11 px-6 text-base rounded-lg",
            lg: "h-14 px-8 text-lg rounded-xl",
            xl: "h-16 px-10 text-xl rounded-xl",
        };

        return (
            <button
                ref={ref}
                disabled={isLoading || disabled}
                className={cn(
                    "inline-flex items-center justify-center font-semibold transition-all duration-300 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
