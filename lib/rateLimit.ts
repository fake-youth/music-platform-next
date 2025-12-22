// In-memory rate limiter for API protection
// For production, consider using Redis-based rate limiting

interface RateLimitEntry {
    count: number
    resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
    maxRequests: number
    windowMs: number
}

const defaultConfig: RateLimitConfig = {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
}

export function rateLimit(
    identifier: string,
    config: RateLimitConfig = defaultConfig
): { success: boolean; remaining: number; resetIn: number } {
    const now = Date.now()
    const entry = rateLimitStore.get(identifier)

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
        cleanupExpiredEntries()
    }

    if (!entry || now >= entry.resetTime) {
        // Create new entry or reset expired one
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + config.windowMs,
        })
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetIn: config.windowMs,
        }
    }

    if (entry.count >= config.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetIn: entry.resetTime - now,
        }
    }

    entry.count++
    return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetIn: entry.resetTime - now,
    }
}

function cleanupExpiredEntries(): void {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now >= entry.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}

// Helper to get client identifier from request
export function getClientIdentifier(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    return ip
}

// Rate limit response helper
export function rateLimitResponse(resetIn: number): Response {
    return new Response(
        JSON.stringify({
            error: 'Too many requests',
            message: 'Please try again later',
            retryAfter: Math.ceil(resetIn / 1000),
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(Math.ceil(resetIn / 1000)),
            },
        }
    )
}

// Preset configurations
export const rateLimitPresets = {
    strict: { maxRequests: 10, windowMs: 60 * 1000 },
    normal: { maxRequests: 100, windowMs: 60 * 1000 },
    relaxed: { maxRequests: 500, windowMs: 60 * 1000 },
    auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
}
