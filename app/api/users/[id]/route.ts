import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';

// GET - Get a single user by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                profile: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Get User Error:", error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

import { requireSuperAdmin } from '@/lib/auth';

// POST - Ban/Unban a user
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireSuperAdmin();
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await params;
        const body = await request.json();
        const { banned } = body;

        const user = await prisma.user.update({
            where: { id },
            data: {
                role: banned ? 'BANNED' : 'USER'
            }
        });

        await logAction(
            banned ? 'BAN_USER' : 'UNBAN_USER',
            'User',
            id,
            `User ${user.email} was ${banned ? 'banned' : 'unbanned'}`
        );

        return NextResponse.json({
            success: true,
            message: banned ? 'User banned' : 'User unbanned',
            user
        });
    } catch (error) {
        console.error("Ban User Error:", error);
        return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 });
    }
}

// DELETE - Delete a user
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireSuperAdmin();
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await params;

        // Delete user's profile first (cascade)
        await prisma.profile.deleteMany({ where: { userId: id } });
        await prisma.like.deleteMany({ where: { userId: id } });
        await prisma.user.delete({ where: { id } });

        await logAction('DELETE_USER', 'User', id, 'Deleted user account');

        return NextResponse.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error("Delete User Error:", error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
