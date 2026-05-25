import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession, getSession } from './lib/auth';
import { decrypt } from './lib/auth';

export async function middleware(request: NextRequest) {
    // Update session expiry if exists
    await updateSession(request);

    const sessionCookie = request.cookies.get('session');
    let user = null;

    if (sessionCookie) {
        try {
            const payload = await decrypt(sessionCookie.value);
            user = payload.user;
        } catch (e) {
            // Invalid token
        }
    }

    const { pathname } = request.nextUrl;

    // 1. Redirect unauthenticated users
    if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/students') || pathname.startsWith('/expenses') || pathname.startsWith('/activity') || pathname.startsWith('/super-admin'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Redirect authenticated users away from login
    if (user && pathname.startsWith('/login')) {
        if (user.role === 'super_admin') {
            return NextResponse.redirect(new URL('/super-admin/hostels', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 3. Protect Super Admin Routes
    if (pathname.startsWith('/super-admin') && user?.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
