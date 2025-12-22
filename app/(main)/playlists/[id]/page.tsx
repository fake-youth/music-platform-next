"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Trash2, ArrowLeft, Music, Loader2 } from "lucide-react";
import { usePlayer } from "@/components/providers/PlayerContext";
import { useToast } from "@/components/providers/ToastContext";
import { formatDuration } from "@/lib/utils";
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

interface Playlist {
    id: string;
    title: string;
    songs: { song: Song; addedAt: string }[];
}

export default function PlaylistDetailPage() {
    const params = useParams();
    const router = useRouter();
    const playlistId = params.id as string;
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const { playSong, setPlaylist: setPlayerPlaylist } = usePlayer();
    const { showToast } = useToast();

    useEffect(() => {
        if (!playlistId) return;

        // Fetch playlist details
        fetch(`/api/playlists/${playlistId}`)
            .then(res => res.json())
            .then(data => {
                if (data.id) {
                    setPlaylist(data);
                } else {
                    showToast('Playlist not found', 'error');
                    router.push('/profile');
                }
            })
            .catch(err => {
                console.error('Failed to fetch playlist:', err);
                showToast('Failed to load playlist', 'error');
            })
            .finally(() => setLoading(false));
    }, [playlistId, router, showToast]);

    const handlePlay = (song: Song) => {
        if (!playlist) return;
        const songs = playlist.songs.map(ps => ps.song);
        playSong(song);
        setPlayerPlaylist(songs);
    };

    const handlePlayAll = () => {
        if (!playlist || playlist.songs.length === 0) return;
        const songs = playlist.songs.map(ps => ps.song);
        playSong(songs[0]);
        setPlayerPlaylist(songs);
    };

    const handleRemoveSong = async (songId: string) => {
        if (!confirm('Remove this song from playlist?')) return;

        try {
            const res = await fetch('/api/playlists/songs', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playlistId, songId })
            });

            if (res.ok) {
                showToast('Song removed from playlist', 'success');
                // Refresh playlist
                const updatedPlaylist = { ...playlist! };
                updatedPlaylist.songs = updatedPlaylist.songs.filter(ps => ps.song.id !== songId);
                setPlaylist(updatedPlaylist);
            } else {
                showToast('Failed to remove song', 'error');
            }
        } catch (error) {
            console.error('Failed to remove song:', error);
            showToast('Failed to remove song', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#00e5ff]" size={32} />
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="text-center py-20">
                <p className="text-zinc-400">Playlist not found</p>
                <Link href="/profile" className="text-[#00e5ff] hover:underline mt-2 inline-block">Back to Profile</Link>
            </div>
        );
    }

    const songs = playlist.songs.map(ps => ps.song);

    return (
        <div className="space-y-6 max-w-5xl mx-auto pt-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{playlist.title}</h1>
                    <p className="text-zinc-400">{songs.length} songs</p>
                </div>
                {songs.length > 0 && (
                    <button
                        onClick={handlePlayAll}
                        className="bg-[#00e5ff] text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white hover:scale-105 transition-all"
                    >
                        <Play size={20} fill="black" />
                        Play All
                    </button>
                )}
            </div>

            {/* Songs List */}
            {songs.length === 0 ? (
                <div className="text-center py-20">
                    <Music size={48} className="mx-auto mb-4 text-zinc-700" />
                    <p className="text-zinc-500">This playlist is empty</p>
                    <p className="text-zinc-600 text-sm mt-1">Add songs to get started</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {playlist.songs.map((playlistSong, idx) => (
                        <div
                            key={playlistSong.song.id}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                        >
                            <span className="w-8 text-center text-zinc-500 text-sm">{idx + 1}</span>
                            <div
                                onClick={() => handlePlay(playlistSong.song)}
                                className="size-12 rounded bg-zinc-800 overflow-hidden flex-shrink-0 relative"
                            >
                                {playlistSong.song.coverUrl ? (
                                    <img src={playlistSong.song.coverUrl} alt="" className="size-full object-cover" />
                                ) : (
                                    <div className="size-full bg-[#00e5ff]/20 flex items-center justify-center">
                                        <Music size={20} className="text-[#00e5ff]/50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Play size={18} fill="white" className="text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0" onClick={() => handlePlay(playlistSong.song)}>
                                <p className="text-white font-medium truncate">{playlistSong.song.title}</p>
                                <p className="text-zinc-400 text-sm truncate">{playlistSong.song.artistName}</p>
                            </div>
                            <span className="text-zinc-500 text-sm hidden sm:block">{playlistSong.song.genre?.name || '-'}</span>
                            <span className="text-zinc-500 text-sm tabular-nums hidden md:block">{formatDuration(playlistSong.song.duration)}</span>
                            <button
                                onClick={() => handleRemoveSong(playlistSong.song.id)}
                                className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

