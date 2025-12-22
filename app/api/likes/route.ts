import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Toggle like (add or remove)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { songId, userId } = body;

        if (!songId || !userId) {
            return NextResponse.json({ error: 'songId and userId are required' }, { status: 400 });
        }

        // Check if like already exists
        const existingLike = await prisma.like.findFirst({
            where: { songId, userId }
        });

        if (existingLike) {
            // Unlike - remove the like (using composite key)
            await prisma.like.delete({
                where: {
                    userId_songId: {
                        userId,
                        songId
                    }
                }
            });
            return NextResponse.json({ liked: false, message: 'Song unliked' });
        } else {
            // Like - add new like
            await prisma.like.create({
                data: { songId, userId }
            });
            return NextResponse.json({ liked: true, message: 'Song liked' });
        }
    } catch (error) {
        console.error("Like Error:", error);
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}

// GET - Get all liked songs for a user OR check if user liked a specific song
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const songId = searchParams.get('songId');
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // If songId is provided, check if user liked that specific song
        if (songId) {
            const like = await prisma.like.findFirst({
                where: { songId, userId }
            });
            return NextResponse.json({ liked: !!like });
        }

        // Otherwise, get all liked songs for the user
        const likes = await prisma.like.findMany({
            where: { userId },
            include: {
                song: {
                    include: {
                        genre: true
                    }
                }
            },
            orderBy: {
                song: {
                    createdAt: 'desc'
                }
            }
        });

        const likedSongs = likes.map(like => ({
            id: like.song.id,
            title: like.song.title,
            artist: like.song.artistName,
            audioUrl: like.song.audioUrl,
            coverUrl: like.song.coverUrl,
            duration: like.song.duration,
            genre: like.song.genre
        }));

        return NextResponse.json(likedSongs);
    } catch (error) {
        console.error("Get Like Error:", error);
        return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
    }
}
