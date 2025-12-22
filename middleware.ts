import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route access permissions
// SUPER_ADMIN can access everything
// ADMIN can access /admin/* but not /super-admin/*
// USER/GUEST cannot access /admin/* or /super-admin/*

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Mocking verification - in production, verify JWT token here
    // const token = request.cookies.get('token')?.value;
    // const user = verifyToken(token); 

    // For demonstration, let's assume we read a 'role' cookie
    // In a real app, DO NOT trust plain cookies for roles without server-side verification!
    const role = request.cookies.get('user_role')?.value || 'GUEST';

    // 1. Protect Super Admin Routes
    if (pathname.startsWith('/super-admin')) {
        if (role !== 'SUPER_ADMIN') {
            // Redirect to 403 Forbidden or Login
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 2. Protect Admin Routes (accessible by ADMIN and SUPER_ADMIN)
    if (pathname.startsWith('/admin')) {
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 3. Protect User Routes (e.g., playback might be restricted for Guests)
    // "Guest: Hanya bisa melihat landing page, melakukan preview lagu..."
    // If we had a /player route or full track API, we'd check it here.

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/super-admin/:path*',
        '/admin/:path*',
        // Add other protected routes here
    ],
};
