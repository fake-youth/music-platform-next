import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Record a play
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, songId } = body;

        if (!userId || !songId) {
            return NextResponse.json({ error: 'userId and songId are required' }, { status: 400 });
        }

        // Create play history entry
        await prisma.playHistory.create({
            data: { userId, songId }
        });

        // Increment play count
        await prisma.song.update({
            where: { id: songId },
            data: {
                playCount: {
                    increment: 1
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Record Play Error:", error);
        return NextResponse.json({ error: 'Failed to record play' }, { status: 500 });
    }
}

// GET - Get recently played songs for a user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '20');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const playHistory = await prisma.playHistory.findMany({
            where: { userId },
            include: {
                song: {
                    include: {
                        genre: true
                    }
                }
            },
            orderBy: { playedAt: 'desc' },
            take: limit,
            distinct: ['songId'] // Get unique songs
        });

        const songs = playHistory.map(ph => ({
            id: ph.song.id,
            title: ph.song.title,
            artist: ph.song.artistName,
            audioUrl: ph.song.audioUrl,
            coverUrl: ph.song.coverUrl,
            duration: ph.song.duration,
            genre: ph.song.genre,
            playCount: ph.song.playCount,
            playedAt: ph.playedAt
        }));

        return NextResponse.json(songs);
    } catch (error) {
        console.error("Get Play History Error:", error);
        return NextResponse.json({ error: 'Failed to fetch play history' }, { status: 500 });
    }
}

