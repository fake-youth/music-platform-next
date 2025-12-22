"use client";

import { X, Play, Music, Trash2 } from "lucide-react";
import { usePlayer } from "@/components/providers/PlayerContext";
import { formatDuration } from "@/lib/utils";

interface QueueDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QueueDrawer({ isOpen, onClose }: QueueDrawerProps) {
    const { playlist, currentSong, playSong, setPlaylist } = usePlayer();

    if (!isOpen) return null;

    const handlePlayFromQueue = (index: number) => {
        if (playlist[index]) {
            playSong(playlist[index]);
        }
    };

    const handleRemoveFromQueue = (index: number) => {
        const newPlaylist = [...playlist];
        newPlaylist.splice(index, 1);
        setPlaylist(newPlaylist);
    };

    const handleClearQueue = () => {
        setPlaylist([]);
    };

    const currentIndex = currentSong ? playlist.findIndex(s => s.id === currentSong.id) : -1;
    const upNext = playlist.slice(currentIndex + 1);
    const previous = currentIndex > 0 ? playlist.slice(0, currentIndex) : [];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-24 w-full max-w-md bg-zinc-900/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h2 className="text-lg font-bold">Queue</h2>
                    <div className="flex items-center gap-2">
                        {playlist.length > 0 && (
                            <button
                                onClick={handleClearQueue}
                                className="text-zinc-400 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-white/5 transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-zinc-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {playlist.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                            <Music size={48} className="mb-4 text-zinc-700" />
                            <p>Queue is empty</p>
                            <p className="text-sm text-zinc-600 mt-1">Play some songs to add them here</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-6">
                            {/* Now Playing */}
                            {currentSong && (
                                <div>
                                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                                        Now Playing
                                    </h3>
                                    <QueueItem
                                        song={currentSong}
                                        isPlaying
                                        onClick={() => { }}
                                        onRemove={() => { }}
                                    />
                                </div>
                            )}

                            {/* Up Next */}
                            {upNext.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                                        Up Next ({upNext.length})
                                    </h3>
                                    <div className="space-y-1">
                                        {upNext.map((song, idx) => (
                                            <QueueItem
                                                key={`${song.id}-${idx}`}
                                                song={song}
                                                onClick={() => handlePlayFromQueue(currentIndex + 1 + idx)}
                                                onRemove={() => handleRemoveFromQueue(currentIndex + 1 + idx)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Previously Played */}
                            {previous.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                                        Previously Played
                                    </h3>
                                    <div className="space-y-1 opacity-60">
                                        {previous.map((song, idx) => (
                                            <QueueItem
                                                key={`prev-${song.id}-${idx}`}
                                                song={song}
                                                onClick={() => handlePlayFromQueue(idx)}
                                                onRemove={() => handleRemoveFromQueue(idx)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

interface QueueItemProps {
    song: {
        id: string;
        title: string;
        artistName: string;
        coverUrl?: string | null;
        duration: number;
    };
    isPlaying?: boolean;
    onClick: () => void;
    onRemove: () => void;
}

function QueueItem({ song, isPlaying, onClick, onRemove }: QueueItemProps) {
    return (
        <div
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer group transition-colors ${isPlaying ? 'bg-[#00e5ff]/10 border border-[#00e5ff]/30' : 'hover:bg-white/5'
                }`}
            onClick={onClick}
        >
            <div className="size-10 rounded bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                {song.coverUrl ? (
                    <img src={song.coverUrl} alt="" className="size-full object-cover" />
                ) : (
                    <div className="size-full bg-[#00e5ff]/20 flex items-center justify-center">
                        <Music size={16} className="text-[#00e5ff]/50" />
                    </div>
                )}
                {isPlaying && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="flex items-end gap-0.5 h-3">
                            <div className="w-0.5 bg-[#00e5ff] rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" style={{ height: '60%' }} />
                            <div className="w-0.5 bg-[#00e5ff] rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.1s]" style={{ height: '100%' }} />
                            <div className="w-0.5 bg-[#00e5ff] rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.2s]" style={{ height: '40%' }} />
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${isPlaying ? 'text-[#00e5ff]' : 'text-white'}`}>
                    {song.title}
                </p>
                <p className="text-zinc-400 text-xs truncate">{song.artistName}</p>
            </div>
            <span className="text-zinc-500 text-xs tabular-nums">{formatDuration(song.duration)}</span>
            {!isPlaying && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
}
