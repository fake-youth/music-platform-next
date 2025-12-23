import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { genreSchema } from '@/lib/validations';

// GET all genres
export async function GET() {
    try {
        const genres = await prisma.genre.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(genres);
    } catch (error) {
        console.error("Get Genres Error:", error);
        return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 });
    }
}

// POST create a new genre
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = genreSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: validation.error.issues[0]?.message || 'Validation failed'
            }, { status: 400 });
        }

        const genre = await prisma.genre.create({
            data: {
                name: validation.data.name.trim()
            }
        });

        return NextResponse.json(genre, { status: 201 });
    } catch (error: unknown) {
        console.error("Create Genre Error:", error);
        const err = error as { code?: string };
        if (err.code === 'P2002') {
            return NextResponse.json({ error: 'Genre name already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create genre' }, { status: 500 });
    }
}

// DELETE a genre
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Genre ID required' }, { status: 400 });
        }

        await prisma.genre.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Delete Genre Error:", error);
        const err = error as { code?: string };
        if (err.code === 'P2003') {
            return NextResponse.json({ error: 'Cannot delete genre because it is used by songs' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to delete genre' }, { status: 500 });
    }
}
