'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, UserPlus, Heart, MessageCircle, Music, Info, Check, Trash2, CheckCheck } from 'lucide-react'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link: string | null
    isRead: boolean
    createdAt: string
}

const notificationIcons: Record<string, React.ReactNode> = {
    FOLLOW: <UserPlus className="w-5 h-5 text-purple-400" />,
    LIKE: <Heart className="w-5 h-5 text-red-400" />,
    COMMENT: <MessageCircle className="w-5 h-5 text-blue-400" />,
    NEW_SONG: <Music className="w-5 h-5 text-green-400" />,
    SYSTEM: <Info className="w-5 h-5 text-yellow-400" />,
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        fetchNotifications()
    }, [])

    async function fetchNotifications() {
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    async function markAsRead(notificationIds: string[]) {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds }),
            })

            setNotifications(prev =>
                prev.map(n =>
                    notificationIds.includes(n.id) ? { ...n, isRead: true } : n
                )
            )
            setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    async function markAllAsRead() {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllRead: true }),
            })

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    async function deleteNotification(id: string) {
        try {
            await fetch(`/api/notifications?id=${id}`, {
                method: 'DELETE',
            })

            setNotifications(prev => prev.filter(n => n.id !== id))
        } catch (error) {
            console.error('Failed to delete notification:', error)
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Bell className="w-8 h-8 text-purple-500" />
                        <h1 className="text-3xl font-bold text-white">Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="px-2.5 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <div className="text-center py-20">
                        <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-400 mb-2">No notifications yet</h2>
                        <p className="text-gray-500">When you get notifications, they&apos;ll show up here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`relative group flex gap-4 p-4 rounded-xl border transition-all ${notification.isRead
                                        ? 'bg-gray-800/30 border-gray-700/50'
                                        : 'bg-purple-900/20 border-purple-500/30'
                                    }`}
                            >
                                {/* Icon */}
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                    {notificationIcons[notification.type] || <Bell className="w-5 h-5 text-gray-400" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-white">{notification.title}</p>
                                            <p className="text-gray-400 text-sm mt-0.5">{notification.message}</p>
                                        </div>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {formatDate(notification.createdAt)}
                                        </span>
                                    </div>

                                    {notification.link && (
                                        <Link
                                            href={notification.link}
                                            className="inline-block mt-2 text-sm text-purple-400 hover:text-purple-300"
                                        >
                                            View →
                                        </Link>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead([notification.id])}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check className="w-4 h-4 text-gray-400" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                    </button>
                                </div>

                                {/* Unread indicator */}
                                {!notification.isRead && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
