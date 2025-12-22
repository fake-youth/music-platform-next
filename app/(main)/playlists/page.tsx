"use client";

import { useState, useEffect } from "react";
import { ListMusic, Play, Plus, Globe, User as UserIcon, Music, Loader2 } from "lucide-react";
import { usePlayer } from "@/components/providers/PlayerContext";
import { useToast } from "@/components/providers/ToastContext";
import { getUserIdFromCookie } from "@/lib/utils";
import Link from "next/link";

interface Song {
    id: string;
    title: string;
    artistName: string;
    audioUrl: string;
    coverUrl: string | null;
    duration: number;
}

interface Playlist {
    id: string;
    title: string;
    isGlobal: boolean;
    creator?: { profile?: { fullName: string } } | null;
    songs: { song: Song }[];
}

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [creating, setCreating] = useState(false);
    const { playSong, setPlaylist: setPlayerPlaylist } = usePlayer();
    const { showToast } = useToast();

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const userId = getUserIdFromCookie();
            // Fetch global playlists and user's playlists
            const [globalRes, userRes] = await Promise.all([
                fetch('/api/playlists?global=true'),
                userId ? fetch(`/api/playlists?userId=${userId}`) : Promise.resolve(null)
            ]);

            const globalData = await globalRes.json();
            const userData = userRes ? await userRes.json() : [];

            const allPlaylists: Playlist[] = [];
            if (Array.isArray(globalData)) allPlaylists.push(...globalData);
            if (Array.isArray(userData)) {
                // Filter out duplicates (in case a user playlist is also global)
                userData.forEach((p: Playlist) => {
                    if (!allPlaylists.find(gp => gp.id === p.id)) {
                        allPlaylists.push(p);
                    }
                });
            }

            setPlaylists(allPlaylists);
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;

        const userId = getUserIdFromCookie();
        if (!userId) {
            showToast('Please login to create playlists', 'info');
            return;
        }

        setCreating(true);
        try {
            const res = await fetch('/api/playlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newPlaylistName, userId })
            });

            if (res.ok) {
                const newPlaylist = await res.json();
                setPlaylists([newPlaylist, ...playlists]);
                setNewPlaylistName('');
                showToast('Playlist created successfully', 'success');
            } else {
                showToast('Failed to create playlist', 'error');
            }
        } catch (error) {
            console.error('Failed to create playlist:', error);
            showToast('Failed to create playlist', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handlePlayPlaylist = (playlist: Playlist) => {
        if (playlist.songs.length === 0) {
            showToast('This playlist is empty', 'info');
            return;
        }
        const songs = playlist.songs.map(ps => ps.song);
        playSong(songs[0]);
        setPlayerPlaylist(songs);
    };

    const globalPlaylists = playlists.filter(p => p.isGlobal);
    const userPlaylists = playlists.filter(p => !p.isGlobal);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#00e5ff]" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-6xl mx-auto pt-4">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="size-16 rounded-xl bg-gradient-to-br from-[#00e5ff]/30 to-[#00e5ff]/5 flex items-center justify-center border border-[#00e5ff]/20">
                    <ListMusic size={28} className="text-[#00e5ff]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Playlists</h1>
                    <p className="text-zinc-400">Discover and create playlists</p>
                </div>
            </div>

            {/* Create New Playlist */}
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Plus size={18} className="text-[#00e5ff]" />
                    Create New Playlist
                </h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter playlist name..."
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#00e5ff] outline-none"
                    />
                    <button
                        onClick={handleCreatePlaylist}
                        disabled={creating || !newPlaylistName.trim()}
                        className="px-4 py-2 bg-[#00e5ff] text-black rounded-lg font-medium hover:bg-[#00e5ff]/80 disabled:opacity-50 flex items-center gap-2"
                    >
                        {creating && <Loader2 size={14} className="animate-spin" />}
                        Create
                    </button>
                </div>
            </div>

            {/* Global Playlists */}
            {globalPlaylists.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-[#00e5ff]" />
                        Featured Playlists
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {globalPlaylists.map((playlist) => (
                            <PlaylistCard
                                key={playlist.id}
                                playlist={playlist}
                                onPlay={() => handlePlayPlaylist(playlist)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* User Playlists */}
            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <UserIcon size={20} className="text-rose-400" />
                    Your Playlists
                </h2>
                {userPlaylists.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-white/5">
                        <Music size={48} className="mx-auto mb-4 text-zinc-700" />
                        <p className="text-zinc-500">No playlists yet</p>
                        <p className="text-zinc-600 text-sm mt-1">Create one above to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userPlaylists.map((playlist) => (
                            <PlaylistCard
                                key={playlist.id}
                                playlist={playlist}
                                onPlay={() => handlePlayPlaylist(playlist)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function PlaylistCard({ playlist, onPlay }: { playlist: Playlist; onPlay: () => void }) {
    const songCount = playlist.songs?.length || 0;
    const firstCover = playlist.songs?.[0]?.song?.coverUrl;

    return (
        <div className="bg-zinc-900/50 rounded-xl border border-white/5 hover:border-[#00e5ff]/30 transition-all group overflow-hidden">
            <Link href={`/playlists/${playlist.id}`} className="block">
                <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                    {firstCover ? (
                        <img src={firstCover} alt="" className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="size-full bg-gradient-to-br from-[#00e5ff]/20 to-[#7b2cbf]/20 flex items-center justify-center">
                            <ListMusic size={40} className="text-white/30" />
                        </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Play button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onPlay();
                        }}
                        className="absolute bottom-4 right-4 size-12 rounded-full bg-[#00e5ff] flex items-center justify-center shadow-lg shadow-[#00e5ff]/30 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all hover:scale-110"
                    >
                        <Play size={20} fill="black" className="ml-0.5" />
                    </button>

                    {/* Info */}
                    <div className="absolute bottom-4 left-4">
                        <h3 className="font-bold text-white text-lg">{playlist.title}</h3>
                        <p className="text-zinc-400 text-sm">{songCount} songs</p>
                    </div>

                    {/* Global badge */}
                    {playlist.isGlobal && (
                        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase bg-[#00e5ff]/20 backdrop-blur-xl px-2 py-1 rounded-full text-[#00e5ff] border border-[#00e5ff]/30">
                            Featured
                        </span>
                    )}
                </div>
            </Link>
        </div>
    );
}
