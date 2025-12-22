"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Loader2, X } from "lucide-react";
import { useToast } from "@/components/providers/ToastContext";

interface Genre {
    id: string;
    name: string;
}

export default function GenresPage() {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGenreName, setNewGenreName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchGenres();
    }, []);

    const fetchGenres = async () => {
        try {
            const res = await fetch('/api/genres');
            const data = await res.json();
            if (Array.isArray(data)) setGenres(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newGenreName.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/genres', {
                method: 'POST',
                body: JSON.stringify({ name: newGenreName }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                const newGenre = await res.json();
                showToast("Genre created successfully", "success");
                setGenres([...genres, newGenre]);
                setNewGenreName('');
                setIsModalOpen(false);
            } else {
                const data = await res.json();
                showToast(data.error || "Failed to create genre", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to create genre", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this genre?')) return;
        try {
            const res = await fetch(`/api/genres?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast("Genre deleted successfully", "success");
                setGenres(genres.filter(g => g.id !== id));
            } else {
                showToast("Failed to delete genre", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to delete genre", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Genres</h1>
                    <p className="text-zinc-400">Manage music categories.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
                >
                    <Plus size={18} /> Add Genre
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-[#00e5ff]" size={32} />
                </div>
            ) : genres.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                    No genres found. Add one to get started.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {genres.map((genre) => (
                        <div key={genre.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-[#00e5ff]/50 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff] group-hover:bg-[#00e5ff] group-hover:text-black transition-colors">
                                    <Tag size={18} />
                                </div>
                                <span className="font-medium text-white">{genre.name}</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(genre.id)} className="p-2 hover:bg-white/10 rounded-md text-zinc-400 hover:text-red-400"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Add New Genre</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Genre name"
                            value={newGenreName}
                            onChange={(e) => setNewGenreName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">Cancel</button>
                            <button
                                onClick={handleCreate}
                                disabled={submitting || !newGenreName.trim()}
                                className="px-4 py-2 text-sm font-medium bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {submitting && <Loader2 size={14} className="animate-spin" />} Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
