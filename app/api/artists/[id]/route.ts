import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCache, cacheTTL, cache } from '@/lib/cache'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const artist = await withCache(
            `artist:${id}`,
            async () => {
                return prisma.artist.findUnique({
                    where: { id },
                    include: {
                        songs: {
                            select: {
                                id: true,
                                title: true,
                                artistName: true,
                                duration: true,
                                coverUrl: true,
                                playCount: true,
                            },
                            orderBy: {
                                playCount: 'desc',
                            },
                        },
                        albums: {
                            select: {
                                id: true,
                                title: true,
                                coverUrl: true,
                                _count: {
                                    select: {
                                        songs: true,
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: 'desc',
                            },
                        },
                    },
                })
            },
            cacheTTL.medium
        )

        if (!artist) {
            return NextResponse.json(
                { error: 'Artist not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ artist })
    } catch (error) {
        console.error('Failed to fetch artist:', error)
        return NextResponse.json(
            { error: 'Failed to fetch artist' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name, bio, avatarUrl, coverUrl } = body

        const artist = await prisma.artist.update({
            where: { id },
            data: {
                name,
                bio,
                avatarUrl,
                coverUrl,
            },
        })

        // Invalidate cache
        cache.invalidatePattern('artist')
        cache.invalidatePattern('artists')

        return NextResponse.json({ artist })
    } catch (error) {
        console.error('Failed to update artist:', error)
        return NextResponse.json(
            { error: 'Failed to update artist' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Check if artist has songs/albums
        const artist = await prisma.artist.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { songs: true, albums: true }
                }
            }
        })

        if (!artist) {
            return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
        }

        if (artist._count.songs > 0 || artist._count.albums > 0) {
            return NextResponse.json(
                { error: 'Cannot delete artist with existing songs or albums' },
                { status: 400 }
            )
        }

        await prisma.artist.delete({
            where: { id },
        })

        // Invalidate cache
        cache.invalidatePattern('artist')
        cache.invalidatePattern('artists')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete artist:', error)
        return NextResponse.json(
            { error: 'Failed to delete artist' },
            { status: 500 }
        )
    }
}
