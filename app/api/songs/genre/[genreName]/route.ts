import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get songs by genre name
export async function GET(
    request: Request,
    { params }: { params: Promise<{ genreName: string }> }
) {
    try {
        const { genreName } = await params;

        const genre = await prisma.genre.findUnique({
            where: { name: genreName },
            include: {
                songs: {
                    include: {
                        genre: true
                    },
                    orderBy: {
                        playCount: 'desc'
                    }
                }
            }
        });

        if (!genre) {
            return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
        }

        return NextResponse.json(genre.songs);
    } catch (error) {
        console.error("Get Songs by Genre Error:", error);
        return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
    }
}

