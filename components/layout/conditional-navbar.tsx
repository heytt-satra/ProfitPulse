"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "@/components/layout/nav-bar";

export function ConditionalNavBar() {
    const pathname = usePathname();

    // Hide landing navigation on authenticated and auth pages.
    if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup")
    ) {
        return null;
    }

    return <NavBar />;
}
