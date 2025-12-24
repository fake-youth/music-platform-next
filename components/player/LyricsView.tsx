import React from 'react';
import { X, Mic2 } from 'lucide-react';
import { usePlayer } from '@/components/providers/PlayerContext';

interface LyricsViewProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LyricsView({ isOpen, onClose }: LyricsViewProps) {
    const { currentSong } = usePlayer();

    if (!isOpen || !currentSong) return null;

    return (
        <div className="fixed inset-x-0 bottom-24 top-0 md:top-auto md:bottom-24 md:left-auto md:right-4 md:w-96 md:h-[calc(100vh-8rem)] bg-black/95 backdrop-blur-xl border-t md:border border-white/10 z-30 transition-all duration-300 md:rounded-xl md:shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-2 text-[#00e5ff]">
                    <Mic2 size={18} />
                    <span className="font-bold text-sm uppercase tracking-wider">Lyrics</span>
                </div>
                <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full">
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 text-center space-y-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {currentSong.lyrics ? (
                    <div className="text-lg md:text-xl font-medium leading-relaxed text-zinc-300 whitespace-pre-wrap font-sans">
                        {currentSong.lyrics}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2 opacity-50">
                        <Mic2 size={48} />
                        <p>No lyrics available for this track.</p>
                    </div>
                )}
            </div>

            {/* Song Info Footer (Mobile) */}
            <div className="p-4 border-t border-white/5 bg-zinc-900/50 md:hidden">
                <h3 className="font-bold text-white truncate">{currentSong.title}</h3>
                <p className="text-zinc-400 text-xs truncate">{currentSong.artistName}</p>
            </div>
        </div>
    );
}
