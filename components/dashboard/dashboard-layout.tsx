'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import {
    LayoutDashboard,
    MessageSquare,
    Settings,
    LogOut,
    Plug,
    Menu,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/chat', label: 'AI Analyst', icon: MessageSquare },
    { href: '/dashboard/integrations', label: 'Integrations', icon: Plug },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, logout, user, checkAuth } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        let isMounted = true;
        void checkAuth().finally(() => {
            if (isMounted) {
                setAuthChecked(true);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [checkAuth]);

    useEffect(() => {
        if (authChecked && !isLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [authChecked, isAuthenticated, isLoading, router]);

    const userInitials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'PP';

    if (!authChecked || isLoading || !isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
                Loading your dashboard...
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform md:relative md:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        ProfitPulse
                    </h1>
                    <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive && "text-indigo-600")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                            void logout();
                            router.push('/');
                        }}
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
                            <Menu className="w-6 h-6 text-gray-600" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 hidden sm:inline">
                            {user?.full_name || user?.email || ''}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                            {userInitials}
                        </div>
                    </div>
                </header>
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
