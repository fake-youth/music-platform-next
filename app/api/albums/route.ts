import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, cacheKeys, cacheTTL, withCache } from '@/lib/cache'

export async function GET() {
    try {
        const albums = await withCache(
            'albums:all',
            async () => {
                return prisma.album.findMany({
                    include: {
                        artist: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        _count: {
                            select: {
                                songs: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                })
            },
            cacheTTL.medium
        )

        return NextResponse.json({ albums })
    } catch (error) {
        console.error('Failed to fetch albums:', error)
        return NextResponse.json(
            { error: 'Failed to fetch albums' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, artistId, coverUrl, releaseDate } = body

        if (!title || !artistId) {
            return NextResponse.json(
                { error: 'Title and artistId are required' },
                { status: 400 }
            )
        }

        const album = await prisma.album.create({
            data: {
                title,
                artistId,
                coverUrl,
                releaseDate: releaseDate ? new Date(releaseDate) : null,
            },
            include: {
                artist: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        // Invalidate cache
        cache.invalidatePattern('albums')

        return NextResponse.json({ album }, { status: 201 })
    } catch (error) {
        console.error('Failed to create album:', error)
        return NextResponse.json(
            { error: 'Failed to create album' },
            { status: 500 }
        )
    }
}
