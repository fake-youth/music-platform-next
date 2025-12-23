import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { songSchema } from '@/lib/validations';

export async function GET() {
    try {
        const songs = await prisma.song.findMany({
            include: {
                genre: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json(songs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
    }
}

import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const auth = await requireAdmin();
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await request.json();
        const { title, artist, audioUrl, coverUrl, duration, genreId: bodyGenreId } = body;
        let genreId = bodyGenreId;

        // Ensure a genre exists
        if (!genreId) {
            let defaultGenre = await prisma.genre.findUnique({ where: { name: 'General' } });
            if (!defaultGenre) {
                defaultGenre = await prisma.genre.create({ data: { name: 'General' } });
            }
            genreId = defaultGenre.id;
        }

        // Validate input
        const validation = songSchema.safeParse({
            title: title?.trim(),
            artist: artist?.trim(),
            audioUrl,
            coverUrl: coverUrl || '',
            duration: parseInt(duration) || 0,
            genreId
        });

        if (!validation.success) {
            return NextResponse.json({
                error: validation.error.issues[0]?.message || 'Validation failed'
            }, { status: 400 });
        }

        // Map artist to artistName for Prisma
        const { artist: artistName, ...rest } = validation.data;

        const song = await prisma.song.create({
            data: {
                ...rest,
                artistName,
            },
        });

        return NextResponse.json(song);
    } catch (error: unknown) {
        console.error("Create Song Error:", error);
        const err = error as { code?: string };
        if (err.code === 'P2003') {
            return NextResponse.json({ error: 'Invalid genre ID' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create song' }, { status: 500 });
    }
}
