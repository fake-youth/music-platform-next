'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WifiOff, RefreshCw, Home, Search, Library } from 'lucide-react'

export default function OfflinePage() {
    const [isOnline, setIsOnline] = useState(() => {
        if (typeof window !== 'undefined') {
            return navigator.onLine
        }
        return true
    })

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (isOnline) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <RefreshCw className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">You&apos;re back online!</h1>
                    <p className="text-gray-400 mb-8">Redirecting you to the app...</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center animate-pulse">
                    <WifiOff className="w-12 h-12 text-gray-500" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-3">You&apos;re Offline</h1>
                <p className="text-gray-400 mb-8">
                    It looks like you&apos;ve lost your internet connection.
                    Some features may not be available until you reconnect.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-all"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </button>

                    <div className="pt-4 border-t border-gray-800">
                        <p className="text-sm text-gray-500 mb-4">While offline, you can still:</p>
                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href="/library"
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all"
                            >
                                <Library className="w-5 h-5" />
                                <span>Library</span>
                            </Link>
                            <Link
                                href="/likes"
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all"
                            >
                                <span>❤️</span>
                                <span>Liked Songs</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-xs text-gray-600">
                    Downloaded songs will be available for offline playback
                </p>
            </div>
        </div>
    )
}
