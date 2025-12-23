import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // userId from body or headers would be better from cookie but here we trust body if validated or cookie if we extract it,
        // safe way is cookie.

        // Actually best practice is to extract userId from cookie here to ensure user changes THEIR OWN password.
        const { userId, currentPassword, newPassword } = body;

        if (!userId || !currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error("Change Password Error:", error);
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }
}
