import Link from 'next/link';
import { Home, Music2 } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="text-center space-y-6">
                <div className="size-24 rounded-full bg-[#00e5ff]/10 flex items-center justify-center border border-[#00e5ff]/30 mx-auto">
                    <Music2 size={40} className="text-[#00e5ff]" />
                </div>

                <div>
                    <h1 className="text-6xl font-bold text-white mb-2">404</h1>
                    <p className="text-zinc-400 text-lg">This page doesn&apos;t exist</p>
                </div>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-[#00e5ff] text-black px-6 py-3 rounded-full font-bold hover:bg-[#00e5ff]/80 transition-colors"
                >
                    <Home size={18} />
                    Go Home
                </Link>
            </div>
        </div>
    );
}
