"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

interface Song {
    id: string;
    title: string;
    artistName: string;
    audioUrl: string;
    coverUrl?: string | null;
    lyrics?: string | null;
    duration: number;
}

interface PlayerContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    playSong: (song: Song) => void;
    togglePlay: () => void;
    progress: number;
    setProgress: (val: number) => void;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    // New Controls
    volume: number;
    setVolume: (val: number) => void;
    playlist: Song[];
    setPlaylist: (songs: Song[]) => void;
    nextSong: () => void;
    prevSong: () => void;
    shuffle: boolean;
    toggleShuffle: () => void;
    repeat: 'off' | 'one' | 'all';
    toggleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgressState] = useState(0);
    const [volume, setVolumeState] = useState(0.5);
    const [playlist, setPlaylist] = useState<Song[]>([]);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('off');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playSong = useCallback((song: Song) => {
        setCurrentSong(song);
        setIsPlaying(true);
        if (audioRef.current) {
            audioRef.current.src = song.audioUrl;
            audioRef.current.volume = volume;
            audioRef.current.play();
        }

        // Record play history
        if (typeof document !== 'undefined') {
            const cookies = document.cookie.split(';');
            const userIdCookie = cookies.find(c => c.trim().startsWith('user_id='));
            const userId = userIdCookie ? userIdCookie.split('=')[1] : null;

            if (userId) {
                fetch('/api/play-history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, songId: song.id })
                }).catch(err => console.error('Failed to record play history:', err));
            }
        }
    }, [volume]);

    const togglePlay = useCallback(() => {
        if (!currentSong) return;
        setIsPlaying(prev => !prev);
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
        }
    }, [currentSong, isPlaying]);

    const setProgress = useCallback((val: number) => {
        setProgressState(val);
        if (audioRef.current && currentSong) {
            audioRef.current.currentTime = (val / 100) * currentSong.duration;
        }
    }, [currentSong]);

    const setVolume = useCallback((val: number) => {
        setVolumeState(val);
        if (audioRef.current) {
            audioRef.current.volume = val;
        }
    }, []);

    const nextSong = useCallback(() => {
        if (playlist.length === 0 || !currentSong) return;
        const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
        let nextIndex: number;

        if (shuffle) {
            nextIndex = Math.floor(Math.random() * playlist.length);
        } else {
            nextIndex = (currentIndex + 1) % playlist.length;
        }

        playSong(playlist[nextIndex]);
    }, [playlist, currentSong, shuffle, playSong]);

    const prevSong = useCallback(() => {
        if (playlist.length === 0 || !currentSong) return;
        const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
        const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
        playSong(playlist[prevIndex]);
    }, [playlist, currentSong, playSong]);

    const toggleShuffle = useCallback(() => {
        setShuffle(prev => !prev);
    }, []);

    const toggleRepeat = useCallback(() => {
        setRepeat(prev => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            return 'off';
        });
    }, []);

    // Handle Audio Events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setProgressState((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            if (repeat === 'one') {
                audio.currentTime = 0;
                audio.play();
            } else if (repeat === 'all' || playlist.length > 1) {
                nextSong();
            } else {
                setIsPlaying(false);
                setProgressState(0);
            }
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("ended", handleEnded);
        }
    }, [currentSong, repeat, nextSong, playlist.length]);

    return (
        <PlayerContext.Provider value={{
            currentSong, isPlaying, playSong, togglePlay, progress, setProgress, audioRef,
            volume, setVolume, playlist, setPlaylist, nextSong, prevSong,
            shuffle, toggleShuffle, repeat, toggleRepeat
        }}>
            {children}
            {/* Hidden Audio Element */}
            <audio ref={audioRef as React.RefObject<HTMLAudioElement>} />
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (!context) throw new Error("usePlayer must be used within a PlayerProvider");
    return context;
}

