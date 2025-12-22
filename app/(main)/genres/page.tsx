"use client";

import { useState, useEffect, Suspense } from "react";
import { Tag, Play, Music, Loader2, Plus } from "lucide-react";
import { usePlayer } from "@/components/providers/PlayerContext";
import { AddToPlaylistMenu } from "@/components/playlist/AddToPlaylistMenu";
import { getUserIdFromCookie } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface Genre {
    id: string;
    name: string;
}

interface Song {
    id: string;
    title: string;
    artistName: string;
    audioUrl: string;
    coverUrl: string | null;
    duration: number;
    genre?: { name: string } | null;
}

function GenresContent() {
    const searchParams = useSearchParams();
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(searchParams.get('genre') || null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);
    const { playSong, setPlaylist } = usePlayer();

    useEffect(() => {
        fetch('/api/genres')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setGenres(data);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedGenre) {
            fetch(`/api/songs/genre/${encodeURIComponent(selectedGenre)}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setSongs(data);
                    } else {
                        // Fallback to client-side filter
                        fetch('/api/songs')
                            .then(res => res.json())
                            .then(allSongs => {
                                if (Array.isArray(allSongs)) {
                                    const filtered = allSongs.filter((s: Song) => s.genre?.name === selectedGenre);
                                    setSongs(filtered);
                                }
                            });
                    }
                })
                .catch(() => {
                    // Fallback to client-side filter
                    fetch('/api/songs')
                        .then(res => res.json())
                        .then(allSongs => {
                            if (Array.isArray(allSongs)) {
                                const filtered = allSongs.filter((s: Song) => s.genre?.name === selectedGenre);
                                setSongs(filtered);
                            }
                        });
                });
        } else {
            if (songs.length > 0) {
                setTimeout(() => setSongs([]), 0);
            }
        }
    }, [selectedGenre]);

    const handlePlay = (song: Song) => {
        playSong(song);
        setPlaylist(songs);
    };

    const genreColors = [
        'from-rose-500 to-pink-600',
        'from-amber-500 to-orange-600',
        'from-emerald-500 to-teal-600',
        'from-blue-500 to-indigo-600',
        'from-purple-500 to-violet-600',
        'from-cyan-500 to-sky-600',
        'from-red-500 to-rose-600',
        'from-green-500 to-emerald-600',
    ];

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#00e5ff]" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pt-4">
            <div className="flex items-center gap-4">
                <div className="size-16 rounded-xl bg-gradient-to-br from-[#00e5ff]/30 to-[#00e5ff]/5 flex items-center justify-center border border-[#00e5ff]/20">
                    <Tag size={28} className="text-[#00e5ff]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Genres</h1>
                    <p className="text-zinc-400">Browse music by category</p>
                </div>
            </div>

            {/* Genre Pills */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => setSelectedGenre(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedGenre ? 'bg-[#00e5ff] text-black' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                >
                    All
                </button>
                {genres.map((genre, idx) => (
                    <button
                        key={genre.id}
                        onClick={() => setSelectedGenre(genre.name)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedGenre === genre.name
                            ? 'bg-[#00e5ff] text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        {genre.name}
                    </button>
                ))}
            </div>

            {/* Genre Cards (when no selection) */}
            {!selectedGenre && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {genres.map((genre, idx) => (
                        <div
                            key={genre.id}
                            onClick={() => setSelectedGenre(genre.name)}
                            className={`bg-gradient-to-br ${genreColors[idx % genreColors.length]} rounded-xl p-6 h-32 flex items-end cursor-pointer hover:scale-105 transition-transform`}
                        >
                            <span className="font-bold text-white text-xl drop-shadow-lg">{genre.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Songs in Selected Genre */}
            {selectedGenre && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">{selectedGenre}</h2>
                    {songs.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            No songs found in this genre
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {songs.map((song) => (
                                <div
                                    key={song.id}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 group relative"
                                >
                                    <div
                                        onClick={() => handlePlay(song)}
                                        className="size-12 bg-zinc-800 rounded-lg overflow-hidden relative flex-shrink-0 cursor-pointer"
                                    >
                                        {song.coverUrl ? (
                                            <img src={song.coverUrl} alt="" className="size-full object-cover" />
                                        ) : (
                                            <div className="size-full bg-[#00e5ff]/20 flex items-center justify-center">
                                                <Music size={20} className="text-[#00e5ff]/50" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Play size={18} fill="white" className="text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePlay(song)}>
                                        <p className="text-white font-medium truncate">{song.title}</p>
                                        <p className="text-zinc-400 text-sm truncate">{song.artistName}</p>
                                    </div>
                                    {getUserIdFromCookie() && (
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowPlaylistMenu(showPlaylistMenu === song.id ? null : song.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded"
                                            >
                                                <Plus size={16} className="text-zinc-400" />
                                            </button>
                                            {showPlaylistMenu === song.id && (
                                                <AddToPlaylistMenu
                                                    songId={song.id}
                                                    onClose={() => setShowPlaylistMenu(null)}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function GenresPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#00e5ff]" size={32} />
            </div>
        }>
            <GenresContent />
        </Suspense>
    );
}

