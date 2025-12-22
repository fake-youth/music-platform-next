'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Disc3, Play, Music } from 'lucide-react'

interface Album {
    id: string
    title: string
    coverUrl: string | null
    artist: {
        id: string
        name: string
    }
    _count: {
        songs: number
    }
    releaseDate: string | null
}

export default function AlbumsPage() {
    const [albums, setAlbums] = useState<Album[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAlbums()
    }, [])

    async function fetchAlbums() {
        try {
            const res = await fetch('/api/albums')
            const data = await res.json()
            setAlbums(data.albums || [])
        } catch (error) {
            console.error('Failed to fetch albums:', error)
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
                        <Disc3 className="w-10 h-10 text-purple-500" />
                        Albums
                    </h1>
                    <p className="text-gray-400">Discover amazing albums from your favorite artists</p>
                </div>

                {/* Albums Grid */}
                {albums.length === 0 ? (
                    <div className="text-center py-20">
                        <Disc3 className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-400 mb-2">No albums yet</h2>
                        <p className="text-gray-500">Albums will appear here once they are added</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {albums.map((album) => (
                            <Link
                                key={album.id}
                                href={`/albums/${album.id}`}
                                className="group"
                            >
                                <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                                    {/* Album Cover */}
                                    <div className="aspect-square rounded-lg overflow-hidden mb-4 relative bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                                        {album.coverUrl ? (
                                            <img
                                                src={album.coverUrl}
                                                alt={album.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Disc3 className="w-16 h-16 text-gray-600" />
                                            </div>
                                        )}
                                        {/* Play overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                                                <Play className="w-6 h-6 text-white ml-1" fill="white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Album Info */}
                                    <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                                        {album.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 truncate">
                                        {album.artist.name}
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                        <Music className="w-3 h-3" />
                                        <span>{album._count.songs} songs</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
