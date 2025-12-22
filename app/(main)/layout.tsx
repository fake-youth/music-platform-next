import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { MusicPlayer } from "@/components/player/MusicPlayer";
import { PlayerProvider } from "@/components/providers/PlayerContext";
import { ToastProvider } from "@/components/providers/ToastContext";

export const metadata: Metadata = {
    title: "My Music Player",
    description: "Experience music in a new dimension.",
};

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ToastProvider>
            <PlayerProvider>
                <div className="min-h-screen bg-[#050505] text-white">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none fixed z-10"></div>

                    {/* Ambient backgrounds */}
                    <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00e5ff]/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#00e5ff]/5 rounded-full blur-[100px] pointer-events-none" />

                    <Sidebar />

                    <main className="md:pl-64 min-h-screen pb-24 relative z-0">
                        {/* Top Header Placeholder - shows hamburger space on mobile */}
                        <div className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-5 backdrop-blur-md bg-black/20">
                            <div className="w-10 md:hidden" /> {/* Space for hamburger */}
                            <div className="flex-1" /> {/* Spacer */}
                        </div>

                        <div className="px-4 md:px-8">
                            {children}
                        </div>
                    </main>

                    <MusicPlayer />
                </div>
            </PlayerProvider>
        </ToastProvider>
    );
}
