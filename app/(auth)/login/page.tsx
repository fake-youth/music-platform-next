"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Music2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/ToastContext";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (data.success) {
                showToast('Login successful', 'success');
                // Redirect based on role
                if (data.role === 'SUPER_ADMIN') router.push('/super-admin/dashboard');
                else if (data.role === 'ADMIN') router.push('/admin/dashboard');
                else router.push('/');
            } else {
                showToast(data.error || 'Login failed', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Login failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="size-12 rounded-full bg-[#00e5ff]/10 flex items-center justify-center border border-[#00e5ff]/50 mb-6 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                <Music2 className="text-[#00e5ff]" size={24} />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-zinc-400 text-sm mb-8 text-center max-w-xs">Enter your credentials to access your personalized library.</p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="admin@example.com"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#00e5ff] transition-colors placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#00e5ff] transition-colors placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" className="rounded bg-black/40 border-white/10 text-[#00e5ff] focus:ring-0" />
                        Remember me
                    </label>
                    <Link href="#" className="hover:text-[#00e5ff] transition-colors">Forgot password?</Link>
                </div>

                <Button disabled={loading} className="w-full mt-6 bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black font-semibold py-6 text-base shadow-lg shadow-[#00e5ff]/20 group">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" /></>}
                </Button>
            </form>

            <div className="mt-8 text-center text-sm text-zinc-500">
                Don&apos;t have an account? <Link href="/register" className="text-[#00e5ff] hover:text-[#00e5ff]/80 font-medium hover:underline">Create one now</Link>
            </div>
        </div>
    );
}
