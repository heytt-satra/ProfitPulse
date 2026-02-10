"use client";

import { FadeIn } from "@/components/animations/fade-in";
import DisplayCards from "@/components/ui/display-cards";

export function Problem() {
    return (
        <section id="problem_agitation" className="py-20 md:py-28 relative overflow-hidden">
            {/* Removed grain overlay and blur blobs */}

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                    {/* Headline */}
                    <div className="flex-1 text-center lg:text-left px-2 lg:pl-16 lg:pr-0">
                        <FadeIn>
                            <p className="text-sm font-semibold tracking-widest uppercase text-coral mb-3">The Problem</p>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 font-heading">
                                Sound Familiar?
                            </h2>
                        </FadeIn>
                        <FadeIn delay={0.1}>
                            <p className="text-lg text-white/50 max-w-xl mx-auto lg:mx-0">
                                Running a business shouldn&apos;t feel like solving a puzzle every single day.
                                Scattered data leads to blind spots, and blind spots cost you money.
                            </p>
                        </FadeIn>
                    </div>

                    {/* Display Cards */}
                    <div className="flex-1 flex justify-center lg:justify-end w-full">
                        <FadeIn delay={0.2}>
                            <div className="relative pt-6 md:pt-10 pr-0 lg:pr-32">
                                <DisplayCards />
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </section>
    );
}
