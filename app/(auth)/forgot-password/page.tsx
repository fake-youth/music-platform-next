"use client";

import { useState } from "react";
import { Mail, Music2, ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/ToastContext";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            showToast('Please enter your email address', 'error');
            return;
        }

        setLoading(true);

        // Simulate API call - in production this would send reset email
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSent(true);
        showToast('Password reset instructions sent!', 'success');
        setLoading(false);
    };

    if (sent) {
        return (
            <div className="flex flex-col items-center text-center">
                <div className="size-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    <Send className="text-green-400" size={28} />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Check Your Email</h1>
                <p className="text-zinc-400 text-sm mb-8 max-w-xs">
                    We&apos;ve sent password reset instructions to <span className="text-white font-medium">{email}</span>
                </p>

                <div className="space-y-4 w-full">
                    <p className="text-xs text-zinc-500">
                        Didn&apos;t receive the email? Check your spam folder or try again.
                    </p>

                    <Button
                        onClick={() => setSent(false)}
                        variant="outline"
                        className="w-full border-white/10 hover:bg-white/5"
                    >
                        Try Again
                    </Button>

                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            <div className="size-12 rounded-full bg-[#00e5ff]/10 flex items-center justify-center border border-[#00e5ff]/50 mb-6 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                <Music2 className="text-[#00e5ff]" size={24} />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Forgot Password?</h1>
            <p className="text-zinc-400 text-sm mb-8 text-center max-w-xs">
                No worries! Enter your email and we&apos;ll send you reset instructions.
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#00e5ff] transition-colors placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                <Button
                    disabled={loading}
                    className="w-full mt-6 bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black font-semibold py-6 text-base shadow-lg shadow-[#00e5ff]/20"
                >
                    {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <>Send Reset Link</>
                    )}
                </Button>
            </form>

            <Link
                href="/login"
                className="mt-8 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Login
            </Link>
        </div>
    );
}
