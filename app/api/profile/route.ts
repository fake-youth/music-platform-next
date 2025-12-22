import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { profileSchema } from '@/lib/validations';

// GET - Get user profile
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const profile = await prisma.profile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error("Get Profile Error:", error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

// PATCH - Update user profile
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { userId, fullName, gender, avatarUrl } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Validate input
        const validation = profileSchema.safeParse({
            fullName: fullName?.trim(),
            gender,
            avatarUrl: avatarUrl || ''
        });

        if (!validation.success) {
            return NextResponse.json({
                error: validation.error.issues[0]?.message || 'Validation failed'
            }, { status: 400 });
        }

        const profile = await prisma.profile.upsert({
            where: { userId },
            update: {
                fullName: validation.data.fullName || undefined,
                gender: validation.data.gender || undefined,
                avatarUrl: validation.data.avatarUrl || undefined,
            },
            create: {
                userId,
                fullName: validation.data.fullName || null,
                gender: validation.data.gender || null,
                avatarUrl: validation.data.avatarUrl || null,
            }
        });

        return NextResponse.json(profile);
    } catch (error) {
        console.error("Update Profile Error:", error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}

