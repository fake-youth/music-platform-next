import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { rateLimit, getClientIdentifier, rateLimitResponse } from '@/lib/rateLimit'

async function getCurrentUserId(): Promise<string | null> {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    return userId || null
}

// GET: Check if current user follows a specific user
export async function GET(request: Request) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return NextResponse.json({ isFollowing: false })
        }

        const { searchParams } = new URL(request.url)
        const targetUserId = searchParams.get('userId')

        if (!targetUserId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            )
        }

        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetUserId,
                },
            },
        })

        return NextResponse.json({ isFollowing: !!follow })
    } catch (error) {
        console.error('Failed to check follow status:', error)
        return NextResponse.json(
            { error: 'Failed to check follow status' },
            { status: 500 }
        )
    }
}

// POST: Follow a user
export async function POST(request: Request) {
    try {
        // Rate limiting
        const clientId = getClientIdentifier(request)
        const rateLimitResult = rateLimit(`follow:${clientId}`, { maxRequests: 30, windowMs: 60000 })

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
        const { targetUserId } = body

        if (!targetUserId) {
            return NextResponse.json(
                { error: 'targetUserId is required' },
                { status: 400 }
            )
        }

        if (targetUserId === userId) {
            return NextResponse.json(
                { error: 'You cannot follow yourself' },
                { status: 400 }
            )
        }

        // Check if target user exists
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
        })

        if (!targetUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Create follow relationship
        const follow = await prisma.follow.create({
            data: {
                followerId: userId,
                followingId: targetUserId,
            },
        })

        // Create notification for the followed user
        await prisma.notification.create({
            data: {
                userId: targetUserId,
                type: 'FOLLOW',
                title: 'New Follower',
                message: 'Someone started following you!',
                link: `/profile/${userId}`,
            },
        })

        return NextResponse.json({ success: true, follow }, { status: 201 })
    } catch (error) {
        console.error('Failed to follow user:', error)
        return NextResponse.json(
            { error: 'Failed to follow user' },
            { status: 500 }
        )
    }
}

// DELETE: Unfollow a user
export async function DELETE(request: Request) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const targetUserId = searchParams.get('userId')

        if (!targetUserId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            )
        }

        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetUserId,
                },
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to unfollow user:', error)
        return NextResponse.json(
            { error: 'Failed to unfollow user' },
            { status: 500 }
        )
    }
}
