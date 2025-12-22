"use client";

import { useState, useEffect } from "react";
import { Library as LibraryIcon, Play, Clock, Music } from "lucide-react";
import { usePlayer } from "@/components/providers/PlayerContext";
import { getUserIdFromCookie } from "@/lib/utils";

interface Song {
    id: string;
    title: string;
    artistName: string;
    audioUrl: string;
    coverUrl: string | null;
    duration: number;
}

export default function LibraryPage() {
    const [recentSongs, setRecentSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const { playSong, setPlaylist } = usePlayer();

    useEffect(() => {
        const userId = getUserIdFromCookie();
        if (userId) {
            // Fetch recently played songs
            fetch(`/api/play-history?userId=${userId}&limit=10`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        setRecentSongs(data);
                        setLoading(false);
                    } else {
                        // Fallback to all songs if no history
                        return fetch('/api/songs');
                    }
                })
                .then(res => {
                    if (res) {
                        return res.json();
                    }
                })
                .then(data => {
                    if (Array.isArray(data)) {
                        setRecentSongs(data.slice(0, 10));
                    }
                })
                .finally(() => setLoading(false));
        } else {
            // Guest: show all songs
            fetch('/api/songs')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setRecentSongs(data.slice(0, 10));
                })
                .finally(() => setLoading(false));
        }
    }, []);

    const handlePlay = (song: Song) => {
        playSong(song);
        setPlaylist(recentSongs);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pt-4">
            <div className="flex items-center gap-4">
                <div className="size-16 rounded-xl bg-gradient-to-br from-[#00e5ff]/30 to-[#00e5ff]/5 flex items-center justify-center border border-[#00e5ff]/20">
                    <LibraryIcon size={28} className="text-[#00e5ff]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Your Library</h1>
                    <p className="text-zinc-400">Your music collection</p>
                </div>
            </div>

            {/* Recently Played */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Clock size={18} className="text-zinc-400" />
                    <h2 className="text-lg font-semibold">Recently Played</h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-zinc-900/50 rounded-lg p-4 animate-pulse">
                                <div className="aspect-square bg-zinc-800 rounded-lg mb-3" />
                                <div className="h-4 bg-zinc-800 rounded mb-2" />
                                <div className="h-3 bg-zinc-800/50 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : recentSongs.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        <Music size={48} className="mx-auto mb-4 text-zinc-700" />
                        <p>No songs in your library yet</p>
                        <p className="text-sm text-zinc-600 mt-1">Start playing some music!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {recentSongs.map((song) => (
                            <div
                                key={song.id}
                                onClick={() => handlePlay(song)}
                                className="bg-zinc-900/50 rounded-lg p-4 hover:bg-zinc-800/50 cursor-pointer group transition-all"
                            >
                                <div className="aspect-square bg-zinc-800 rounded-lg mb-3 overflow-hidden relative">
                                    {song.coverUrl ? (
                                        <img src={song.coverUrl} alt="" className="size-full object-cover" />
                                    ) : (
                                        <div className="size-full bg-gradient-to-br from-[#00e5ff]/20 to-transparent flex items-center justify-center">
                                            <Music size={32} className="text-[#00e5ff]/50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <div className="size-12 rounded-full bg-[#00e5ff] flex items-center justify-center shadow-lg shadow-[#00e5ff]/30">
                                            <Play size={20} fill="black" className="text-black ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                                <p className="font-medium text-white truncate">{song.title}</p>
                                <p className="text-zinc-400 text-sm truncate">{song.artistName}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
