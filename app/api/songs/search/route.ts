import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Search songs by query
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const limit = parseInt(searchParams.get('limit') || '50');

        if (!query || query.trim().length === 0) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }

        // SQLite doesn't support case-insensitive mode, so we'll use contains
        const songs = await prisma.song.findMany({
            where: {
                OR: [
                    { title: { contains: query } },
                    { artistName: { contains: query } },
                ]
            },
            include: {
                genre: true
            },
            take: limit,
            orderBy: {
                playCount: 'desc'
            }
        });

        // Filter case-insensitively in memory for SQLite
        const queryLower = query.toLowerCase();
        const filtered = songs.filter(song =>
            song.title.toLowerCase().includes(queryLower) ||
            song.artistName.toLowerCase().includes(queryLower)
        );

        return NextResponse.json(filtered);
    } catch (error) {
        console.error("Search Songs Error:", error);
        return NextResponse.json({ error: 'Failed to search songs' }, { status: 500 });
    }
}

