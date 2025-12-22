import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { playlistSchema } from '@/lib/validations';

// GET all playlists for a user OR global playlists
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const global = searchParams.get('global');

        // Handle global playlists request
        if (global === 'true') {
            const playlists = await prisma.playlist.findMany({
                where: { isGlobal: true },
                include: {
                    songs: {
                        include: { song: true }
                    },
                    creator: {
                        include: {
                            profile: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json(playlists);
        }

        // Handle user playlists request
        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const playlists = await prisma.playlist.findMany({
            where: { creatorId: userId },
            include: {
                songs: {
                    include: { song: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(playlists);
    } catch (error) {
        console.error("Get Playlists Error:", error);
        return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
    }
}

// POST create a new playlist
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, userId } = body;

        // Validate input
        const validation = playlistSchema.safeParse({ name: name?.trim(), userId });
        if (!validation.success) {
            return NextResponse.json({
                error: validation.error.issues[0]?.message || 'Validation failed'
            }, { status: 400 });
        }

        const playlist = await prisma.playlist.create({
            data: {
                title: validation.data.name,
                creatorId: validation.data.userId
            }
        });

        // Return with name field for frontend compatibility
        return NextResponse.json({ ...playlist, name: playlist.title }, { status: 201 });
    } catch (error: unknown) {
        console.error("Create Playlist Error:", error);
        const err = error as { code?: string };
        if (err.code === 'P2003') {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
    }
}

// DELETE a playlist
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        // Delete playlist songs first
        await prisma.playlistSong.deleteMany({ where: { playlistId: id } });
        await prisma.playlist.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Playlist Error:", error);
        return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
    }
}

