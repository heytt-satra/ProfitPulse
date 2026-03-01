import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'pp_access_token';

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const token = typeof payload?.access_token === 'string' ? payload.access_token : null;
        if (!token) {
            return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
        }

        const response = NextResponse.json({ ok: true });
        response.cookies.set(COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });
        return response;
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
    });
    return response;
}
