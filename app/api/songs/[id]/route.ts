import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { songSchema } from '@/lib/validations';

// DELETE a song
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

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
        if (body.genreId !== undefined) updateData.genreId = body.genreId;

        // Validate with schema using existing values for missing fields
        const validation = songSchema.safeParse({
            title: updateData.title || existingSong.title,
            artist: (updateData.artistName as string) || existingSong.artistName,
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
