import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function getCurrentUserId(): Promise<string | null> {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    return userId || null
}

// GET: Get current user's subscription
export async function GET() {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const subscription = await prisma.subscription.findUnique({
            where: { userId },
        })

        return NextResponse.json({ subscription })
    } catch (error) {
        console.error('Failed to get subscription:', error)
        return NextResponse.json(
            { error: 'Failed to get subscription' },
            { status: 500 }
        )
    }
}

// POST: Create or update subscription
export async function POST(request: Request) {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { plan, paymentMethod, transactionId } = body

        if (!plan || !['FREE', 'PREMIUM', 'PREMIUM_PLUS'].includes(plan)) {
            return NextResponse.json(
                { error: 'Invalid plan. Must be FREE, PREMIUM, or PREMIUM_PLUS' },
                { status: 400 }
            )
        }

        // Calculate end date (1 month from now for paid plans)
        const endDate = plan === 'FREE' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        // Upsert subscription
        const subscription = await prisma.subscription.upsert({
            where: { userId },
            update: {
                plan,
                status: 'ACTIVE',
                endDate,
                paymentMethod,
                transactionId,
            },
            create: {
                userId,
                plan,
                status: 'ACTIVE',
                startDate: new Date(),
                endDate,
                paymentMethod,
                transactionId,
            },
        })

        // Update user's premium status
        await prisma.user.update({
            where: { id: userId },
            data: {
                isPremium: plan !== 'FREE',
            },
        })

        return NextResponse.json({ subscription }, { status: 201 })
    } catch (error) {
        console.error('Failed to create subscription:', error)
        return NextResponse.json(
            { error: 'Failed to create subscription' },
            { status: 500 }
        )
    }
}

// DELETE: Cancel subscription
export async function DELETE() {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const subscription = await prisma.subscription.findUnique({
            where: { userId },
        })

        if (!subscription) {
            return NextResponse.json(
                { error: 'No subscription found' },
                { status: 404 }
            )
        }

        // Cancel subscription (set status and keep until end date)
        await prisma.subscription.update({
            where: { userId },
            data: {
                status: 'CANCELLED',
            },
        })

        return NextResponse.json({ success: true, message: 'Subscription cancelled. Access continues until end of billing period.' })
    } catch (error) {
        console.error('Failed to cancel subscription:', error)
        return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
        )
    }
}
