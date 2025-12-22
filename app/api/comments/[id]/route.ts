import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function getCurrentUserId(): Promise<string | null> {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    return userId || null
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const userId = await getCurrentUserId()

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if comment exists and belongs to user
        const comment = await prisma.comment.findUnique({
            where: { id },
        })

        if (!comment) {
            return NextResponse.json(
                { error: 'Comment not found' },
                { status: 404 }
            )
        }

        if (comment.userId !== userId) {
            return NextResponse.json(
                { error: 'You can only delete your own comments' },
                { status: 403 }
            )
        }

        // Delete comment and all its replies (cascade)
        await prisma.comment.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete comment:', error)
        return NextResponse.json(
            { error: 'Failed to delete comment' },
            { status: 500 }
        )
    }
}
