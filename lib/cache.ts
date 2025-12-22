// In-memory cache layer
// For production, consider using Redis

interface CacheEntry<T> {
    data: T
    expiresAt: number
}

class Cache {
    private store = new Map<string, CacheEntry<unknown>>()
    private defaultTTL = 5 * 60 * 1000 // 5 minutes

    set<T>(key: string, data: T, ttlMs?: number): void {
        const ttl = ttlMs ?? this.defaultTTL
        this.store.set(key, {
            data,
            expiresAt: Date.now() + ttl,
        })

        // Cleanup expired entries periodically
        if (Math.random() < 0.05) {
            this.cleanup()
        }
    }

    get<T>(key: string): T | null {
        const entry = this.store.get(key) as CacheEntry<T> | undefined

        if (!entry) {
            return null
        }

        if (Date.now() >= entry.expiresAt) {
            this.store.delete(key)
            return null
        }

        return entry.data
    }

    has(key: string): boolean {
        const entry = this.store.get(key)
        if (!entry) return false
        if (Date.now() >= entry.expiresAt) {
            this.store.delete(key)
            return false
        }
        return true
    }

    delete(key: string): boolean {
        return this.store.delete(key)
    }

    clear(): void {
        this.store.clear()
    }

    // Delete all keys matching a pattern
    invalidatePattern(pattern: string): number {
        let count = 0
        for (const key of this.store.keys()) {
            if (key.includes(pattern)) {
                this.store.delete(key)
                count++
            }
        }
        return count
    }

    private cleanup(): void {
        const now = Date.now()
        for (const [key, entry] of this.store.entries()) {
            if (now >= entry.expiresAt) {
                this.store.delete(key)
            }
        }
    }

    // Get cache stats
    stats(): { size: number; keys: string[] } {
        return {
            size: this.store.size,
            keys: Array.from(this.store.keys()),
        }
    }
}

// Singleton instance
export const cache = new Cache()

// Cache key generators
export const cacheKeys = {
    song: (id: string) => `song:${id}`,
    songs: (page?: number, genre?: string) => `songs:${page ?? 'all'}:${genre ?? 'all'}`,
    user: (id: string) => `user:${id}`,
    playlist: (id: string) => `playlist:${id}`,
    playlists: (userId: string) => `playlists:${userId}`,
    genre: (id: string) => `genre:${id}`,
    genres: () => 'genres:all',
    stats: (type: string) => `stats:${type}`,
    search: (query: string) => `search:${query}`,
}

// Cache TTL presets (in milliseconds)
export const cacheTTL = {
    short: 1 * 60 * 1000, // 1 minute
    medium: 5 * 60 * 1000, // 5 minutes
    long: 30 * 60 * 1000, // 30 minutes
    hour: 60 * 60 * 1000, // 1 hour
    day: 24 * 60 * 60 * 1000, // 24 hours
}

// Wrapper for cached async operations
export async function withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs?: number
): Promise<T> {
    const cached = cache.get<T>(key)
    if (cached !== null) {
        return cached
    }

    const data = await fetcher()
    cache.set(key, data, ttlMs)
    return data
}
