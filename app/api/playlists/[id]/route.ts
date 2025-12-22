import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a single playlist by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const playlist = await prisma.playlist.findUnique({
            where: { id },
            include: {
                songs: {
                    include: {
                        song: {
                            include: {
                                genre: true
                            }
                        }
                    },
                    orderBy: {
                        addedAt: 'desc'
                    }
                }
            }
        });

        if (!playlist) {
            return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
        }

        return NextResponse.json(playlist);
    } catch (error) {
        console.error("Get Playlist Error:", error);
        return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
    }
}

