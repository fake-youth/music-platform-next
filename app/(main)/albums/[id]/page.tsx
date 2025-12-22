'use client'

import { useState, useEffect, use, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Disc3, Play, Clock, Heart, Share2, Music } from 'lucide-react'

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
    releaseDate: string | null
    artist: {
        id: string
        name: string
        avatarUrl: string | null
    }
    songs: Song[]
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [album, setAlbum] = useState<Album | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchAlbum = useCallback(async () => {
        try {
            const res = await fetch(`/api/albums/${resolvedParams.id}`)
            const data = await res.json()
            setAlbum(data.album)
        } catch (error) {
            console.error('Failed to fetch album:', error)
        } finally {
            setLoading(false)
        }
    }, [resolvedParams.id])

    useEffect(() => {
        fetchAlbum()
    }, [fetchAlbum])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (!album) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center">
                    <Disc3 className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-white mb-2">Album not found</h2>
                    <Link href="/albums" className="text-purple-400 hover:text-purple-300">
                        ← Back to albums
                    </Link>
                </div>
            </div>
        )
    }

    const totalDuration = album.songs.reduce((acc, song) => acc + song.duration, 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Hero Section */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 to-transparent"></div>
                <div className="relative p-6 md:p-10">
                    <Link
                        href="/albums"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Albums
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Album Cover */}
                        <div className="flex-shrink-0">
                            <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                                {album.coverUrl ? (
                                    <img
                                        src={album.coverUrl}
                                        alt={album.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Disc3 className="w-24 h-24 text-gray-600" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Album Info */}
                        <div className="flex flex-col justify-end">
                            <span className="text-sm font-medium text-purple-400 uppercase tracking-wider">Album</span>
                            <h1 className="text-5xl font-bold text-white mt-2 mb-4">{album.title}</h1>

                            <div className="flex items-center gap-4 text-gray-300">
                                <Link
                                    href={`/artists/${album.artist.id}`}
                                    className="flex items-center gap-2 hover:text-white transition-colors"
                                >
                                    {album.artist.avatarUrl ? (
                                        <img
                                            src={album.artist.avatarUrl}
                                            alt={album.artist.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                            <Music className="w-4 h-4 text-gray-400" />
                                        </div>
                                    )}
                                    <span className="font-semibold">{album.artist.name}</span>
                                </Link>
                                <span className="text-gray-500">•</span>
                                <span>{album.songs.length} songs</span>
                                <span className="text-gray-500">•</span>
                                <span>{formatDuration(totalDuration)}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 mt-6">
                                <button className="w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 transition-all hover:scale-105">
                                    <Play className="w-7 h-7 text-white ml-1" fill="white" />
                                </button>
                                <button className="w-12 h-12 border border-gray-600 hover:border-white rounded-full flex items-center justify-center transition-all">
                                    <Heart className="w-6 h-6 text-gray-400 hover:text-white" />
                                </button>
                                <button className="w-12 h-12 border border-gray-600 hover:border-white rounded-full flex items-center justify-center transition-all">
                                    <Share2 className="w-5 h-5 text-gray-400 hover:text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Songs List */}
            <div className="px-6 md:px-10 pb-10">
                <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-4 border-b border-gray-700/50 text-sm text-gray-400">
                        <span className="w-8 text-center">#</span>
                        <span>Title</span>
                        <span className="hidden md:block">Plays</span>
                        <span className="flex items-center justify-end gap-1">
                            <Clock className="w-4 h-4" />
                        </span>
                    </div>

                    {/* Songs */}
                    {album.songs.map((song, index) => (
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
                                {song.playCount.toLocaleString()}
                            </span>

                            <span className="text-gray-400 text-sm text-right">
                                {formatDuration(song.duration)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
