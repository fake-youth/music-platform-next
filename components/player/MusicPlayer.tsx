"use client";

import React, { useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic2, ListMusic, Heart, Shuffle, Repeat, Repeat1 } from "lucide-react";
import { usePlayer } from "@/components/providers/PlayerContext";
import { formatDuration, getUserIdFromCookie } from "@/lib/utils";
import { useToast } from "@/components/providers/ToastContext";
import { QueueDrawer } from "@/components/player/QueueDrawer";
import { AudioVisualizer } from "@/components/player/AudioVisualizer";
import Link from "next/link";

export function MusicPlayer() {
    const {
        isPlaying, togglePlay, currentSong, progress, setProgress, audioRef,
        volume, setVolume, nextSong, prevSong, shuffle, toggleShuffle, repeat, toggleRepeat
    } = usePlayer();
    const [isGuest, setIsGuest] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [liked, setLiked] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const hasRole = document.cookie.includes('user_role');
        const isGuestStatus = !hasRole;
        setTimeout(() => setIsGuest(isGuestStatus), 0);

        // Check if current song is liked
        if (currentSong && hasRole) {
            const userId = getUserIdFromCookie();
            if (userId) {
                fetch(`/api/likes?userId=${userId}&songId=${currentSong.id}`)
                    .then(res => res.json())
                    .then(data => setLiked(data.liked || false))
                    .catch(() => setLiked(false));
            }
        }
    }, [currentSong]);

    useEffect(() => {
        if (isGuest && isPlaying && audioRef.current) {
            if (audioRef.current.currentTime >= 30) {
                audioRef.current.pause();
                togglePlay();
                audioRef.current.currentTime = 0;
                if (!showPaywall) {
                    setTimeout(() => setShowPaywall(true), 0);
                }
            }
        }
    }, [progress, isGuest, isPlaying, audioRef, togglePlay, showPaywall]);

    if (!currentSong) return null;

    if (showPaywall) {
        return (
            <div className="fixed bottom-0 left-0 right-0 h-24 md:h-20 backdrop-blur-xl bg-black/80 border-t border-white/10 z-50 flex items-center justify-between px-4 md:px-6 animate-pulse">
                <div className="flex items-center gap-4">
                    <span className="text-[#00e5ff] font-bold text-sm">Preview Ended</span>
                    <span className="text-zinc-400 text-xs hidden sm:inline">Sign in to listen to the full track.</span>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={() => setShowPaywall(false)} className="text-zinc-400 hover:text-white text-xs">Dismiss</button>
                    <Link href="/login" className="bg-[#00e5ff] text-black px-4 md:px-6 py-2 rounded-full font-bold text-sm hover:bg-[#00e5ff]/80 transition-colors">
                        Login Now
                    </Link>
                </div>
            </div>
        )
    }

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percent = (offsetX / rect.width) * 100;
        const duration = currentSong.duration || 100;
        const seekTime = (percent / 100) * duration;

        if (isGuest && seekTime > 30) {
            alert("Guests can only listen to 30 second previews.");
            return;
        }

        setProgress(percent);
    };

    const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, offsetX / rect.width));
        setVolume(percent);
    };

    const handleLike = async () => {
        if (isGuest || !currentSong) {
            showToast('Please login to like songs', 'info');
            return;
        }

        const userId = getUserIdFromCookie();
        if (!userId) {
            showToast('Please login to like songs', 'info');
            return;
        }

        try {
            const res = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ songId: currentSong.id, userId })
            });
            const data = await res.json();
            setLiked(data.liked);
            showToast(data.liked ? 'Added to liked songs' : 'Removed from liked songs', 'success');
        } catch (error) {
            console.error('Failed to toggle like:', error);
            showToast('Failed to update like', 'error');
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 md:h-24 backdrop-blur-xl bg-black/60 border-t border-white/10 z-50 flex items-center px-3 md:px-6 justify-between transition-all duration-300">

            {/* Track Info - Responsive */}
            <div className="flex items-center gap-2 md:gap-4 w-[25%] md:w-[30%] min-w-0">
                <div className="size-10 md:size-14 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden relative group flex-shrink-0">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    {currentSong.coverUrl ? (
                        <img src={currentSong.coverUrl} alt="Album Art" className="size-full object-cover" />
                    ) : (
                        <div className="size-full bg-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff] font-bold text-[10px]">AURA</div>
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-white font-medium text-xs md:text-sm truncate">{currentSong.title}</span>
                    <span className="text-zinc-400 text-[10px] md:text-xs truncate">{currentSong.artist}</span>
                </div>
                <button onClick={handleLike} className={`ml-1 md:ml-2 transition-colors hidden sm:block ${liked ? 'text-rose-500' : 'text-zinc-400 hover:text-rose-500'}`}>
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                </button>
            </div>

            {/* Controls - Responsive */}
            <div className="flex flex-col items-center gap-1 md:gap-2 w-[50%] md:w-[40%]">
                <div className="flex items-center gap-3 md:gap-6">
                    <button onClick={toggleShuffle} className={`hidden sm:block transition-colors ${shuffle ? 'text-[#00e5ff]' : 'text-zinc-500 hover:text-white'}`}>
                        <Shuffle size={14} />
                    </button>
                    <button onClick={prevSong} className="text-zinc-300 hover:text-white transition-colors">
                        <SkipBack size={18} className="fill-current" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="size-9 md:size-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
                    </button>

                    <button onClick={nextSong} className="text-zinc-300 hover:text-white transition-colors">
                        <SkipForward size={18} className="fill-current" />
                    </button>
                    <button onClick={toggleRepeat} className={`hidden sm:block transition-colors ${repeat !== 'off' ? 'text-[#00e5ff]' : 'text-zinc-500 hover:text-white'}`}>
                        {repeat === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 md:gap-3 w-full max-w-md cursor-pointer group">
                    <span className="text-[10px] md:text-xs text-zinc-500 tabular-nums hidden sm:inline">
                        {formatDuration((progress / 100) * (currentSong?.duration || 0))}
                    </span>
                    <div
                        onClick={handleSeek}
                        className="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden group-hover:h-1.5 transition-all"
                    >
                        <div
                            className="absolute left-0 top-0 bottom-0 bg-white rounded-full transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                        {isGuest && (
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500/50 z-10"
                                style={{ left: `${(30 / (currentSong.duration || 200)) * 100}%` }}
                                title="30s Preview Limit"
                            />
                        )}
                    </div>
                    <span className="text-[10px] md:text-xs text-zinc-500 tabular-nums hidden sm:inline">{formatDuration(currentSong.duration)}</span>
                </div>
            </div>

            {/* Volume & Extras - Responsive */}
            <div className="flex items-center justify-end gap-2 md:gap-4 w-[25%] md:w-[30%]">
                <button
                    className="text-zinc-400 hover:text-white transition-colors hidden lg:block"
                    title="Lyrics (Coming Soon)"
                >
                    <Mic2 size={16} />
                </button>
                <button
                    onClick={() => setShowQueue(!showQueue)}
                    className={`transition-colors hidden md:block ${showQueue ? 'text-[#00e5ff]' : 'text-zinc-400 hover:text-white'}`}
                    title="Queue"
                >
                    <ListMusic size={16} />
                </button>
                <div className="flex items-center gap-2 group">
                    <button onClick={() => setVolume(volume > 0 ? 0 : 0.5)} className="text-zinc-400 group-hover:text-white transition-colors">
                        {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <div
                        onClick={handleVolumeChange}
                        className="w-16 md:w-24 h-1 bg-white/10 rounded-full relative cursor-pointer group-hover:h-1.5 transition-all hidden sm:block"
                    >
                        <div className="absolute left-0 top-0 bottom-0 bg-white rounded-full" style={{ width: `${volume * 100}%` }} />
                    </div>
                </div>
            </div>

            {/* Queue Drawer */}
            <QueueDrawer isOpen={showQueue} onClose={() => setShowQueue(false)} />

        </div>
    );
}

