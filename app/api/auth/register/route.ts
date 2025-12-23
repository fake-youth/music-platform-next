import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: validation.error.issues[0]?.message || 'Validation failed'
            }, { status: 400 });
        }

        const { fullName, email, password } = validation.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user with profile
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'USER',
                profile: {
                    create: {
                        fullName,
                        gender: 'OTHER'
                    }
                }
            }
        });

        // Auto-login: Set cookie
        const response = NextResponse.json({
            success: true,
            message: 'Registration successful',
            role: user.role,
            userId: user.id
        }, { status: 201 });

        response.cookies.set('user_role', user.role, {
            httpOnly: false,
            path: '/',
            maxAge: 60 * 60 * 24
        });

        response.cookies.set('user_id', user.id, {
            httpOnly: false,
            path: '/',
            maxAge: 60 * 60 * 24
        });

        return response;
    } catch (error) {
        console.error("Register Error:", error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
