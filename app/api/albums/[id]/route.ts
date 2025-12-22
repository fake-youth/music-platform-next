import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCache, cacheTTL, cache } from '@/lib/cache'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const album = await withCache(
            `album:${id}`,
            async () => {
                return prisma.album.findUnique({
                    where: { id },
                    include: {
                        artist: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                            },
                        },
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
                                createdAt: 'asc',
                            },
                        },
                    },
                })
            },
            cacheTTL.medium
        )

        if (!album) {
            return NextResponse.json(
                { error: 'Album not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ album })
    } catch (error) {
        console.error('Failed to fetch album:', error)
        return NextResponse.json(
            { error: 'Failed to fetch album' },
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
        const { title, artistId, coverUrl } = body

        const album = await prisma.album.update({
            where: { id },
            data: {
                title,
                artistId,
                coverUrl,
            },
        })

        // Invalidate cache
        cache.invalidatePattern('album')
        cache.invalidatePattern('albums')

        return NextResponse.json({ album })
    } catch (error) {
        console.error('Failed to update album:', error)
        return NextResponse.json(
            { error: 'Failed to update album' },
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

        // Check if album has songs
        const album = await prisma.album.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { songs: true }
                }
            }
        })

        if (!album) {
            return NextResponse.json({ error: 'Album not found' }, { status: 404 })
        }

        if (album._count.songs > 0) {
            return NextResponse.json(
                { error: 'Cannot delete album with existing songs' },
                { status: 400 }
            )
        }

        await prisma.album.delete({
            where: { id },
        })

        // Invalidate cache
        cache.invalidatePattern('album')
        cache.invalidatePattern('albums')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete album:', error)
        return NextResponse.json(
            { error: 'Failed to delete album' },
            { status: 500 }
        )
    }
}
