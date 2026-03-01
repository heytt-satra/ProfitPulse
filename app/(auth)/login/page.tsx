"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            const redirectTarget =
                typeof window !== "undefined"
                    ? new URLSearchParams(window.location.search).get("redirect") || "/dashboard"
                    : "/dashboard";
            router.push(redirectTarget);
        } catch (err: unknown) {
            const maybeError = err as LoginErrorResponse;
            setError(maybeError.response?.data?.detail || maybeError.message || "Invalid credentials");
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

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {error}
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
