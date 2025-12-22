"use client";

import { useState, useEffect } from "react";
import { Compass, Play, Music, TrendingUp, Sparkles, Plus } from "lucide-react";
import { usePlayer } from "@/components/providers/PlayerContext";
import { AddToPlaylistMenu } from "@/components/playlist/AddToPlaylistMenu";
import { getUserIdFromCookie } from "@/lib/utils";
import Link from "next/link";

interface Song {
    id: string;
    title: string;
    artistName: string;
    audioUrl: string;
    coverUrl: string | null;
    duration: number;
    genre?: { name: string } | null;
}

interface Genre {
    id: string;
    name: string;
}

export default function ExplorePage() {
    const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);
    const { playSong, setPlaylist } = usePlayer();

    useEffect(() => {
        Promise.all([
            fetch('/api/songs/trending?limit=6').then(res => res.json()),
            fetch('/api/genres').then(res => res.json())
        ]).then(([songs, genreData]) => {
            if (Array.isArray(songs)) setTrendingSongs(songs);
            if (Array.isArray(genreData)) setGenres(genreData);
        }).finally(() => setLoading(false));
    }, []);

    const handlePlay = (song: Song) => {
        playSong(song);
        setPlaylist(trendingSongs);
    };

    const genreColors = [
        'from-rose-500 to-pink-600',
        'from-amber-500 to-orange-600',
        'from-emerald-500 to-teal-600',
        'from-blue-500 to-indigo-600',
        'from-purple-500 to-violet-600',
        'from-cyan-500 to-sky-600',
    ];

    return (
        <div className="space-y-8 max-w-5xl mx-auto pt-4">
            <div className="flex items-center gap-4">
                <div className="size-16 rounded-xl bg-gradient-to-br from-[#00e5ff]/30 to-[#00e5ff]/5 flex items-center justify-center border border-[#00e5ff]/20">
                    <Compass size={28} className="text-[#00e5ff]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Explore</h1>
                    <p className="text-zinc-400">Discover new music</p>
                </div>
            </div>

            {/* Genres */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-zinc-400" />
                    <h2 className="text-lg font-semibold">Browse by Genre</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {genres.map((genre, idx) => (
                        <Link
                            key={genre.id}
                            href={`/genres?genre=${encodeURIComponent(genre.name)}`}
                            className={`bg-gradient-to-br ${genreColors[idx % genreColors.length]} rounded-xl p-4 h-24 flex items-end cursor-pointer hover:scale-105 transition-transform`}
                        >
                            <span className="font-bold text-white text-lg drop-shadow-lg">{genre.name}</span>
                        </Link>
                    ))}
                    {genres.length === 0 && !loading && (
                        <div className="col-span-full text-center py-8 text-zinc-500">
                            No genres available yet
                        </div>
                    )}
                </div>
            </section>

            {/* Trending */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-zinc-400" />
                    <h2 className="text-lg font-semibold">Trending Now</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {trendingSongs.map((song, idx) => (
                        <div
                            key={song.id}
                            className="bg-zinc-900/50 rounded-lg p-4 hover:bg-zinc-800/50 group transition-all flex gap-4 relative"
                        >
                            <div
                                onClick={() => handlePlay(song)}
                                className="size-16 bg-zinc-800 rounded-lg overflow-hidden relative flex-shrink-0 cursor-pointer"
                            >
                                {song.coverUrl ? (
                                    <img src={song.coverUrl} alt="Song Cover" className="size-full object-cover" />
                                ) : (
                                    <div className="size-full bg-gradient-to-br from-[#00e5ff]/20 to-transparent flex items-center justify-center">
                                        <Music size={24} className="text-[#00e5ff]/50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Play size={20} fill="white" className="text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer" onClick={() => handlePlay(song)}>
                                <span className="text-2xl font-bold text-zinc-600">#{idx + 1}</span>
                                <p className="font-medium text-white truncate">{song.title}</p>
                                <p className="text-zinc-400 text-sm truncate">{song.artistName}</p>
                            </div>
                            {getUserIdFromCookie() && (
                                <div className="absolute top-2 right-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowPlaylistMenu(showPlaylistMenu === song.id ? null : song.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded"
                                    >
                                        <Plus size={14} className="text-zinc-400" />
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
            </section>
        </div>
    );
}
