const CACHE_NAME = 'music-platform-v1'
const STATIC_CACHE = 'static-v1'
const AUDIO_CACHE = 'audio-v1'

// Static assets to cache during install
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(STATIC_ASSETS)
        })
    )
    self.skipWaiting()
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE && name !== AUDIO_CACHE)
                    .map((name) => caches.delete(name))
            )
        })
    )
    self.clients.claim()
})

// Fetch event - network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Skip non-GET requests
    if (request.method !== 'GET') return

    // Handle API requests - network first
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful GET responses
                    if (response.ok) {
                        const clonedResponse = response.clone()
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, clonedResponse)
                        })
                    }
                    return response
                })
                .catch(() => {
                    // Fallback to cache
                    return caches.match(request)
                })
        )
        return
    }

    // Handle audio files - cache with size limit
    if (url.pathname.includes('/audio/') || request.url.includes('.mp3') || request.url.includes('.wav')) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached

                return fetch(request).then((response) => {
                    // Only cache if response is ok and not too large (< 50MB)
                    const contentLength = response.headers.get('content-length')
                    if (response.ok && contentLength && parseInt(contentLength) < 50 * 1024 * 1024) {
                        const clonedResponse = response.clone()
                        caches.open(AUDIO_CACHE).then((cache) => {
                            cache.put(request, clonedResponse)
                        })
                    }
                    return response
                })
            })
        )
        return
    }

    // Handle static assets - cache first
    if (
        url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/) ||
        url.pathname.startsWith('/_next/')
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached

                return fetch(request).then((response) => {
                    if (response.ok) {
                        const clonedResponse = response.clone()
                        caches.open(STATIC_CACHE).then((cache) => {
                            cache.put(request, clonedResponse)
                        })
                    }
                    return response
                })
            })
        )
        return
    }

    // Handle page navigation - network first with offline fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const clonedResponse = response.clone()
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, clonedResponse)
                        })
                    }
                    return response
                })
                .catch(() => {
                    return caches.match(request).then((cached) => {
                        return cached || caches.match('/offline')
                    })
                })
        )
        return
    }

    // Default - network first
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-likes') {
        event.waitUntil(syncLikes())
    }
    if (event.tag === 'sync-play-history') {
        event.waitUntil(syncPlayHistory())
    }
})

async function syncLikes() {
    // Get pending likes from IndexedDB and sync
    console.log('Syncing likes...')
}

async function syncPlayHistory() {
    // Get pending play history from IndexedDB and sync
    console.log('Syncing play history...')
}

// Push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return

    const data = event.data.json()

    const options = {
        body: data.body || 'New notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
        },
        actions: data.actions || [],
    }

    event.waitUntil(
        self.registration.showNotification(data.title || 'Music Platform', options)
    )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    const url = event.notification.data?.url || '/'

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            // Check if there's already a window open
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus()
                }
            }
            // Open a new window
            if (clients.openWindow) {
                return clients.openWindow(url)
            }
        })
    )
})
