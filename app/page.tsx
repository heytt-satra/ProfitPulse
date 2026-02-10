import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { SolutionDemo } from "@/components/sections/solution-demo";
import { Features } from "@/components/sections/features";
import { SocialProof } from "@/components/sections/social-proof";
import { Pricing } from "@/components/sections/pricing";
import { WaitlistForm } from "@/components/sections/waitlist-form";
import { StickyCTA } from "@/components/layout/sticky-cta";
import { ExitIntentPopup } from "@/components/layout/exit-intent";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">

      <ExitIntentPopup />
      <Hero />
      <Problem />
      <SolutionDemo />
      <Features />
      <SocialProof />
      <Pricing />
      <WaitlistForm />

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 relative">
        <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />
            <span className="font-bold font-heading text-white">ProfitPulse</span>
          </div>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} ProfitPulse. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
