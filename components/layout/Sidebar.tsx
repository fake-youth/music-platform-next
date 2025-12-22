"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Search, Library, PlusSquare, Heart, Globe, Disc, Music2, Menu, X, LogOut, LogIn } from "lucide-react";

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const hasToken = document.cookie.includes('user_role');
        setTimeout(() => setIsLoggedIn(hasToken), 0);
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setIsLoggedIn(false);
        router.push('/login');
    };

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10"
            >
                {isOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 h-screen fixed top-0 left-0 flex flex-col backdrop-blur-xl bg-black/40 border-r border-white/10 z-40 pb-24
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="p-6 flex items-center gap-2">
                    <div className="size-8 rounded-full bg-[#00e5ff]/20 flex items-center justify-center border border-[#00e5ff]/50 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                        <Music2 className="text-[#00e5ff]" size={18} />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                        JhonUI
                    </span>
                </div>

                {/* Main Menu */}
                <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                        <NavItem icon={Home} label="Home" href="/" onClick={() => setIsOpen(false)} />
                        <NavItem icon={Search} label="Search" href="/search" onClick={() => setIsOpen(false)} />
                        <NavItem icon={Library} label="Your Library" href="/library" onClick={() => setIsOpen(false)} />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase px-2">Discovery</h3>
                        <div className="space-y-1">
                            <NavItem icon={Globe} label="Explore" href="/explore" onClick={() => setIsOpen(false)} />
                            <NavItem icon={Disc} label="Genres" href="/genres" onClick={() => setIsOpen(false)} />
                            <NavItem icon={Disc} label="Albums" href="/albums" onClick={() => setIsOpen(false)} />
                            <NavItem icon={Globe} label="Artists" href="/artists" onClick={() => setIsOpen(false)} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase px-2">Your Collection</h3>
                        <div className="space-y-1">
                            <NavItem icon={Library} label="Playlists" href="/playlists" onClick={() => setIsOpen(false)} />
                            <NavItem icon={PlusSquare} label="Create Playlist" href="/playlists" onClick={() => setIsOpen(false)} />
                            <NavItem icon={Heart} label="Liked Songs" href="/likes" onClick={() => setIsOpen(false)} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase px-2">Account</h3>
                        <div className="space-y-1">
                            <NavItem icon={Globe} label="Notifications" href="/notifications" onClick={() => setIsOpen(false)} />
                            <NavItem icon={Music2} label="Premium" href="/premium" onClick={() => setIsOpen(false)} />
                        </div>
                    </div>
                </nav>

                {/* Auth Button */}
                <div className="p-4 border-t border-white/5">
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors py-2 px-2 rounded-lg hover:bg-white/5"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="w-full flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors py-2 px-2 rounded-lg hover:bg-white/5"
                        >
                            <LogIn size={16} /> Log In / Sign Up
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}

function NavItem({ icon: Icon, label, href, onClick }: { icon: React.ElementType, label: string, href: string, onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-zinc-400 hover:text-white hover:bg-white/5"
        >
            <Icon size={20} className="group-hover:text-[#00e5ff] transition-colors" />
            <span className="font-medium text-sm">{label}</span>
        </Link>
    );
}

