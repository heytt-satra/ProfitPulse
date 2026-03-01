import { StickyCTA } from "@/components/layout/sticky-cta";
import { ExitIntentPopup } from "@/components/layout/exit-intent";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { Pricing } from "@/components/sections/pricing";
import { Problem } from "@/components/sections/problem";
import { SocialProof } from "@/components/sections/social-proof";
import { SolutionDemo } from "@/components/sections/solution-demo";
import { WaitlistForm } from "@/components/sections/waitlist-form";
import { Logo } from "@/components/ui/logo";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col">
            <ExitIntentPopup />
            <StickyCTA />
            <Hero />
            <Problem />
            <SolutionDemo />
            <Features />
            <SocialProof />
            <Pricing />
            <WaitlistForm />

            <footer className="relative border-t border-white/5 py-10">
                <div className="container relative z-10 mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
                    <Logo className="origin-left scale-75" />
                    <p className="text-sm text-white/30">
                        &copy; {new Date().getFullYear()} ProfitPulse. All rights reserved.
                    </p>
                </div>
            </footer>
        </main>
    );
}
