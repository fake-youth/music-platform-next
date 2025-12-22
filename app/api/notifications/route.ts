import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function getCurrentUserId(): Promise<string | null> {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    return userId || null
}

// GET: Fetch notifications for current user
export async function GET(request: Request) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const unreadOnly = searchParams.get('unread') === 'true'
        const limit = parseInt(searchParams.get('limit') || '20')

        const notifications = await prisma.notification.findMany({
            where: {
                userId,
                ...(unreadOnly && { isRead: false }),
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        })

        const unreadCount = await prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        })

        return NextResponse.json({ notifications, unreadCount })
    } catch (error) {
        console.error('Failed to fetch notifications:', error)
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        )
    }
}

// POST: Create a notification (for internal use)
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, type, title, message, link } = body

        if (!userId || !type || !title || !message) {
            return NextResponse.json(
                { error: 'userId, type, title, and message are required' },
                { status: 400 }
            )
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link,
            },
        })

        return NextResponse.json({ notification }, { status: 201 })
    } catch (error) {
        console.error('Failed to create notification:', error)
        return NextResponse.json(
            { error: 'Failed to create notification' },
            { status: 500 }
        )
    }
}

// PATCH: Mark notifications as read
export async function PATCH(request: Request) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { notificationIds, markAllRead } = body

        if (markAllRead) {
            await prisma.notification.updateMany({
                where: {
                    userId,
                    isRead: false,
                },
                data: {
                    isRead: true,
                },
            })
        } else if (notificationIds && Array.isArray(notificationIds)) {
            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId,
                },
                data: {
                    isRead: true,
                },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to mark notifications as read:', error)
        return NextResponse.json(
            { error: 'Failed to mark notifications as read' },
            { status: 500 }
        )
    }
}

// DELETE: Delete a notification
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
        const notificationId = searchParams.get('id')

        if (!notificationId) {
            return NextResponse.json(
                { error: 'notification id is required' },
                { status: 400 }
            )
        }

        await prisma.notification.deleteMany({
            where: {
                id: notificationId,
                userId,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete notification:', error)
        return NextResponse.json(
            { error: 'Failed to delete notification' },
            { status: 500 }
        )
    }
}
