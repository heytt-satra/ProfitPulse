import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use server-side env vars for the API route (more secure)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, monthlyRevenue, platform, biggestPain } = body;

        // Basic server-side validation
        if (!email || !monthlyRevenue || !platform) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check for Supabase config
        if (!supabaseUrl || !supabaseKey) {
            console.warn("Supabase not configured — logging form data instead:");
            console.log({ email, monthlyRevenue, platform, biggestPain });
            return NextResponse.json({
                success: true,
                message: "Waitlist joined (dev mode — Supabase not configured)",
            });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase.from("waitlist").insert({
            email,
            monthly_revenue: monthlyRevenue,
            platform,
            biggest_pain: biggestPain || null,
        });

        if (error) {
            // Duplicate email
            if (error.code === "23505") {
                return NextResponse.json(
                    { error: "This email is already on the waitlist!" },
                    { status: 409 }
                );
            }
            console.error("Supabase error:", error);
            return NextResponse.json(
                { error: "Something went wrong. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Successfully joined the waitlist!",
        });
    } catch {
        return NextResponse.json(
            { error: "Invalid request" },
            { status: 400 }
        );
    }
}
