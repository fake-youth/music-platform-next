'use client'

import { useState, useEffect, use, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Play, Clock, Heart, Share2, Music, Disc3, CheckCircle } from 'lucide-react'

interface Song {
    id: string
    title: string
    artistName: string;
    duration: number
    coverUrl: string | null
    playCount: number
}

interface Album {
    id: string
    title: string
    coverUrl: string | null
    _count: {
        songs: number
    }
}

interface Artist {
    id: string
    name: string
    bio: string | null
    avatarUrl: string | null
    coverUrl: string | null
    verified: boolean
    songs: Song[]
    albums: Album[]
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [artist, setArtist] = useState<Artist | null>(null)
    const [loading, setLoading] = useState(true)
    const [isFollowing, setIsFollowing] = useState(false)

    const fetchArtist = useCallback(async () => {
        try {
            const res = await fetch(`/api/artists/${resolvedParams.id}`)
            const data = await res.json()
            setArtist(data.artist)
        } catch (error) {
            console.error('Failed to fetch artist:', error)
        } finally {
            setLoading(false)
        }
    }, [resolvedParams.id])

    useEffect(() => {
        fetchArtist()
    }, [fetchArtist])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (!artist) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center">
                    <Users className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-white mb-2">Artist not found</h2>
                    <Link href="/artists" className="text-purple-400 hover:text-purple-300">
                        ← Back to artists
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Hero Section */}
            <div className="relative">
                {/* Cover Image */}
                <div className="h-80 relative overflow-hidden">
                    {artist.coverUrl ? (
                        <img
                            src={artist.coverUrl}
                            alt={artist.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                </div>

                {/* Artist Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <Link
                        href="/artists"
                        className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Artists
                    </Link>

                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                        {/* Avatar */}
                        <div className="w-40 h-40 rounded-full overflow-hidden shadow-2xl border-4 border-gray-900 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex-shrink-0">
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

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                {artist.verified && (
                                    <span className="flex items-center gap-1 text-sm text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full">
                                        <CheckCircle className="w-4 h-4" />
                                        Verified Artist
                                    </span>
                                )}
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">{artist.name}</h1>
                            {artist.bio && (
                                <p className="text-gray-400 max-w-2xl mb-4">{artist.bio}</p>
                            )}
                            <p className="text-gray-400">
                                {artist.songs.length} songs • {artist.albums.length} albums
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 mt-6">
                        <button className="w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 transition-all hover:scale-105">
                            <Play className="w-7 h-7 text-white ml-1" fill="white" />
                        </button>
                        <button
                            onClick={() => setIsFollowing(!isFollowing)}
                            className={`px-8 py-3 rounded-full font-semibold transition-all ${isFollowing
                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                : 'bg-white text-gray-900 hover:bg-gray-200'
                                }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <button className="w-12 h-12 border border-gray-600 hover:border-white rounded-full flex items-center justify-center transition-all">
                            <Share2 className="w-5 h-5 text-gray-400 hover:text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 md:px-10 py-10 space-y-12">
                {/* Albums */}
                {artist.albums.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">Albums</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {artist.albums.map((album) => (
                                <Link
                                    key={album.id}
                                    href={`/albums/${album.id}`}
                                    className="group"
                                >
                                    <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-lg border border-gray-700/50 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
                                        <div className="aspect-square rounded-lg overflow-hidden mb-3 relative bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                                            {album.coverUrl ? (
                                                <img
                                                    src={album.coverUrl}
                                                    alt={album.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Disc3 className="w-12 h-12 text-gray-600" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play className="w-10 h-10 text-white" fill="white" />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-white truncate">{album.title}</h3>
                                        <p className="text-sm text-gray-400">{album._count.songs} songs</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Popular Songs */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6">Popular Songs</h2>
                    <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden">
                        {artist.songs.slice(0, 10).map((song, index) => (
                            <div
                                key={song.id}
                                className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-3 hover:bg-gray-700/30 transition-colors group cursor-pointer"
                            >
                                <span className="w-8 text-center text-gray-400 group-hover:hidden">{index + 1}</span>
                                <Play className="w-4 h-4 text-white hidden group-hover:block mx-auto" />

                                <div className="flex items-center gap-3 min-w-0">
                                    {song.coverUrl ? (
                                        <img
                                            src={song.coverUrl}
                                            alt={song.title}
                                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                                            <Music className="w-5 h-5 text-gray-500" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-medium text-white truncate">{song.title}</p>
                                        <p className="text-sm text-gray-400 truncate">{song.artistName}</p>
                                    </div>
                                </div>

                                <span className="hidden md:block text-gray-400 text-sm">
                                    {song.playCount.toLocaleString()} plays
                                </span>

                                <span className="text-gray-400 text-sm text-right">
                                    {formatDuration(song.duration)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
