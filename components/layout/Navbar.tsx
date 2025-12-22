import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
                        <Music className="h-4 w-4 text-black" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        NEO<span className="text-[var(--primary)]">MUSIC</span>
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-white hover:text-[var(--primary)]">
                            Login
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button className="glow">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
