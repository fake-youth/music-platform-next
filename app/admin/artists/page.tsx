"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastContext";

interface Artist {
    id: string;
    name: string;
    bio: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
    _count?: {
        songs: number;
        albums: number;
    };
}

export default function ArtistsPage() {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
    const [form, setForm] = useState({ name: '', bio: '', avatarUrl: '', coverUrl: '' });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchArtists();
    }, []);

    const fetchArtists = async () => {
        try {
            const res = await fetch('/api/artists');
            const data = await res.json();
            if (data.artists) setArtists(data.artists);
        } catch (e) {
            console.error(e);
            showToast("Failed to fetch artists", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.url) {
                if (type === 'avatar') {
                    setForm(prev => ({ ...prev, avatarUrl: data.url }));
                } else {
                    setForm(prev => ({ ...prev, coverUrl: data.url }));
                }
                showToast("Image uploaded successfully", "success");
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
        if (!form.name.trim()) {
            showToast("Name is required", "error");
            return;
        }

        setSubmitting(true);
        try {
            const url = editingArtist ? `/api/artists/${editingArtist.id}` : '/api/artists';
            const method = editingArtist ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                body: JSON.stringify(form),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                showToast(`Artist ${editingArtist ? 'updated' : 'created'} successfully`, "success");
                setIsModalOpen(false);
                setEditingArtist(null);
                setForm({ name: '', bio: '', avatarUrl: '', coverUrl: '' });
                fetchArtists();
            } else {
                showToast("Failed to save artist", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to save artist", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, count: { songs: number, albums: number } | undefined) => {
        if (count && (count.songs > 0 || count.albums > 0)) {
            showToast("Cannot delete artist with existing songs or albums", "error");
            return;
        }
        if (!confirm('Are you sure you want to delete this artist?')) return;

        try {
            const res = await fetch(`/api/artists/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast("Artist deleted successfully", "success");
                setArtists(artists.filter(a => a.id !== id));
            } else {
                const data = await res.json();
                showToast(data.error || "Failed to delete artist", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to delete artist", "error");
        }
    };

    const openModal = (artist?: Artist) => {
        if (artist) {
            setEditingArtist(artist);
            setForm({
                name: artist.name,
                bio: artist.bio || '',
                avatarUrl: artist.avatarUrl || '',
                coverUrl: artist.coverUrl || ''
            });
        } else {
            setEditingArtist(null);
            setForm({ name: '', bio: '', avatarUrl: '', coverUrl: '' });
        }
        setIsModalOpen(true);
    };

    const filteredArtists = artists.filter(artist =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Artists</h1>
                    <p className="text-zinc-400">Manage artist profiles.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
                >
                    <Plus size={18} /> Add New Artist
                </button>
            </div>

            {/* Filter */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search artists..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-[#00e5ff] outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900/50 rounded-xl border border-white/5 overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-zinc-500">Loading artists...</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-zinc-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Artist</th>
                                <th className="px-6 py-4">Bio</th>
                                <th className="px-6 py-4">Stats</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredArtists.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No artists found.</td></tr>
                            ) : filteredArtists.map((artist) => (
                                <tr key={artist.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden">
                                                {artist.avatarUrl && <img src={artist.avatarUrl} className="size-full object-cover" alt="" />}
                                            </div>
                                            <span className="font-medium text-white">{artist.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400 max-w-xs truncate">{artist.bio || '-'}</td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        {artist._count?.albums || 0} Albums, {artist._count?.songs || 0} Songs
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => openModal(artist)} className="text-zinc-400 hover:text-white p-1 hover:bg-white/10 rounded"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(artist.id, artist._count)} className="text-zinc-400 hover:text-red-400 p-1 hover:bg-white/10 rounded"><Trash2 size={16} /></button>
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
                        <h2 className="text-xl font-bold">{editingArtist ? 'Edit Artist' : 'New Artist'}</h2>
                        <div className="space-y-4">
                            {/* Avatars */}
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase">Avatar</label>
                                    <div className="border border-dashed border-zinc-700 rounded-lg p-4 flex flex-col items-center justify-center bg-black/20 relative h-32">
                                        {form.avatarUrl ? (
                                            <img src={form.avatarUrl} className="h-full object-contain" alt="" />
                                        ) : (
                                            <UploadCloud className="text-zinc-500" />
                                        )}
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase">Cover</label>
                                    <div className="border border-dashed border-zinc-700 rounded-lg p-4 flex flex-col items-center justify-center bg-black/20 relative h-32">
                                        {form.coverUrl ? (
                                            <img src={form.coverUrl} className="h-full object-contain" alt="" />
                                        ) : (
                                            <UploadCloud className="text-zinc-500" />
                                        )}
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase">Name</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase">Bio</label>
                                <textarea
                                    value={form.bio}
                                    onChange={e => setForm({ ...form, bio: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none min-h-[100px]"
                                />
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
