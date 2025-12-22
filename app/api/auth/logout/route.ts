import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the cookies
    response.cookies.set('user_role', '', {
        httpOnly: false,
        path: '/',
        maxAge: 0 // Expire immediately
    });
    
    response.cookies.set('user_id', '', {
        httpOnly: false,
        path: '/',
        maxAge: 0 // Expire immediately
    });

    return response;
}
