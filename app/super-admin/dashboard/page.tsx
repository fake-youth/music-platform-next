"use client";

import { useEffect, useState } from "react";
import { ActivityChart, GenderDistributionChart, type ChartDataPoint } from "@/components/charts/DashboardCharts";
import { Users, Music, Disc, PlayCircle, Loader2, Clock } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
    summary?: {
        totalUsers?: number;
        activeListeners?: number;
        totalSongs?: number;
        totalGenres?: number;
    };
    charts?: {
        activity?: unknown[];
        gender?: unknown[];
    };
}

interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentUsers, setRecentUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/stats').then(res => res.json()),
            fetch('/api/stats/recent-users?limit=5').then(res => res.json())
        ])
            .then(([statsData, usersData]: [DashboardStats, User[]]) => {
                setStats(statsData);
                setRecentUsers(Array.isArray(usersData) ? usersData : []);
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
                <h1 className="text-3xl font-bold mb-2">Executive Dashboard</h1>
                <p className="text-zinc-400">Real-time platform overview and analytics.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats?.summary?.totalUsers || 0} change="+12%" icon={Users} color="text-[#00e5ff]" />
                <StatCard title="Active Listeners" value={stats?.summary?.activeListeners || 0} change="+5%" icon={PlayCircle} color="text-emerald-400" />
                <StatCard title="Total Songs" value={stats?.summary?.totalSongs || 0} change="+24" icon={Music} color="text-pink-400" />
                <StatCard title="Genres" value={stats?.summary?.totalGenres || 0} change="0" icon={Disc} color="text-[#00e5ff]" />
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

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/5">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-[#00e5ff]" />
                        Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <Link
                            href="/admin/songs"
                            className="block p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <span className="font-medium">Manage Songs</span>
                            <p className="text-sm text-zinc-400 mt-1">Add, edit, or delete songs</p>
                        </Link>
                        <Link
                            href="/admin/genres"
                            className="block p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <span className="font-medium">Manage Genres</span>
                            <p className="text-sm text-zinc-400 mt-1">Organize music categories</p>
                        </Link>
                        <Link
                            href="/super-admin/users"
                            className="block p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <span className="font-medium">Manage Users</span>
                            <p className="text-sm text-zinc-400 mt-1">Control user roles and access</p>
                        </Link>
                    </div>
                </div>

                <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/5">
                    <h3 className="text-lg font-semibold mb-4">Recent Registrations</h3>
                    {recentUsers.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 text-sm">No recent users</div>
                    ) : (
                        <div className="space-y-2">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-white">{user.fullName}</p>
                                        <p className="text-xs text-zinc-400">{user.email}</p>
                                    </div>
                                    <span className="text-xs bg-[#00e5ff]/10 text-[#00e5ff] px-2 py-1 rounded-full border border-[#00e5ff]/30">
                                        {user.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link
                        href="/super-admin/users"
                        className="block mt-4 text-sm text-[#00e5ff] hover:text-white text-center"
                    >
                        View all users →
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
