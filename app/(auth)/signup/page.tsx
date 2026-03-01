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

type SignupDetail = string | Array<{ msg?: string }> | Record<string, unknown>;

interface SignupErrorResponse {
    response?: {
        data?: {
            detail?: SignupDetail;
        };
    };
    message?: string;
}

function getSignupErrorMessage(err: unknown) {
    const maybeError = err as SignupErrorResponse;
    const detail = maybeError.response?.data?.detail;

    if (!detail) {
        const maybeError = err as SignupErrorResponse;
        return maybeError.message || "Signup failed. Try again.";
    }

    if (typeof detail === "string") {
        return detail;
    }

    if (Array.isArray(detail)) {
        return detail
            .map((item) => (typeof item.msg === "string" ? item.msg : "Validation error"))
            .join(", ");
    }

    if (typeof detail === "object") {
        return JSON.stringify(detail);
    }

    return "Signup failed. Try again.";
}

export default function SignupPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { signup, isLoading } = useAuthStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await signup(email, password, fullName);
            // After signup, redirect to login or dashboard. 
            // Auth store currently doesn't auto-login after signup, so let's redirect to login
            router.push("/login?signup=success");
        } catch (err: unknown) {
            const errorMessage = getSignupErrorMessage(err);
            setError(errorMessage);

            // UX Improvement: Check if error is about existing user
            if (errorMessage.toLowerCase().includes("already exists")) {
                setTimeout(() => router.push("/login?email=" + encodeURIComponent(email)), 2000);
            }
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
                    <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
                    <p className="mt-2 text-white/50">Start optimizing your profits today</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="bg-black/30 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-coral"
                            />
                        </div>
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
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
                            >
                                <p className="font-semibold">{error}</p>
                                {error.toLowerCase().includes("already exists") && (
                                    <div className="mt-2 text-white/70">
                                        <Link href="/login" className="text-coral hover:text-coral/80 font-bold underline decoration-2 underline-offset-2">
                                            Log in here &rarr;
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        <Button type="submit" className="w-full bg-coral hover:bg-coral/90 text-white font-bold h-11" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-white/50">
                        Already have an account?{" "}
                        <Link href="/login" className="text-coral hover:text-coral/80 font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
