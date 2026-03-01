"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { motion } from "framer-motion";

interface LoginErrorResponse {
    response?: {
        data?: {
            detail?: string;
        };
    };
    message?: string;
}

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login, isLoading } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryError = searchParams.get("error_description") || searchParams.get("error") || "";
    const infoMessage =
        searchParams.get("confirmed") === "1"
            ? "Email confirmed. You can sign in now."
            : searchParams.get("signup") === "success"
              ? "Check your inbox and confirm your email before signing in."
              : "";
    const activeError = error || queryError;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            const redirectTarget =
                searchParams.get("redirect") || "/dashboard";
            router.push(redirectTarget);
        } catch (err: unknown) {
            const maybeError = err as LoginErrorResponse;
            const rawMessage = maybeError.response?.data?.detail || maybeError.message || "Invalid credentials";
            const message = rawMessage.toLowerCase();

            if (message.includes("network error") || message.includes("failed to fetch")) {
                setError("Could not reach API server. Verify NEXT_PUBLIC_API_URL and backend deployment.");
                return;
            }

            if (message.includes("email not confirmed")) {
                setError("Email is not confirmed yet. Open the confirmation link from your inbox, then sign in.");
                return;
            }

            setError(rawMessage);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-dark">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="flex flex-col items-center text-center">
                    <Logo className="mb-8 scale-150" />
                    <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back</h2>
                    <p className="mt-2 text-white/50">Sign in to your AI CFO dashboard</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-black/30 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-coral"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-black/30 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-coral"
                            />
                        </div>

                        {activeError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {activeError}
                            </div>
                        )}
                        {!activeError && infoMessage && (
                            <div className="p-3 rounded-lg bg-coral/10 border border-coral/30 text-coral text-sm">
                                {infoMessage}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-coral hover:bg-coral/90 text-white font-bold h-11" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-white/50">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-coral hover:text-coral/80 font-medium">
                            Sign up
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
