import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
    const token = request.cookies.get('pp_access_token')?.value;
    const pathname = request.nextUrl.pathname;
    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');

    if (isDashboardRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};
