'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] p-4 text-center space-y-6">
            <div className="size-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                <AlertTriangle size={40} className="text-red-500" />
            </div>

            <div>
                <h1 className="text-4xl font-bold text-white mb-2">System Critical Error</h1>
                <p className="text-zinc-400">Something went wrong in the matrix.</p>
                {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-red-400 mt-2 font-mono bg-red-950/30 p-2 rounded">{error.message}</p>
                )}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={reset}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00e5ff] text-black rounded-lg font-bold hover:bg-[#00e5ff]/80 transition-colors"
                >
                    <RefreshCw size={18} />
                    Reboot System
                </button>
                <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 transition-colors"
                >
                    <Home size={18} />
                    Safe Mode (Home)
                </Link>
            </div>
        </div>
    );
}
