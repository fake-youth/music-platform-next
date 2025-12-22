'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Play, Music, CheckCircle } from 'lucide-react'

interface Artist {
    id: string
    name: string
    avatarUrl: string | null
    verified: boolean
    _count: {
        songs: number
        albums: number
    }
}

export default function ArtistsPage() {
    const [artists, setArtists] = useState<Artist[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchArtists()
    }, [])

    async function fetchArtists() {
        try {
            const res = await fetch('/api/artists')
            const data = await res.json()
            setArtists(data.artists || [])
        } catch (error) {
            console.error('Failed to fetch artists:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <Users className="w-10 h-10 text-purple-500" />
                        Artists
                    </h1>
                    <p className="text-gray-400">Explore talented artists and their music</p>
                </div>

                {/* Artists Grid */}
                {artists.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-400 mb-2">No artists yet</h2>
                        <p className="text-gray-500">Artists will appear here once they are added</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {artists.map((artist) => (
                            <Link
                                key={artist.id}
                                href={`/artists/${artist.id}`}
                                className="group text-center"
                            >
                                <div className="relative mb-4">
                                    {/* Artist Avatar */}
                                    <div className="aspect-square rounded-full overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-4 border-transparent group-hover:border-purple-500 transition-all duration-300 shadow-lg group-hover:shadow-purple-500/30">
                                        {artist.avatarUrl ? (
                                            <img
                                                src={artist.avatarUrl}
                                                alt={artist.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Users className="w-16 h-16 text-gray-600" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Play overlay */}
                                    <div className="absolute bottom-2 right-2 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                        <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                                    </div>
                                </div>

                                {/* Artist Info */}
                                <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
                                    {artist.name}
                                    {artist.verified && (
                                        <CheckCircle className="w-4 h-4 text-blue-500" />
                                    )}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    <span>{artist._count.songs} songs</span>
                                    <span className="mx-1">•</span>
                                    <span>{artist._count.albums} albums</span>
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
