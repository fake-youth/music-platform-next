"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, ListMusic, Loader2, Check } from "lucide-react";
import { useToast } from "@/components/providers/ToastContext";
import { getUserIdFromCookie } from "@/lib/utils";

interface Playlist {
    id: string;
    title: string;
    name: string;
}

interface AddToPlaylistMenuProps {
    songId: string;
    onClose?: () => void;
}

export function AddToPlaylistMenu({ songId, onClose }: AddToPlaylistMenuProps) {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState<string | null>(null);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [creating, setCreating] = useState(false);
    const { showToast } = useToast();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const userId = getUserIdFromCookie();
        if (!userId) {
            showToast('Please login to add songs to playlists', 'error');
            onClose?.();
            return;
        }

        fetch(`/api/playlists?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPlaylists(data);
                }
            })
            .catch(err => {
                console.error('Failed to fetch playlists:', err);
                showToast('Failed to load playlists', 'error');
            })
            .finally(() => setLoading(false));
    }, [showToast, onClose]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose?.();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleAddToPlaylist = async (playlistId: string) => {
        setAdding(playlistId);
        try {
            const res = await fetch('/api/playlists/songs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playlistId, songId })
            });

            if (res.ok) {
                showToast('Song added to playlist', 'success');
                onClose?.();
            } else {
                const data = await res.json();
                if (data.error?.includes('already')) {
                    showToast('Song already in playlist', 'info');
                } else {
                    showToast('Failed to add song', 'error');
                }
            }
        } catch (error) {
            console.error('Failed to add song:', error);
            showToast('Failed to add song', 'error');
        } finally {
            setAdding(null);
        }
    };

    const handleCreateAndAdd = async () => {
        const userId = getUserIdFromCookie();
        if (!userId || !newPlaylistName.trim()) return;

        setCreating(true);
        try {
            // Create playlist
            const createRes = await fetch('/api/playlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newPlaylistName, userId })
            });

            if (!createRes.ok) {
                throw new Error('Failed to create playlist');
            }

            const newPlaylist = await createRes.json();

            // Add song to new playlist
            await handleAddToPlaylist(newPlaylist.id);
        } catch (error) {
            console.error('Failed to create playlist:', error);
            showToast('Failed to create playlist', 'error');
        } finally {
            setCreating(false);
            setNewPlaylistName('');
        }
    };

    return (
        <div
            ref={menuRef}
            className="absolute top-full left-0 mt-2 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 min-w-[240px] max-h-[400px] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-2">
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="animate-spin text-[#00e5ff]" size={20} />
                    </div>
                ) : (
                    <>
                        {/* Create New Playlist */}
                        <div className="p-2 border-b border-white/5 mb-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="New playlist..."
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
                                    className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white placeholder:text-zinc-500 focus:border-[#00e5ff] outline-none"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                    onClick={handleCreateAndAdd}
                                    disabled={creating || !newPlaylistName.trim()}
                                    className="px-2 py-1 bg-[#00e5ff] text-black rounded text-sm font-medium hover:bg-[#00e5ff]/80 disabled:opacity-50 flex items-center"
                                >
                                    {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Playlist List */}
                        {playlists.length === 0 ? (
                            <div className="py-4 text-center text-zinc-500 text-sm">
                                No playlists yet
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {playlists.map(playlist => (
                                    <button
                                        key={playlist.id}
                                        onClick={() => handleAddToPlaylist(playlist.id)}
                                        disabled={adding === playlist.id}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/5 rounded transition-colors disabled:opacity-50"
                                    >
                                        {adding === playlist.id ? (
                                            <Loader2 size={14} className="animate-spin text-[#00e5ff]" />
                                        ) : (
                                            <ListMusic size={14} className="text-zinc-400" />
                                        )}
                                        <span className="flex-1 truncate">{playlist.name || playlist.title}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

