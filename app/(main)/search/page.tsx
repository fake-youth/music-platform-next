"use client";

import { useState, useEffect } from "react";
import { Search as SearchIcon, Play, Loader2, Plus, Filter, SlidersHorizontal, X, Clock, ChevronDown } from "lucide-react";
import { usePlayer } from "@/components/providers/PlayerContext";
import { AddToPlaylistMenu } from "@/components/playlist/AddToPlaylistMenu";
import { getUserIdFromCookie } from "@/lib/utils";

interface Song {
    id: string;
    title: string;
    artistName: string;
    audioUrl: string;
    coverUrl: string | null;
    duration: number;
    genre: { id: string; name: string } | null;
}

interface Genre {
    id: string;
    name: string;
}

type SortOption = 'relevance' | 'title' | 'artist' | 'duration' | 'newest';

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'artist', label: 'Artist A-Z' },
    { value: 'duration', label: 'Duration' },
    { value: 'newest', label: 'Newest First' },
];

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [songs, setSongs] = useState<Song[]>([]);
    const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const { playSong, setPlaylist } = usePlayer();

    // Filter states
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<string>('');
    const [sortBy, setSortBy] = useState<SortOption>('relevance');
    const [minDuration, setMinDuration] = useState<number>(0);
    const [maxDuration, setMaxDuration] = useState<number>(600); // 10 minutes

    // Fetch genres on mount
    useEffect(() => {
        fetchGenres();
    }, []);

    // Apply filters when songs or filter options change
    useEffect(() => {
        applyFilters();
    }, [songs, selectedGenre, sortBy, minDuration, maxDuration]);

    async function fetchGenres() {
        try {
            const res = await fetch('/api/genres');
            if (res.ok) {
                const data = await res.json();
                setGenres(Array.isArray(data) ? data : data.genres || []);
            }
        } catch (error) {
            console.error('Failed to fetch genres:', error);
        }
    }

    function applyFilters() {
        let result = [...songs];

        // Filter by genre
        if (selectedGenre) {
            result = result.filter(song => song.genre?.id === selectedGenre);
        }

        // Filter by duration
        result = result.filter(song =>
            song.duration >= minDuration && song.duration <= maxDuration
        );

        // Sort
        switch (sortBy) {
            case 'title':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'artist':
                result.sort((a, b) => a.artistName.localeCompare(b.artistName));
                break;
            case 'duration':
                result.sort((a, b) => a.duration - b.duration);
                break;
            case 'newest':
                // Keep original order (assumed to be newest first from API)
                break;
            case 'relevance':
            default:
                // Keep original order
                break;
        }

        setFilteredSongs(result);
    }

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);

        try {
            const res = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSongs(Array.isArray(data) ? data : []);
            } else {
                // Fallback to client-side search
                const allRes = await fetch('/api/songs');
                const allSongs = await allRes.json();
                const filtered = allSongs.filter((s: Song) =>
                    s.title.toLowerCase().includes(query.toLowerCase()) ||
                    s.artistName.toLowerCase().includes(query.toLowerCase())
                );
                setSongs(filtered);
            }
        } catch (e) {
            console.error(e);
            setSongs([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePlay = (song: Song) => {
        playSong(song);
        setPlaylist(filteredSongs);
    };

    const clearFilters = () => {
        setSelectedGenre('');
        setSortBy('relevance');
        setMinDuration(0);
        setMaxDuration(600);
    };

    const hasActiveFilters = selectedGenre || sortBy !== 'relevance' || minDuration > 0 || maxDuration < 600;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pt-4 pb-32">
            <h1 className="text-3xl font-bold">Search</h1>

            {/* Search Bar */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input
                        type="text"
                        placeholder="What do you want to listen to?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full bg-white/10 border border-white/10 rounded-full py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00e5ff] transition-colors placeholder:text-zinc-500"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-5 py-3 rounded-full flex items-center gap-2 transition-all ${showFilters || hasActiveFilters
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                >
                    <SlidersHorizontal size={18} />
                    <span className="hidden sm:inline">Filters</span>
                    {hasActiveFilters && (
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                    )}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Filter size={18} />
                            Filters
                        </h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            >
                                <X size={14} />
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Genre Filter */}
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Genre</label>
                            <div className="relative">
                                <select
                                    value={selectedGenre}
                                    onChange={(e) => setSelectedGenre(e.target.value)}
                                    className="w-full bg-white/10 border border-white/10 rounded-lg py-2.5 px-4 text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500"
                                >
                                    <option value="">All Genres</option>
                                    {genres.map((genre) => (
                                        <option key={genre.id} value={genre.id} className="bg-gray-800">
                                            {genre.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Sort by</label>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="w-full bg-white/10 border border-white/10 rounded-lg py-2.5 px-4 text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value} className="bg-gray-800">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* Duration Range */}
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400 flex items-center gap-1">
                                <Clock size={14} />
                                Duration: {formatDuration(minDuration)} - {formatDuration(maxDuration)}
                            </label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="range"
                                    min="0"
                                    max="600"
                                    step="30"
                                    value={minDuration}
                                    onChange={(e) => setMinDuration(Math.min(Number(e.target.value), maxDuration - 30))}
                                    className="flex-1 accent-purple-500"
                                />
                                <span className="text-zinc-500">-</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="600"
                                    step="30"
                                    value={maxDuration}
                                    onChange={(e) => setMaxDuration(Math.max(Number(e.target.value), minDuration + 30))}
                                    className="flex-1 accent-purple-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {loading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-[#00e5ff]" size={32} />
                </div>
            )}

            {!loading && searched && filteredSongs.length === 0 && songs.length > 0 && (
                <div className="text-center py-12 text-zinc-500">
                    No results match your filters. Try adjusting them.
                </div>
            )}

            {!loading && searched && songs.length === 0 && (
                <div className="text-center py-12 text-zinc-500">
                    No results found for &quot;{query}&quot;
                </div>
            )}

            {!loading && filteredSongs.length > 0 && (
                <div className="space-y-2">
                    <p className="text-zinc-400 text-sm">
                        {filteredSongs.length} result{filteredSongs.length > 1 ? 's' : ''}
                        {songs.length !== filteredSongs.length && ` (filtered from ${songs.length})`}
                    </p>
                    <div className="space-y-1">
                        {filteredSongs.map((song) => (
                            <div
                                key={song.id}
                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 group transition-colors"
                            >
                                <div
                                    onClick={() => handlePlay(song)}
                                    className="size-12 rounded bg-zinc-800 overflow-hidden flex-shrink-0 relative cursor-pointer"
                                >
                                    {song.coverUrl ? (
                                        <img src={song.coverUrl} alt="" className="size-full object-cover" />
                                    ) : (
                                        <div className="size-full bg-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff] text-xs font-bold">♫</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Play size={20} fill="white" className="text-white" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePlay(song)}>
                                    <p className="text-white font-medium truncate">{song.title}</p>
                                    <p className="text-zinc-400 text-sm truncate">{song.artistName}</p>
                                </div>
                                <span className="text-zinc-500 text-sm hidden md:block">{formatDuration(song.duration)}</span>
                                <span className="text-zinc-500 text-sm hidden sm:block px-2 py-1 bg-white/5 rounded-full text-xs">
                                    {song.genre?.name || '-'}
                                </span>
                                {getUserIdFromCookie() && (
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowPlaylistMenu(showPlaylistMenu === song.id ? null : song.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded"
                                        >
                                            <Plus size={16} className="text-zinc-400" />
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
                </div>
            )}

            {!searched && (
                <div className="text-center py-20">
                    <SearchIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">Search for songs, artists, or albums</p>
                </div>
            )}
        </div>
    );
}
