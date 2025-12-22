import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST add song to playlist
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { playlistId, songId } = body;

        if (!playlistId || !songId) {
            return NextResponse.json({ error: 'playlistId and songId are required' }, { status: 400 });
        }

        // Check if already exists
        const existing = await prisma.playlistSong.findFirst({
            where: { playlistId, songId }
        });

        if (existing) {
            return NextResponse.json({ error: 'Song already in playlist' }, { status: 409 });
        }

        const playlistSong = await prisma.playlistSong.create({
            data: { playlistId, songId }
        });

        return NextResponse.json(playlistSong, { status: 201 });
    } catch (error) {
        console.error("Add to Playlist Error:", error);
        return NextResponse.json({ error: 'Failed to add song' }, { status: 500 });
    }
}

// DELETE remove song from playlist
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const playlistId = searchParams.get('playlistId');
        const songId = searchParams.get('songId');

        if (!playlistId || !songId) {
            return NextResponse.json({ error: 'playlistId and songId are required' }, { status: 400 });
        }

        await prisma.playlistSong.deleteMany({
            where: { playlistId, songId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Remove from Playlist Error:", error);
        return NextResponse.json({ error: 'Failed to remove song' }, { status: 500 });
    }
}
