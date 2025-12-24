import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { songSchema } from '@/lib/validations';

import { unlink } from 'fs/promises';
import { join } from 'path';

import { requireAdmin } from '@/lib/auth';

// DELETE a song
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAdmin();
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await params;

        // Get file paths before deletion
        const song = await prisma.song.findUnique({
            where: { id },
            select: { audioUrl: true, coverUrl: true }
        });

        if (song) {
            // Helper to delete file if it's local
            const deleteFile = async (url: string | null) => {
                if (!url || url.startsWith('http')) return;
                try {
                    // url is like '/uploads/audio/xyz.mp3'
                    // Remove leading slash to join with cwd
                    const relativePath = url.startsWith('/') ? url.slice(1) : url;
                    const absolutePath = join(process.cwd(), 'public', relativePath);
                    await unlink(absolutePath);
                } catch (e) {
                    console.warn(`Failed to delete file: ${url}`, e);
                }
            };

            await deleteFile(song.audioUrl);
            await deleteFile(song.coverUrl);
        }

        await prisma.song.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Song Error:", error);
        return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
    }
}

// GET a single song
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const song = await prisma.song.findUnique({
            where: { id },
            include: { genre: true }
        });

        if (!song) {
            return NextResponse.json({ error: 'Song not found' }, { status: 404 });
        }

        return NextResponse.json(song);
    } catch (error) {
        console.error("Get Song Error:", error);
        return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 });
    }
}

// PATCH update a song
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAdmin();
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await params;
        const body = await request.json();

        // Get existing song to preserve required fields
        const existingSong = await prisma.song.findUnique({ where: { id } });
        if (!existingSong) {
            return NextResponse.json({ error: 'Song not found' }, { status: 404 });
        }

        // Validate input (only validate provided fields)
        const updateData: Record<string, string | number | null> = {};
        if (body.title !== undefined) updateData.title = body.title.trim();
        if (body.artist !== undefined) updateData.artistName = body.artist.trim();
        if (body.lyrics !== undefined) updateData.lyrics = body.lyrics;
        if (body.genreId !== undefined) updateData.genreId = body.genreId;

        // Validate with schema using existing values for missing fields
        const validation = songSchema.safeParse({
            title: updateData.title || existingSong.title,
            artist: (updateData.artistName as string) || existingSong.artistName,
            lyrics: body.lyrics !== undefined ? body.lyrics : existingSong.lyrics,
            audioUrl: existingSong.audioUrl,
            coverUrl: existingSong.coverUrl || '',
            duration: existingSong.duration,
            genreId: updateData.genreId || existingSong.genreId
        });

        if (!validation.success && (body.title !== undefined || body.artist !== undefined)) {
            return NextResponse.json({
                error: validation.error.issues[0]?.message || 'Validation failed'
            }, { status: 400 });
        }

        const song = await prisma.song.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(song);
    } catch (error: unknown) {
        console.error("Update Song Error:", error);
        const err = error as { code?: string };
        if (err.code === 'P2025') {
            return NextResponse.json({ error: 'Song not found' }, { status: 404 });
        }
        if (err.code === 'P2003') {
            return NextResponse.json({ error: 'Invalid genre ID' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update song' }, { status: 500 });
    }
}
