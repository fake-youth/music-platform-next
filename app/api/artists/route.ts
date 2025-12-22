import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, cacheTTL, withCache } from '@/lib/cache'

export async function GET() {
    try {
        const artists = await withCache(
            'artists:all',
            async () => {
                return prisma.artist.findMany({
                    include: {
                        _count: {
                            select: {
                                songs: true,
                                albums: true,
                            },
                        },
                    },
                    orderBy: {
                        name: 'asc',
                    },
                })
            },
            cacheTTL.medium
        )

        return NextResponse.json({ artists })
    } catch (error) {
        console.error('Failed to fetch artists:', error)
        return NextResponse.json(
            { error: 'Failed to fetch artists' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, bio, avatarUrl, coverUrl } = body

        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            )
        }

        const artist = await prisma.artist.create({
            data: {
                name,
                bio,
                avatarUrl,
                coverUrl,
            },
        })

        // Invalidate cache
        cache.invalidatePattern('artists')

        return NextResponse.json({ artist }, { status: 201 })
    } catch (error) {
        console.error('Failed to create artist:', error)
        return NextResponse.json(
            { error: 'Failed to create artist' },
            { status: 500 }
        )
    }
}
