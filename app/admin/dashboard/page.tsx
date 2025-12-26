"use client";

import { useEffect, useState } from "react";
import { ActivityChart, GenderDistributionChart, type ChartDataPoint } from "@/components/charts/DashboardCharts";
import { Users, Music, Disc, PlayCircle, Loader2, Clock } from "lucide-react";
import Link from "next/link";

interface AdminStats {
    summary?: {
        totalUsers?: number;
        activeListeners?: number;
        totalSongs?: number;
        totalGenres?: number;
    };
    charts?: {
        activity?: ChartDataPoint[];
        gender?: ChartDataPoint[];
    };
}

interface Song {
    id: string;
    title: string;
    artistName: string;
    coverUrl?: string | null;
    createdAt: string;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [recentSongs, setRecentSongs] = useState<Song[]>([]); // New state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/stats').then(res => res.json()),
            fetch('/api/songs?limit=5').then(res => res.json()) // Fetch recent songs
        ])
            .then(([statsData, songsData]: [AdminStats, Song[]]) => {
                setStats(statsData);
                setRecentSongs(Array.isArray(songsData) ? songsData.slice(0, 5) : []);
                setLoading(false);
            })
            .catch((err: unknown) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#00e5ff]" size={32} /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-zinc-400">Platform overview and management.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Songs" value={stats?.summary?.totalSongs || 0} change="+24" icon={Music} color="text-pink-400" />
                <StatCard title="Total Genres" value={stats?.summary?.totalGenres || 0} change="0" icon={Disc} color="text-[#00e5ff]" />
                <StatCard title="Total Users" value={stats?.summary?.totalUsers || 0} change="+12%" icon={Users} color="text-[#00e5ff]" />
                <StatCard title="Active Listeners" value={stats?.summary?.activeListeners || 0} change="+5%" icon={PlayCircle} color="text-emerald-400" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ActivityChart data={stats?.charts?.activity} />
                </div>
                <div className="lg:col-span-1">
                    <GenderDistributionChart data={stats?.charts?.gender} />
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/5">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-[#00e5ff]" />
                        Management Links
                    </h3>
                    <div className="space-y-3">
                        <Link href="/admin/songs" className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors">
                            <span className="font-medium">Music Catalog</span>
                            <p className="text-sm text-zinc-400 mt-1">Manage songs and audio files</p>
                        </Link>
                        <Link href="/admin/genres" className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors">
                            <span className="font-medium">Genre Settings</span>
                            <p className="text-sm text-zinc-400 mt-1">Organize musical categories</p>
                        </Link>
                        <Link href="/admin/analytics" className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors">
                            <span className="font-medium">Direct Analytics</span>
                            <p className="text-sm text-zinc-400 mt-1">Detailed platform performance</p>
                        </Link>
                    </div>
                </div>

                <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/5">
                    <h3 className="text-lg font-semibold mb-4">Recently Added Songs</h3>
                    {recentSongs.length === 0 ? (
                        <div className="text-center py-6 text-zinc-500">No songs added yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {recentSongs.map((song) => (
                                <div key={song.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg group transition-colors">
                                    <div className="size-10 rounded bg-zinc-800 flex-shrink-0 overflow-hidden relative">
                                        {song.coverUrl ? (
                                            <img src={song.coverUrl} className="size-full object-cover" alt="" />
                                        ) : (
                                            <div className="size-full flex items-center justify-center text-zinc-600"><Music size={16} /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white text-sm truncate">{song.title}</p>
                                        <p className="text-xs text-zinc-400 truncate">{song.artistName}</p>
                                    </div>
                                    <span className="text-xs text-zinc-500">{new Date(song.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link href="/admin/songs" className="block mt-4 text-sm text-[#00e5ff] hover:text-[#00e5ff]/80 text-center">
                        View all songs →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, icon: Icon, color }: { title: string, value: string | number, change: string, icon: React.ElementType, color: string }) {
    return (
        <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 flex items-start justify-between group hover:border-white/10 transition-colors">
            <div>
                <p className="text-zinc-400 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold mt-2 text-white">{value}</h3>
                <span className="text-xs text-emerald-400 mt-2 block">{change} from last month</span>
            </div>
            <div className={`p-3 rounded-lg bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
        </div>
    )
}
