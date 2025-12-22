"use client";

import { useEffect, useState } from "react";
import { PlayCircle, TrendingUp, Loader2 } from "lucide-react";
import { ActivityChart, GenderDistributionChart, type ChartDataPoint } from "@/components/charts/DashboardCharts";

interface Song {
    id: string;
    title: string;
    artistName: string;
    playCount?: number;
    genre?: { name: string } | null;
}

interface AnalyticsStats {
    charts?: {
        activity?: unknown[];
        gender?: unknown[];
    };
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [topSongs, setTopSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/stats').then(res => res.json()),
            fetch('/api/songs/trending?limit=10').then(res => res.json())
        ])
            .then(([statsData, songsData]: [unknown, unknown]) => {
                setStats(statsData as AnalyticsStats);
                setTopSongs(Array.isArray(songsData) ? (songsData as Song[]) : []);
                setLoading(false);
            })
            .catch((err: unknown) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-[#00e5ff]" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Analytics & Insights</h1>
                <p className="text-zinc-400">Detailed platform analytics and performance metrics.</p>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ActivityChart data={stats?.charts?.activity as ChartDataPoint[]} />
                </div>
                <div className="lg:col-span-1">
                    <GenderDistributionChart data={stats?.charts?.gender as ChartDataPoint[]} />
                </div>
            </div>

            {/* Top Songs */}
            <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-[#00e5ff]" />
                    Top Songs by Play Count
                </h3>
                {topSongs.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-sm">No songs data available</div>
                ) : (
                    <div className="space-y-2">
                        {topSongs.map((song, idx) => (
                            <div key={song.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg">
                                <span className="text-2xl font-bold text-zinc-600 w-8">#{idx + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{song.title}</p>
                                    <p className="text-sm text-zinc-400 truncate">{song.artistName}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <PlayCircle size={16} />
                                        <span className="text-sm">{song.playCount || 0}</span>
                                    </div>
                                    {song.genre && (
                                        <span className="text-xs bg-[#00e5ff]/10 text-[#00e5ff] px-2 py-1 rounded-full border border-[#00e5ff]/30">
                                            {song.genre.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
