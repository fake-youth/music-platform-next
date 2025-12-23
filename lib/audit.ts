import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function logAction(
    action: string,
    entity: string,
    entityId: string | null = null,
    details: string | null = null
) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;

        // If no user (e.g. system action or anonymous), we might skip or record as 'SYSTEM'
        // But for Admin actions, userId should be present.
        if (!userId) return;

        await prisma.auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                details
            }
        });
    } catch (error) {
        console.error("Failed to create audit log:", error);
    }
}
