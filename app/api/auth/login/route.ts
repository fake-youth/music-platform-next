import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations';

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

        let role = 'USER';
        if (email.includes('admin')) role = 'ADMIN';
        if (email.includes('super')) role = 'SUPER_ADMIN';

        // Upsert User into Database so they appear in User Management
        // In a real app, you'd verify password here.
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    password: 'hashed_password_placeholder', // Mock
                    role,
                    profile: {
                        create: {
                            fullName: email.split('@')[0],
                            gender: 'OTHER'
                        }
                    }
                }
            });
        } else {
            // Update role if changed via email pattern (for demo purposes)
            // or keep existing role from DB? 
            // Let's keep existing role from DB to allow Admin Panel changes to persist!
            role = user.role;
        }

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
