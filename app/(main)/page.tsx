"use client";

import { useEffect, useState } from "react";
import { Play, Clock, Sparkles, TrendingUp, ChevronRight, Music, Plus, Bell } from "lucide-react";
import { usePlayer } from "@/components/providers/PlayerContext";
import { AddToPlaylistMenu } from "@/components/playlist/AddToPlaylistMenu";
import { useToast } from "@/components/providers/ToastContext";
import Link from "next/link";

interface Song {
    id: string;
    title: string;
    artistName: string;
    audioUrl: string;
    coverUrl?: string | null;
    duration: number;
    genre?: { name: string } | null;
}

export default function HomePage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);
    const { playSong, setPlaylist, currentSong, isPlaying } = usePlayer();
    const { showToast } = useToast();

    useEffect(() => {
        fetch('/api/songs')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setSongs(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handlePlayAll = () => {
        if (songs.length > 0) {
            playSong(songs[0]);
            setPlaylist(songs);
        }
    };

    const handlePlay = (song: Song) => {
        playSong(song);
        setPlaylist(songs);
    };

    return (
        <div className="space-y-12 py-6 relative">

            {/* Animated Hero Section */}
            <section className="relative h-[420px] rounded-3xl overflow-hidden group">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/40 via-[#7b2cbf]/20 to-black/80 z-10 animate-pulse-slow" />

                {/* Noise texture */}
                <div className="absolute inset-0 z-[11] opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                {/* Background image with parallax effect */}
                <img
                    src="https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=2600&auto=format&fit=crop"
                    alt="Featured"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />

                {/* Content */}
                <div className="absolute inset-0 z-20 p-10 flex flex-col justify-end items-start">
                    {/* Floating badge */}
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl text-white text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-full mb-6 border border-[#00e5ff]/30 shadow-lg shadow-[#00e5ff]/20 animate-float">
                        <Sparkles size={14} className="text-[#00e5ff]" />
                        <span>Featured Playlist</span>
                    </div>

                    {/* Title with glow */}
                    <h1 className="text-6xl md:text-7xl font-bold mb-4 drop-shadow-2xl leading-tight text-white">
                        <span className="inline-block bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                            Sounds of
                        </span>
                        <br />
                        <span className="inline-block text-[#00e5ff] drop-shadow-[0_0_30px_rgba(0,229,255,0.5)]">
                            The Universe
                        </span>
                    </h1>

                    <p className="text-zinc-300 max-w-lg mb-8 text-lg">
                        Experience the ethereal journey through soundscapes that define our generation.
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePlayAll}
                            className="bg-[#00e5ff] text-black px-8 py-4 rounded-full font-bold flex items-center gap-3 hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl shadow-[#00e5ff]/40 group/btn"
                        >
                            <div className="size-8 rounded-full bg-black flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                <Play size={16} fill="white" className="text-white ml-0.5" />
                            </div>
                            Play Now
                        </button>
                        <Link href="/explore" className="px-6 py-4 rounded-full font-medium text-white border border-white/20 hover:border-white/50 hover:bg-white/10 transition-all backdrop-blur-xl">
                            Explore
                        </Link>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-10 right-10 size-32 bg-[#00e5ff]/20 rounded-full blur-3xl z-[5]" />
                <div className="absolute bottom-20 right-40 size-20 bg-[#7b2cbf]/30 rounded-full blur-2xl z-[5]" />
            </section>

            {/* Quick Actions Row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Clock, label: "Recently Played", href: "/library", color: "from-emerald-500 to-teal-600" },
                    { icon: Sparkles, label: "Made For You", href: "/explore", color: "from-[#00e5ff] to-blue-600" },
                    { icon: TrendingUp, label: "Trending", href: "/explore", color: "from-rose-500 to-pink-600" },
                    { icon: Music, label: "New Releases", href: "#new", color: "from-amber-500 to-orange-600" },
                ].map((item, idx) => (
                    <Link
                        key={idx}
                        href={item.href}
                        className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                    >
                        <div className={`size-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <item.icon size={20} className="text-white" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </section>

            {/* New Releases with Premium Cards */}
            <section id="new">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">New Releases</h2>
                        <p className="text-zinc-500 text-sm mt-1">Fresh tracks just for you</p>
                    </div>
                    <Link href="/explore" className="flex items-center gap-1 text-sm text-[#00e5ff] hover:text-white uppercase font-semibold tracking-wider group">
                        See All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white/5 animate-pulse">
                                <div className="aspect-square rounded-lg bg-zinc-800 mb-4" />
                                <div className="h-4 bg-zinc-800 rounded mb-2" />
                                <div className="h-3 bg-zinc-800/50 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : songs.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500">
                        <Music size={48} className="mx-auto mb-4 text-zinc-700" />
                        <p>No songs available yet</p>
                        <p className="text-sm text-zinc-600 mt-1">Upload some in Admin Panel!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {songs.map((song) => (
                            <div
                                key={song.id}
                                onClick={() => handlePlay(song)}
                                className={`group p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-[#00e5ff]/30 flex flex-col gap-4 cursor-pointer ${currentSong?.id === song.id ? 'ring-2 ring-[#00e5ff]/50 bg-[#00e5ff]/5' : ''
                                    }`}
                            >
                                <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800 relative shadow-xl">
                                    <img
                                        src={song.coverUrl || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop`}
                                        alt={song.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />

                                    {/* Play overlay */}
                                    <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${currentSong?.id === song.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                        }`}>
                                        <div className="size-14 rounded-full bg-[#00e5ff] flex items-center justify-center text-black shadow-xl shadow-[#00e5ff]/40 hover:scale-110 transition-transform">
                                            {currentSong?.id === song.id && isPlaying ? (
                                                <div className="flex items-end gap-1 h-5">
                                                    <div className="w-1 bg-black rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" style={{ height: '60%' }} />
                                                    <div className="w-1 bg-black rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.1s]" style={{ height: '100%' }} />
                                                    <div className="w-1 bg-black rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.2s]" style={{ height: '40%' }} />
                                                </div>
                                            ) : (
                                                <Play fill="black" className="ml-1" size={24} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Add to Playlist button */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowPlaylistMenu(showPlaylistMenu === song.id ? null : song.id);
                                                }}
                                                className="size-8 rounded-full bg-black/60 backdrop-blur-xl flex items-center justify-center hover:bg-black/80 transition-colors border border-white/20"
                                            >
                                                <Plus size={16} className="text-white" />
                                            </button>
                                            {showPlaylistMenu === song.id && (
                                                <AddToPlaylistMenu
                                                    songId={song.id}
                                                    onClose={() => setShowPlaylistMenu(null)}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Genre badge */}
                                    {song.genre && (
                                        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase bg-black/60 backdrop-blur-xl px-2 py-1 rounded-full text-white/80">
                                            {song.genre.name}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold truncate group-hover:text-[#00e5ff] transition-colors">{song.title}</h3>
                                    <p className="text-sm text-zinc-400 truncate mt-1">{song.artistName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Featured Artists Banner */}
            <section className="relative rounded-2xl overflow-hidden p-8 md:p-12 bg-gradient-to-r from-[#7b2cbf]/20 via-[#00e5ff]/10 to-transparent border border-white/5">
                <div className="relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#00e5ff]">Coming Soon</span>
                    <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Live Listening Rooms</h2>
                    <p className="text-zinc-400 max-w-md mb-6">Listen together with friends in real-time. Share your favorite songs and discover new music together.</p>
                    <button
                        onClick={() => showToast('You will be notified when Live Rooms launch!', 'success')}
                        className="px-6 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all font-medium flex items-center gap-2"
                    >
                        <Bell size={16} />
                        Get Notified
                    </button>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#00e5ff]/10 to-transparent" />
            </section>

        </div>
    );
}
