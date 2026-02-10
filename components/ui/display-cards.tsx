"use client";

import { cloneElement } from "react";
import { Layout, TrendingDown, BarChart3, ArrowRight } from "lucide-react";
import CardSwap, { Card } from "./card-swap";

const defaultCardsData = [
    {
        icon: <Layout className="size-5 text-coral" />,
        title: "6 Tabs Open, Still Confused",
        description:
            "Stripe for revenue. Meta Ads for spend. Your bank for everything else. Calculating actual profit requires a PhD in Excel.",
        bullets: [
            "Avg. founder spends 4 hours/week reconciling",
            "Multiple disconnected dashboards",
            "No single source of truth",
        ],
    },
    {
        icon: <TrendingDown className="size-5 text-coral" />,
        title: "Bleeding Money in Silence",
        description:
            "By the time you spot the problem in your dashboard, you've already burned $2,000 on underperforming ads.",
        bullets: [
            "73% of SMEs don't track daily profitability",
            "Ad spend leaks go unnoticed for weeks",
            "Delayed reporting kills margins",
        ],
    },
    {
        icon: <BarChart3 className="size-5 text-coral" />,
        title: "PDFs You Don't Understand",
        description:
            "Your accountant sends quarterly reports full of jargon. You nod along but have no idea if you're actually making money.",
        bullets: [
            "Most learn they're unprofitable too late",
            "Financial jargon creates blind spots",
            "Quarterly reviews are too slow",
        ],
    },
];

export default function DisplayCards() {
    return (
        <div className="relative w-full h-[500px] flex items-center justify-center">
            <CardSwap
                delay={3000}
                width={380}
                height={480}
                cardDistance={-40}
                verticalDistance={35}
                skewAmount={0}
                pauseOnHover={true}
            >
                {defaultCardsData.map((card, index) => (
                    <Card
                        key={index}
                        customClass="rounded-2xl border border-white/[0.08] border-t-[3px] border-t-coral bg-[#111111] pt-8 pb-8 pr-8 pl-7 flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]"
                    >
                        {/* Icon */}
                        <div className="mb-6">
                            <span className="inline-flex items-center justify-center size-14 rounded-2xl bg-[#1a1a1a] ring-1 ring-white/6">
                                {cloneElement(card.icon as any, {
                                    className: "size-6 text-coral",
                                })}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-[22px] font-extrabold text-white mb-3 leading-tight tracking-tight">
                            {card.title}
                        </h3>

                        {/* Description */}
                        <p className="text-[14px] text-[#888] leading-relaxed mb-6">
                            {card.description}
                        </p>

                        {/* Bullet list */}
                        <ul className="space-y-2.5 mb-8">
                            {card.bullets.map((bullet, bi) => (
                                <li
                                    key={bi}
                                    className="flex items-start gap-2.5 text-[13px] text-white/80 font-medium"
                                >
                                    <span className="size-[6px] rounded-full bg-coral mt-[6px] shrink-0" />
                                    {bullet}
                                </li>
                            ))}
                        </ul>

                        {/* Learn more link */}
                        <div className="mt-auto">
                            <span className="text-sm font-bold text-coral inline-flex items-center gap-1.5 cursor-pointer hover:gap-2.5 transition-all">
                                Learn more{" "}
                                <ArrowRight className="size-3.5" />
                            </span>
                        </div>
                    </Card>
                ))}
            </CardSwap>
        </div>
    );
}
