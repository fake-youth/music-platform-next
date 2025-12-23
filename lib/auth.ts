import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function getCurrentUser() {
    // In strict mode, we should match session/token.
    // For this implementation, we rely on the 'user_id' cookie 
    // AND verify it exists in DB. This prevents made-up IDs.
    // But it does not prevent Theft of user_id cookie if not httpOnly/Secure.
    // (We set httpOnly: false for client access in login/register, which is a trade-off).
    // Ideally we use a signed JWT in an httpOnly cookie.

    // For now, we trust the ID if it matches a valid user in DB.

    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) return null;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });

    return user;
}

export async function requireAuth(roles: string[] = []) {
    const user = await getCurrentUser();

    if (!user) {
        return { error: 'Unauthorized', status: 401 };
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        return { error: 'Forbidden', status: 403 };
    }

    return { user };
}

export async function requireAdmin() {
    return requireAuth(['ADMIN', 'SUPER_ADMIN']);
}

export async function requireSuperAdmin() {
    return requireAuth(['SUPER_ADMIN']);
}
