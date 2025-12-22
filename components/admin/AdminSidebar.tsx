"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Music, Disc, Mic2, MessageSquare, Tags, BarChart3, LogOut } from "lucide-react";

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <aside className="w-64 h-screen fixed top-0 left-0 flex flex-col bg-zinc-950 border-r border-white/10 z-40">
            <div className="p-6">
                <span className="text-xl font-bold text-white tracking-tight">Admin<span className="text-[#00e5ff]">Panel</span></span>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                <NavItem icon={LayoutDashboard} label="Dashboard" href="/admin/dashboard" active={pathname === "/admin/dashboard"} />
                <NavItem icon={Music} label="Songs" href="/admin/songs" active={pathname?.includes("/songs")} />
                <NavItem icon={Disc} label="Albums" href="/admin/albums" active={pathname?.includes("/albums")} />
                <NavItem icon={Mic2} label="Artists" href="/admin/artists" active={pathname?.includes("/artists")} />
                <NavItem icon={Tags} label="Genres" href="/admin/genres" active={pathname?.includes("/genres")} />
                <NavItem icon={MessageSquare} label="Comments" href="/admin/comments" active={pathname?.includes("/comments")} />
                <NavItem icon={BarChart3} label="Analytics" href="/admin/analytics" active={pathname?.includes("/analytics")} />
            </nav>

            <div className="p-4 border-t border-white/5 space-y-1">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-white/5 w-full transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
}

function NavItem({ icon: Icon, label, href, active = false }: { icon: React.ElementType, label: string, href: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${active
                ? "bg-[#00e5ff] text-black"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
        >
            <Icon size={20} />
            <span className="font-medium text-sm">{label}</span>
        </Link>
    );
}
