"use client";

import React from 'react';
import { ToastProvider } from "@/components/providers/ToastContext";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ToastProvider>
            <div className="min-h-screen grid items-center justify-center bg-black relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-[-50%] left-[-50%] w-[1000px] h-[1000px] bg-[#00e5ff]/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-50%] right-[-50%] w-[800px] h-[800px] bg-[#00e5ff]/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md p-8 glass-card rounded-2xl border border-white/10 shadow-2xl animate-float">
                {children}
            </div>

            <div className="absolute bottom-6 text-center w-full text-zinc-500 text-xs">
                © 2025 Aura Music. Audio Experience Redefined.
            </div>
            </div>
        </ToastProvider>
    );
}
