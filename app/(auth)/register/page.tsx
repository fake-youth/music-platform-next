"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/ToastContext";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (data.success) {
                showToast('Registration successful!', 'success');
                router.push('/');
            } else {
                const errorMsg = data.error || 'Registration failed';
                setError(errorMsg);
                showToast(errorMsg, 'error');
            }
        } catch {
            const errorMsg = 'Something went wrong';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Access the Sound</h1>
                <p className="text-zinc-400 text-sm mb-8 max-w-xs">Join thousands of listeners enjoying the highest quality audio experience.</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="John Doe"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#00e5ff] transition-colors placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-400 ml-1 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="name@example.com"
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
                            placeholder="Create a strong password"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#00e5ff] transition-colors placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                {/* Guest Terms */}
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 mt-2">
                    <p className="text-[10px] text-zinc-400 leading-tight">
                        By registering, you agree to our Terms. Guest access is limited to 30s previews. Full access requires verification.
                    </p>
                </div>

                <Button disabled={loading} className="w-full mt-2 bg-[#00e5ff] text-black hover:bg-[#00e5ff]/80 font-bold py-6 text-base shadow-lg shadow-[#00e5ff]/20 group">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" /></>}
                </Button>
            </form>

            <div className="mt-8 text-center text-sm text-zinc-500">
                Already have an account? <Link href="/login" className="text-[#00e5ff] hover:text-[#00e5ff]/80 font-medium hover:underline">Log in</Link>
            </div>
        </div>
    );
}

