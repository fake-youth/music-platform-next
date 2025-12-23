import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                profile: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Sanitize passwords logic if needed, accessing prisma return object directly
        const sanitizedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            fullName: user.profile?.fullName || '-',
            status: 'Active' // Mock status
        }));

        return NextResponse.json(sanitizedUsers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, role } = body;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
        });

        await logAction('UPDATE_ROLE', 'User', id, `Updated role to ${role}`);

        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
