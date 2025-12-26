'use client'

import { useState, useEffect } from 'react'
import { Crown, Check, Sparkles, Music, Download, Zap, Shield, Star } from 'lucide-react'
import { useToast } from '@/components/providers/ToastContext'

interface Plan {
    id: string
    name: string
    price: number
    period: string
    features: string[]
    highlighted?: boolean
    icon: React.ReactNode
}

const plans: Plan[] = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'forever',
        icon: <Music className="w-8 h-8" />,
        features: [
            'Access to all songs',
            'Create up to 5 playlists',
            'Standard audio quality',
            'Ads between songs',
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 49000,
        period: 'month',
        highlighted: true,
        icon: <Crown className="w-8 h-8" />,
        features: [
            'Everything in Free',
            'No ads',
            'Unlimited playlists',
            'High quality audio (320kbps)',
            'Download songs offline',
            'Priority support',
        ],
    },
    {
        id: 'premium_plus',
        name: 'Premium+',
        price: 99000,
        period: 'month',
        icon: <Sparkles className="w-8 h-8" />,
        features: [
            'Everything in Premium',
            'Lossless audio quality',
            'Early access to new features',
            'Exclusive content',
            'Family sharing (up to 6)',
            '24/7 VIP support',
        ],
    },
]

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price)
}

export default function PremiumPage() {
    const [selectedPlan, setSelectedPlan] = useState<string>('premium')
    const [loading, setLoading] = useState(false)
    const [currentPlan, setCurrentPlan] = useState<string>('free')
    const { showToast } = useToast()

    useEffect(() => {
        checkCurrentPlan()
    }, [])

    async function checkCurrentPlan() {
        try {
            const res = await fetch('/api/subscription')
            if (res.ok) {
                const data = await res.json()
                if (data.subscription) {
                    setCurrentPlan(data.subscription.plan.toLowerCase())
                }
            }
        } catch (error) {
            console.error('Failed to check subscription:', error)
        }
    }

    async function handleSubscribe(planId: string) {
        if (planId === 'free' || planId === currentPlan) return

        setLoading(true)
        try {
            const res = await fetch('/api/subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planId.toUpperCase() }),
            })

            if (res.ok) {
                setCurrentPlan(planId)
                showToast(`Upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)}! In production, this would redirect to payment.`, 'success')
            }
        } catch (error) {
            console.error('Failed to subscribe:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-12 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full mb-6">
                        <Crown className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-300 font-medium">Upgrade Your Experience</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                        Go <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Premium</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Unlock the full potential of Music Platform with unlimited access, offline downloads, and more.
                    </p>
                </div>

                {/* Features highlight */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {[
                        { icon: <Zap className="w-6 h-6" />, text: 'No Ads' },
                        { icon: <Download className="w-6 h-6" />, text: 'Offline Mode' },
                        { icon: <Music className="w-6 h-6" />, text: 'High Quality' },
                        { icon: <Shield className="w-6 h-6" />, text: 'Priority Support' },
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10"
                        >
                            <div className="text-purple-400">{feature.icon}</div>
                            <span className="text-white font-medium">{feature.text}</span>
                        </div>
                    ))}
                </div>

                {/* Plans */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${plan.highlighted
                                ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-2 border-purple-500 scale-105 shadow-xl shadow-purple-500/20'
                                : selectedPlan === plan.id
                                    ? 'bg-gray-800/50 border-2 border-purple-500/50'
                                    : 'bg-gray-800/30 border border-gray-700/50 hover:border-gray-600'
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-sm font-semibold">
                                    Most Popular
                                </div>
                            )}

                            {currentPlan === plan.id && (
                                <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                                    Current Plan
                                </div>
                            )}

                            <div className="mb-6">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${plan.highlighted
                                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                    : 'bg-gray-700 text-gray-300'
                                    }`}>
                                    {plan.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">
                                        {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className="text-gray-400">/{plan.period}</span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-gray-300">
                                        <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-purple-400' : 'text-green-400'
                                            }`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleSubscribe(plan.id)
                                }}
                                disabled={loading || currentPlan === plan.id}
                                className={`w-full py-3 rounded-xl font-semibold transition-all ${currentPlan === plan.id
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : plan.highlighted
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                                        : 'bg-gray-700 text-white hover:bg-gray-600'
                                    }`}
                            >
                                {currentPlan === plan.id
                                    ? 'Current Plan'
                                    : plan.price === 0
                                        ? 'Downgrade'
                                        : 'Subscribe Now'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQ or Trust badges */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            <span>Cancel Anytime</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>7-Day Free Trial</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
