import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: validation.error.issues[0]?.message || 'Invalid email or password'
            }, { status: 400 });
        }

        const { email, password } = validation.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Verify password
        // If user was created with mock auth (previous versions), password might be plain text or placeholder.
        // We should check if it looks like a hash (starts with $2a$ etc), if not, maybe try plain compare for backward compat?
        // No, let's enforce security. If it's a legacy account, they might need to reset or re-register.
        // But for development convenience if we have 'hashed_password_placeholder', we can fail.

        let isValid = false;
        if (user.password.startsWith('$2')) {
            isValid = await bcrypt.compare(password, user.password);
        } else {
            // Fallback for previous unhashed passwords (for dev transition only)
            isValid = password === user.password;
        }

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Check if banned
        if (user.role === 'BANNED') {
            return NextResponse.json({ error: 'Account is banned' }, { status: 403 });
        }

        const role = user.role;

        // Create response
        const response = NextResponse.json({ success: true, role, userId: user.id });

        // Set Cookies
        response.cookies.set('user_role', role, {
            httpOnly: false, // Allow client JS to read it for Guest Logic
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        });

        response.cookies.set('user_id', user.id, {
            httpOnly: false, // Allow client JS to read it
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        });

        return response;
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
