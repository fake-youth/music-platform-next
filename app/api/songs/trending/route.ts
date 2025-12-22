import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get trending songs based on play count
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const songs = await prisma.song.findMany({
            include: {
                genre: true
            },
            orderBy: {
                playCount: 'desc'
            },
            take: limit
        });

        return NextResponse.json(songs);
    } catch (error) {
        console.error("Get Trending Songs Error:", error);
        return NextResponse.json({ error: 'Failed to fetch trending songs' }, { status: 500 });
    }
}

