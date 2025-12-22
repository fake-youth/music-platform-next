'use client'

import { useState, useEffect } from 'react'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'

interface FollowButtonProps {
    targetUserId: string
    currentUserId?: string
    initialFollowing?: boolean
    onFollowChange?: (isFollowing: boolean) => void
    variant?: 'default' | 'compact'
}

export default function FollowButton({
    targetUserId,
    currentUserId,
    initialFollowing = false,
    onFollowChange,
    variant = 'default',
}: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialFollowing)
    const [loading, setLoading] = useState(false)
    const [isHovering, setIsHovering] = useState(false)

    useEffect(() => {
        if (currentUserId && currentUserId !== targetUserId) {
            checkFollowStatus()
        }
    }, [currentUserId, targetUserId])

    async function checkFollowStatus() {
        try {
            const res = await fetch(`/api/follow?userId=${targetUserId}`)
            const data = await res.json()
            setIsFollowing(data.isFollowing)
        } catch (error) {
            console.error('Failed to check follow status:', error)
        }
    }

    async function handleClick() {
        if (!currentUserId || loading) return

        setLoading(true)
        try {
            if (isFollowing) {
                // Unfollow
                const res = await fetch(`/api/follow?userId=${targetUserId}`, {
                    method: 'DELETE',
                })
                if (res.ok) {
                    setIsFollowing(false)
                    onFollowChange?.(false)
                }
            } else {
                // Follow
                const res = await fetch('/api/follow', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetUserId }),
                })
                if (res.ok) {
                    setIsFollowing(true)
                    onFollowChange?.(true)
                }
            }
        } catch (error) {
            console.error('Failed to update follow status:', error)
        } finally {
            setLoading(false)
        }
    }

    // Don't show button if viewing own profile or not logged in
    if (!currentUserId || currentUserId === targetUserId) {
        return null
    }

    if (variant === 'compact') {
        return (
            <button
                onClick={handleClick}
                disabled={loading}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={`p-2 rounded-full transition-all ${isFollowing
                        ? isHovering
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-700 text-white'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isFollowing ? (
                    isHovering ? (
                        <UserMinus className="w-5 h-5" />
                    ) : (
                        <UserPlus className="w-5 h-5" />
                    )
                ) : (
                    <UserPlus className="w-5 h-5" />
                )}
            </button>
        )
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 transition-all ${isFollowing
                    ? isHovering
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : 'bg-gray-700 text-white border border-gray-600'
                    : 'bg-purple-600 text-white hover:bg-purple-700 border border-purple-600'
                }`}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                </>
            ) : isFollowing ? (
                isHovering ? (
                    <>
                        <UserMinus className="w-4 h-4" />
                        <span>Unfollow</span>
                    </>
                ) : (
                    <>
                        <UserPlus className="w-4 h-4" />
                        <span>Following</span>
                    </>
                )
            ) : (
                <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                </>
            )}
        </button>
    )
}
