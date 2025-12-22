import { prisma } from '@/lib/prisma'
import { cache, cacheTTL, withCache } from '@/lib/cache'

export interface PremiumStatus {
    isPremium: boolean
    plan: 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS'
    features: PremiumFeatures
}

export interface PremiumFeatures {
    noAds: boolean
    offlineDownload: boolean
    highQualityAudio: boolean
    losslessAudio: boolean
    unlimitedPlaylists: boolean
    maxPlaylists: number
    prioritySupport: boolean
    earlyAccess: boolean
    familySharing: boolean
    maxFamilyMembers: number
}

const FREE_FEATURES: PremiumFeatures = {
    noAds: false,
    offlineDownload: false,
    highQualityAudio: false,
    losslessAudio: false,
    unlimitedPlaylists: false,
    maxPlaylists: 5,
    prioritySupport: false,
    earlyAccess: false,
    familySharing: false,
    maxFamilyMembers: 0,
}

const PREMIUM_FEATURES: PremiumFeatures = {
    noAds: true,
    offlineDownload: true,
    highQualityAudio: true,
    losslessAudio: false,
    unlimitedPlaylists: true,
    maxPlaylists: Infinity,
    prioritySupport: true,
    earlyAccess: false,
    familySharing: false,
    maxFamilyMembers: 0,
}

const PREMIUM_PLUS_FEATURES: PremiumFeatures = {
    noAds: true,
    offlineDownload: true,
    highQualityAudio: true,
    losslessAudio: true,
    unlimitedPlaylists: true,
    maxPlaylists: Infinity,
    prioritySupport: true,
    earlyAccess: true,
    familySharing: true,
    maxFamilyMembers: 6,
}

export async function getPremiumStatus(userId: string): Promise<PremiumStatus> {
    return withCache(
        `premium:${userId}`,
        async () => {
            const subscription = await prisma.subscription.findUnique({
                where: { userId },
            })

            if (!subscription || subscription.status !== 'ACTIVE') {
                return {
                    isPremium: false,
                    plan: 'FREE' as const,
                    features: FREE_FEATURES,
                }
            }

            // Check if subscription is expired
            if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
                return {
                    isPremium: false,
                    plan: 'FREE' as const,
                    features: FREE_FEATURES,
                }
            }

            const plan = subscription.plan as 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS'

            return {
                isPremium: plan !== 'FREE',
                plan,
                features: plan === 'PREMIUM_PLUS'
                    ? PREMIUM_PLUS_FEATURES
                    : plan === 'PREMIUM'
                        ? PREMIUM_FEATURES
                        : FREE_FEATURES,
            }
        },
        cacheTTL.short
    )
}

export function checkFeature(status: PremiumStatus, feature: keyof PremiumFeatures): boolean {
    return !!status.features[feature]
}

export function invalidatePremiumCache(userId: string): void {
    cache.delete(`premium:${userId}`)
}

// Higher-order function for premium-only API routes
export function requirePremium(
    handler: (request: Request, userId: string, premiumStatus: PremiumStatus) => Promise<Response>
) {
    return async (request: Request, userId: string): Promise<Response> => {
        const status = await getPremiumStatus(userId)

        if (!status.isPremium) {
            return new Response(
                JSON.stringify({
                    error: 'Premium required',
                    message: 'This feature requires a Premium subscription',
                    upgradeUrl: '/premium',
                }),
                {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                }
            )
        }

        return handler(request, userId, status)
    }
}
