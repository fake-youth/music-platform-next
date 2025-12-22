import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { rateLimit, getClientIdentifier, rateLimitResponse, rateLimitPresets } from '@/lib/rateLimit'

// Helper to get current user from cookies
async function getCurrentUserId(): Promise<string | null> {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    return userId || null
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const songId = searchParams.get('songId')
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

        const whereClause = songId ? { songId, parentId: null } : {}

        const comments = await prisma.comment.findMany({
            where: whereClause,
            take: limit || (songId ? undefined : 50), // Default limit 50 if fetching all
            include: {
                user: {
                    select: {
                        id: true,
                        profile: {
                            select: {
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                profile: {
                                    select: {
                                        fullName: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
                song: {
                    select: {
                        id: true,
                        title: true,
                        artistName: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json({ comments })
    } catch (error) {
        console.error('Failed to fetch comments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        // Rate limiting
        const clientId = getClientIdentifier(request)
        const rateLimitResult = rateLimit(`comments:${clientId}`, rateLimitPresets.normal)

        if (!rateLimitResult.success) {
            return rateLimitResponse(rateLimitResult.resetIn)
        }

        const userId = await getCurrentUserId()
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { songId, content, parentId } = body

        if (!songId || !content) {
            return NextResponse.json(
                { error: 'songId and content are required' },
                { status: 400 }
            )
        }

        // Validate content length
        if (content.length > 1000) {
            return NextResponse.json(
                { error: 'Comment is too long (max 1000 characters)' },
                { status: 400 }
            )
        }

        // Verify song exists
        const song = await prisma.song.findUnique({
            where: { id: songId },
        })

        if (!song) {
            return NextResponse.json(
                { error: 'Song not found' },
                { status: 404 }
            )
        }

        // If replying, verify parent comment exists
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: parentId },
            })

            if (!parentComment) {
                return NextResponse.json(
                    { error: 'Parent comment not found' },
                    { status: 404 }
                )
            }
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                songId,
                userId,
                parentId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        profile: {
                            select: {
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        })

        return NextResponse.json({ comment }, { status: 201 })
    } catch (error) {
        console.error('Failed to create comment:', error)
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        )
    }
}
