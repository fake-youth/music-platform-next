"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Settings, LogOut, Shield, Music, Disc, Mic2, MessageSquare, ShieldAlert } from "lucide-react";

export function SuperAdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <aside className="w-64 h-screen fixed top-0 left-0 flex flex-col bg-zinc-950 border-r border-white/10 z-40">
            <div className="p-6">
                <span className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Shield size={24} className="text-[#00e5ff]" />
                    Super<span className="text-[#00e5ff]">Admin</span>
                </span>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                <NavItem icon={LayoutDashboard} label="Dashboard" href="/super-admin/dashboard" active={pathname?.includes("/dashboard")} />
                <NavItem icon={Users} label="User Management" href="/super-admin/users" active={pathname?.includes("/users")} />

                <div className="pt-4 pb-2 px-2">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Content Control</p>
                </div>
                <NavItem icon={Music} label="Global Songs" href="/admin/songs" active={pathname?.includes("/songs")} />
                <NavItem icon={Disc} label="Global Albums" href="/admin/albums" active={pathname?.includes("/albums")} />
                <NavItem icon={Mic2} label="Global Artists" href="/admin/artists" active={pathname?.includes("/artists")} />
                <NavItem icon={MessageSquare} label="All Comments" href="/admin/comments" active={pathname?.includes("/comments")} />
            </nav>

            <div className="p-4 border-t border-white/5 space-y-1">
                <NavItem icon={ShieldAlert} label="Audit Logs" href="/super-admin/logs" active={pathname?.includes("/logs")} />
                <NavItem icon={Settings} label="System Settings" href="/super-admin/settings" active={pathname?.includes("/settings")} />
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
