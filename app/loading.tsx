import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] space-y-4">
            <div className="size-16 rounded-full bg-[#00e5ff]/10 flex items-center justify-center border border-[#00e5ff]/30 animate-pulse">
                <Loader2 size={32} className="text-[#00e5ff] animate-spin" />
            </div>
            <p className="text-zinc-500 text-sm animate-pulse">Loading experience...</p>
        </div>
    );
}
