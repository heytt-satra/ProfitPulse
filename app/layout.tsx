import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ShadowOverlay } from "@/components/ui/shadow-overlay";
import { NavBar } from "@/components/layout/nav-bar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProfitPulse - AI CFO for Small Business Finances | Stop Spreadsheet Hell",
  description: "Turn Stripe, Shopify, and Meta Ads data into plain-English answers. Get daily profit insights without dashboards or SQL. Built for founders doing $10K-$1M ARR.",
  keywords: ["stripe analytics", "shopify profit tracking", "meta ads roi", "small business cfo", "ai financial analytics", "saas metrics", "ecommerce profitability"],
  openGraph: {
    title: "ProfitPulse - AI CFO for Small Business Finances",
    description: "Turn Stripe, Shopify, and Meta Ads data into plain-English answers. Get daily profit insights without dashboards or SQL.",
    url: "https://profitpulse.com",
    siteName: "ProfitPulse",
    images: [
      {
        url: "https://profitpulse.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProfitPulse - AI CFO for Small Business Finances",
    description: "Turn Stripe, Shopify, and Meta Ads data into plain-English answers. Get daily profit insights without dashboards or SQL.",
    images: ["https://profitpulse.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased font-sans text-text-primary bg-background`}
      >
        <ShadowOverlay
          color="#2B2E4A"
          animation={{ scale: 60, speed: 20 }}
          noise={{ opacity: 0, scale: 10 }}
          style={{ position: "fixed", zIndex: -1 }}
        />
        <NavBar />
        {children}
      </body>
    </html>
  );
}
