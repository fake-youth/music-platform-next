"use client";

import { useState, useEffect } from "react";
import { Heart, Play, Loader2 } from "lucide-react";
import { usePlayer } from "@/components/providers/PlayerContext";
import { getUserIdFromCookie } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Song {
    id: string;
    title: string;
    artistName: string;
    audioUrl: string;
    coverUrl: string | null;
    duration: number;
}

export default function LikesPage() {
    const [likedSongs, setLikedSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const { playSong, setPlaylist } = usePlayer();
    const router = useRouter();

    useEffect(() => {
        const userId = getUserIdFromCookie();
        if (!userId) {
            router.push('/login');
            return;
        }

        fetch(`/api/likes?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLikedSongs(data);
                }
            })
            .catch(err => {
                console.error('Failed to fetch liked songs:', err);
            })
            .finally(() => setLoading(false));
    }, [router]);

    const handlePlay = (song: Song) => {
        playSong(song);
        setPlaylist(likedSongs);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pt-4">
            {/* Hero */}
            <div className="flex items-end gap-6 pb-6 border-b border-white/5">
                <div className="size-40 rounded-lg bg-gradient-to-br from-[#00e5ff]/30 to-[#00e5ff]/5 flex items-center justify-center border border-[#00e5ff]/20 shadow-2xl">
                    <Heart size={64} className="text-[#00e5ff]" fill="#00e5ff" />
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Playlist</p>
                    <h1 className="text-4xl font-bold mb-2">Liked Songs</h1>
                    <p className="text-zinc-400">{likedSongs.length} songs</p>
                </div>
            </div>

            {/* Songs List */}
            {loading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-[#00e5ff]" size={32} />
                </div>
            )}

            {!loading && likedSongs.length === 0 && (
                <div className="text-center py-20">
                    <Heart size={48} className="text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">Songs you like will appear here</p>
                    <p className="text-zinc-600 text-sm mt-1">Start liking songs to build your collection</p>
                </div>
            )}

            {!loading && likedSongs.length > 0 && (
                <div className="space-y-1">
                    {likedSongs.map((song, idx) => (
                        <div
                            key={song.id}
                            onClick={() => handlePlay(song)}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 cursor-pointer group"
                        >
                            <span className="w-8 text-center text-zinc-500 text-sm">{idx + 1}</span>
                            <div className="size-12 rounded bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                                {song.coverUrl ? (
                                    <img src={song.coverUrl} alt="" className="size-full object-cover" />
                                ) : (
                                    <div className="size-full bg-[#00e5ff]/20" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Play size={20} fill="white" className="text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{song.title}</p>
                                <p className="text-zinc-400 text-sm truncate">{song.artistName}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
