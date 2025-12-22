import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get recent users
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const users = await prisma.user.findMany({
            include: {
                profile: {
                    select: {
                        fullName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        const formattedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            fullName: user.profile?.fullName || user.email.split('@')[0],
            role: user.role,
            createdAt: user.createdAt
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error("Get Recent Users Error:", error);
        return NextResponse.json({ error: 'Failed to fetch recent users' }, { status: 500 });
    }
}

