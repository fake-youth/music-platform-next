"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { useToast } from "@/components/providers/ToastContext";

interface Song {
    id: string;
    title: string;
    artistName: string;
    duration: number;
    genre: { name: string; id: string } | null;
    genreId?: string;
    coverUrl: string | null;
}

interface Genre {
    id: string;
    name: string;
}

export default function SongsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSong, setNewSong] = useState({ title: '', artist: '', genreId: '', duration: '200', audioUrl: '', coverUrl: '' });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingSong, setEditingSong] = useState<Song | null>(null);
    const [editForm, setEditForm] = useState({ title: '', artist: '', genreId: '' });
    const [genres, setGenres] = useState<Genre[]>([]);
    const { showToast } = useToast();

    useEffect(() => {
        fetchSongs();
        fetchGenres();
    }, []);

    const fetchGenres = async () => {
        try {
            const res = await fetch('/api/genres');
            const data = await res.json();
            if (Array.isArray(data)) setGenres(data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchSongs = async () => {
        try {
            const res = await fetch('/api/songs');
            const data = await res.json();
            // Fallback for demo if DB is empty or fails
            if (Array.isArray(data)) setSongs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'image') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side validation
        const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
        const maxSize = type === 'audio' ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;

        if (file.size > maxSize) {
            const maxMB = maxSize / 1024 / 1024;
            showToast(`File too large. Maximum size: ${maxMB}MB`, "error");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.url) {
                if (type === 'audio') {
                    // Calculate duration
                    const audio = new Audio(data.url);
                    audio.onloadedmetadata = () => {
                        setNewSong(prev => ({
                            ...prev,
                            audioUrl: data.url,
                            duration: Math.round(audio.duration).toString()
                        }));
                        showToast("Audio uploaded & duration set", "success");
                    };
                    // Fallback if metadata fails
                    audio.onerror = () => {
                        setNewSong(prev => ({ ...prev, audioUrl: data.url }));
                        showToast("Audio uploaded", "success");
                    }
                } else {
                    setNewSong(prev => ({ ...prev, coverUrl: data.url }));
                    showToast("Cover image uploaded successfully", "success");
                }
            } else {
                showToast(data.error || "Upload failed", "error");
            }
        } catch (err) {
            console.error("Upload failed", err);
            showToast("Upload failed", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleCreate = async () => {
        if (!newSong.audioUrl) {
            showToast("Please upload an audio file first", "error");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/songs', {
                method: 'POST',
                body: JSON.stringify(newSong),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                showToast("Song created successfully", "success");
                setIsModalOpen(false);
                setNewSong({ title: '', artist: '', genreId: '', duration: '200', audioUrl: '', coverUrl: '' });
                fetchSongs();
            } else {
                showToast("Failed to create song", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to create song", "error");
        } finally {
            setSubmitting(false);
        }
    }

    const deleteSong = async (id: string) => {
        if (!confirm('Are you sure you want to delete this song?')) return;
        try {
            const res = await fetch(`/api/songs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast("Song deleted successfully", "success");
                setSongs(songs.filter(s => s.id !== id));
            } else {
                showToast("Failed to delete song", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to delete song", "error");
        }
    };

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artistName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openEditModal = (song: Song) => {
        setEditingSong(song);
        setEditForm({ title: song.title, artist: song.artistName, genreId: song.genreId || song.genre?.id || '' });
    };

    const handleEdit = async () => {
        if (!editingSong) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/songs/${editingSong.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    title: editForm.title,
                    artist: editForm.artist,
                    genreId: editForm.genreId || undefined
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                showToast("Song updated successfully", "success");
                fetchSongs(); // Refresh to get updated genre info
                setEditingSong(null);
            } else {
                showToast("Failed to update song", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to update song", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Songs Library</h1>
                    <p className="text-zinc-400">Manage all tracks and metadata.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
                >
                    <Plus size={18} /> Add New Song
                </button>
            </div>

            {/* Filters/Search */}
            <div className="flex gap-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search songs by title, artist..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#00e5ff] transition-colors"
                    />
                </div>
            </div>

            {/* Songs Table - Responsive */}
            <div className="bg-zinc-900/50 rounded-xl border border-white/5 overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-zinc-500">Loading songs...</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-zinc-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Artist</th>
                                <th className="px-6 py-4">Genre</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredSongs.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No songs found.</td></tr>
                            ) : filteredSongs.map((song) => (
                                <tr key={song.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded bg-zinc-800 flex-shrink-0 overflow-hidden">
                                                {song.coverUrl && <img src={song.coverUrl} className="size-full object-cover" alt="Album Cover" />}
                                            </div>
                                            <span className="font-medium text-white">{song.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-300">{song.artistName}</td>
                                    <td className="px-6 py-4 text-zinc-400">{song.genre?.name || '-'}</td>
                                    <td className="px-6 py-4 text-zinc-500 tabular-nums">{formatDuration(song.duration)}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => openEditModal(song)} className="text-zinc-400 hover:text-white p-1 hover:bg-white/10 rounded"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteSong(song.id)} className="text-zinc-400 hover:text-red-400 p-1 hover:bg-white/10 rounded"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
                        <h2 className="text-xl font-bold">Upload New Song</h2>

                        <div className="space-y-4">
                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center text-zinc-400 bg-black/20 relative">
                                {uploading ? <Loader2 className="animate-spin text-[#00e5ff]" /> : <UploadCloud size={32} className="mb-2" />}
                                <span className="text-sm font-medium">
                                    {newSong.audioUrl ? "Audio Uploaded!" : "Click to upload audio file"}
                                </span>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => handleFileUpload(e, 'audio')}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>

                            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-4 flex flex-col items-center justify-center text-zinc-400 bg-black/20 relative">
                                <span className="text-xs font-medium">
                                    {newSong.coverUrl ? "Cover Image Uploaded!" : "Upload Cover Art (Optional)"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'image')}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase">Title</label>
                                    <input
                                        value={newSong.title}
                                        onChange={e => setNewSong({ ...newSong, title: e.target.value })}
                                        type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase">Artist</label>
                                    <input
                                        value={newSong.artist}
                                        onChange={e => setNewSong({ ...newSong, artist: e.target.value })}
                                        type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase">Genre</label>
                                <select
                                    value={newSong.genreId}
                                    onChange={e => setNewSong({ ...newSong, genreId: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
                                >
                                    <option value="">Select Genre</option>
                                    {genres.map(genre => (
                                        <option key={genre.id} value={genre.id}>{genre.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">Cancel</button>
                            <button onClick={handleCreate} disabled={submitting || !newSong.audioUrl} className="px-4 py-2 text-sm font-medium bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black rounded-lg flex items-center gap-2">
                                {submitting && <Loader2 size={14} className="animate-spin" />} Save Song
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingSong && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-md p-6 space-y-6 shadow-2xl">
                        <h2 className="text-xl font-bold">Edit Song</h2>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase">Title</label>
                                <input
                                    value={editForm.title}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase">Artist</label>
                                <input
                                    value={editForm.artist}
                                    onChange={e => setEditForm({ ...editForm, artist: e.target.value })}
                                    type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase">Genre</label>
                                <select
                                    value={editForm.genreId}
                                    onChange={e => setEditForm({ ...editForm, genreId: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
                                >
                                    <option value="">Select Genre</option>
                                    {genres.map(genre => (
                                        <option key={genre.id} value={genre.id}>{genre.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <button onClick={() => setEditingSong(null)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">Cancel</button>
                            <button onClick={handleEdit} disabled={submitting} className="px-4 py-2 text-sm font-medium bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black rounded-lg flex items-center gap-2">
                                {submitting && <Loader2 size={14} className="animate-spin" />} Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
