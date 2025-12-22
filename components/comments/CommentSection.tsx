'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, MoreHorizontal, Heart, Trash2, User } from 'lucide-react'

interface Comment {
    id: string
    content: string
    createdAt: string
    user: {
        id: string
        profile: {
            fullName: string | null
            avatarUrl: string | null
        } | null
    }
    replies?: Comment[]
}

interface CommentSectionProps {
    songId: string
    currentUserId?: string
}

export default function CommentSection({ songId, currentUserId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')

    useEffect(() => {
        fetchComments()
    }, [songId])

    async function fetchComments() {
        try {
            const res = await fetch(`/api/comments?songId=${songId}`)
            const data = await res.json()
            setComments(data.comments || [])
        } catch (error) {
            console.error('Failed to fetch comments:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!newComment.trim() || !currentUserId) return

        setSubmitting(true)
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    songId,
                    content: newComment.trim(),
                }),
            })

            if (res.ok) {
                setNewComment('')
                fetchComments()
            }
        } catch (error) {
            console.error('Failed to post comment:', error)
        } finally {
            setSubmitting(false)
        }
    }

    async function handleReply(parentId: string) {
        if (!replyContent.trim() || !currentUserId) return

        setSubmitting(true)
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    songId,
                    content: replyContent.trim(),
                    parentId,
                }),
            })

            if (res.ok) {
                setReplyContent('')
                setReplyingTo(null)
                fetchComments()
            }
        } catch (error) {
            console.error('Failed to post reply:', error)
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(commentId: string) {
        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                fetchComments()
            }
        } catch (error) {
            console.error('Failed to delete comment:', error)
        }
    }

    function formatDate(dateString: string): string {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 7) {
            return date.toLocaleDateString()
        } else if (days > 0) {
            return `${days}d ago`
        } else if (hours > 0) {
            return `${hours}h ago`
        } else if (minutes > 0) {
            return `${minutes}m ago`
        } else {
            return 'Just now'
        }
    }

    function CommentItem({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) {
        const userName = comment.user.profile?.fullName || 'Anonymous'
        const avatarUrl = comment.user.profile?.avatarUrl
        const isOwner = currentUserId === comment.user.id

        return (
            <div className={`flex gap-3 ${isReply ? 'ml-12' : ''}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={userName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="bg-gray-800/50 rounded-2xl px-4 py-3 backdrop-blur-lg border border-gray-700/50">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-white text-sm">{userName}</span>
                            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap break-words">
                            {comment.content}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-2 ml-2">
                        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors">
                            <Heart className="w-3.5 h-3.5" />
                            Like
                        </button>
                        {!isReply && currentUserId && (
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                Reply
                            </button>
                        )}
                        {isOwner && (
                            <button
                                onClick={() => handleDelete(comment.id)}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                            </button>
                        )}
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                            />
                            <button
                                onClick={() => handleReply(comment.id)}
                                disabled={!replyContent.trim() || submitting}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white text-sm font-medium transition-colors"
                            >
                                Reply
                            </button>
                        </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-4">
                            {comment.replies.map((reply) => (
                                <CommentItem key={reply.id} comment={reply} isReply />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-white">
                    Comments ({comments.length})
                </h3>
            </div>

            {/* New Comment Form */}
            {currentUserId ? (
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submitting}
                            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white font-medium transition-colors flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Post
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
                    <p className="text-gray-400">
                        <a href="/login" className="text-purple-400 hover:text-purple-300">Sign in</a> to leave a comment
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))
                )}
            </div>
        </div>
    )
}
