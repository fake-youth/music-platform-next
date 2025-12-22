"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, UploadCloud, Loader2, Music } from "lucide-react";
import { useToast } from "@/components/providers/ToastContext";

interface Album {
    id: string;
    title: string;
    artistId: string;
    coverUrl: string | null;
    artist?: {
        name: string;
    };
    _count?: {
        songs: number;
    };
}

interface Artist {
    id: string;
    name: string;
}

export default function AlbumsPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
    const [form, setForm] = useState({ title: '', artistId: '', coverUrl: '' });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchAlbums();
        fetchArtists();
    }, []);

    const fetchAlbums = async () => {
        try {
            const res = await fetch('/api/albums');
            const data = await res.json();
            if (data.albums) setAlbums(data.albums);
        } catch (e) {
            console.error(e);
            showToast("Failed to fetch albums", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchArtists = async () => {
        try {
            const res = await fetch('/api/artists');
            const data = await res.json();
            if (data.artists) setArtists(data.artists);
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok && data.url) {
                setForm(prev => ({ ...prev, coverUrl: data.url }));
                showToast("Cover uploaded successfully", "success");
            } else {
                showToast("Upload failed", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Upload failed", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.artistId) {
            showToast("Title and Artist are required", "error");
            return;
        }

        setSubmitting(true);
        try {
            const url = editingAlbum ? `/api/albums/${editingAlbum.id}` : '/api/albums';
            const method = editingAlbum ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                body: JSON.stringify(form),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                showToast(`Album ${editingAlbum ? 'updated' : 'created'} successfully`, "success");
                setIsModalOpen(false);
                setEditingAlbum(null);
                setForm({ title: '', artistId: '', coverUrl: '' });
                fetchAlbums();
            } else {
                showToast("Failed to save album", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to save album", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, count: { songs: number } | undefined) => {
        if (count && count.songs > 0) {
            showToast("Cannot delete album with existing songs", "error");
            return;
        }
        if (!confirm('Are you sure you want to delete this album?')) return;

        try {
            const res = await fetch(`/api/albums/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast("Album deleted successfully", "success");
                setAlbums(albums.filter(a => a.id !== id));
            } else {
                const data = await res.json();
                showToast(data.error || "Failed to delete album", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to delete album", "error");
        }
    };

    const openModal = (album?: Album) => {
        if (album) {
            setEditingAlbum(album);
            setForm({
                title: album.title,
                artistId: album.artistId,
                coverUrl: album.coverUrl || ''
            });
        } else {
            setEditingAlbum(null);
            setForm({ title: '', artistId: '', coverUrl: '' });
        }
        setIsModalOpen(true);
    };

    const filteredAlbums = albums.filter(album =>
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Albums</h1>
                    <p className="text-zinc-400">Manage albums collection.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
                >
                    <Plus size={18} /> Add New Album
                </button>
            </div>

            {/* Filter */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search albums..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-[#00e5ff] outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900/50 rounded-xl border border-white/5 overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-zinc-500">Loading albums...</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-zinc-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Album</th>
                                <th className="px-6 py-4">Artist</th>
                                <th className="px-6 py-4">Songs</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredAlbums.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No albums found.</td></tr>
                            ) : filteredAlbums.map((album) => (
                                <tr key={album.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded bg-zinc-800 flex-shrink-0 overflow-hidden relative">
                                                {album.coverUrl ? (
                                                    <img src={album.coverUrl} className="size-full object-cover" alt="" />
                                                ) : (
                                                    <div className="size-full flex items-center justify-center">
                                                        <Music size={16} className="text-zinc-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-medium text-white">{album.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        {album.artist?.name || 'Unknown Artist'}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        {album._count?.songs || 0} Songs
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => openModal(album)} className="text-zinc-400 hover:text-white p-1 hover:bg-white/10 rounded"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(album.id, album._count)} className="text-zinc-400 hover:text-red-400 p-1 hover:bg-white/10 rounded"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
                        <h2 className="text-xl font-bold">{editingAlbum ? 'Edit Album' : 'New Album'}</h2>
                        <div className="space-y-4">
                            {/* Cover */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase">Cover Art</label>
                                <div className="border border-dashed border-zinc-700 rounded-lg p-4 flex flex-col items-center justify-center bg-black/20 relative h-32">
                                    {form.coverUrl ? (
                                        <img src={form.coverUrl} className="h-full object-contain" alt="" />
                                    ) : (
                                        <UploadCloud className="text-zinc-500" />
                                    )}
                                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase">Title</label>
                                <input
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase">Artist</label>
                                <select
                                    value={form.artistId}
                                    onChange={e => setForm({ ...form, artistId: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
                                >
                                    <option value="">Select Artist</option>
                                    {artists.map(artist => (
                                        <option key={artist.id} value={artist.id}>{artist.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">Cancel</button>
                            <button onClick={handleSubmit} disabled={submitting || uploading} className="px-4 py-2 text-sm font-medium bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black rounded-lg flex items-center gap-2">
                                {submitting && <Loader2 size={14} className="animate-spin" />} Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
