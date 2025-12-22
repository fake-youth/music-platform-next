import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get user statistics
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Get total play count for this user
        const playCount = await prisma.playHistory.count({
            where: { userId }
        });

        // Get total liked songs count
        const likedCount = await prisma.like.count({
            where: { userId }
        });

        // Get total playlists count
        const playlistCount = await prisma.playlist.count({
            where: { creatorId: userId }
        });

        return NextResponse.json({
            totalPlays: playCount,
            totalLikes: likedCount,
            totalPlaylists: playlistCount
        });
    } catch (error) {
        console.error("Get User Stats Error:", error);
        return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
    }
}
