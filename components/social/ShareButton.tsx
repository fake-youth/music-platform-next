'use client'

import { useState } from 'react'
import { Share2, Link2, X, Check } from 'lucide-react'

interface ShareButtonProps {
    title: string
    url?: string
    description?: string
}

interface SharePlatform {
    name: string
    icon: React.ReactNode
    color: string
    getUrl: (shareUrl: string, title: string, description: string) => string
}

const platforms: SharePlatform[] = [
    {
        name: 'Twitter',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        color: 'hover:bg-gray-800',
        getUrl: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
        name: 'Facebook',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 36.6 36.6 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
            </svg>
        ),
        color: 'hover:bg-blue-600',
        getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
        name: 'WhatsApp',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
        ),
        color: 'hover:bg-green-500',
        getUrl: (url, title) => `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    },
    {
        name: 'Telegram',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
        ),
        color: 'hover:bg-sky-500',
        getUrl: (url, title) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
]

export default function ShareButton({ title, url, description = '' }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

    async function handleShare(platform: SharePlatform) {
        const targetUrl = platform.getUrl(shareUrl, title, description)
        window.open(targetUrl, '_blank', 'width=600,height=400')
        setIsOpen(false)
    }

    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy link:', error)
        }
    }

    async function handleNativeShare() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: description,
                    url: shareUrl,
                })
                setIsOpen(false)
            } catch (error) {
                // User cancelled or error
                console.log('Share cancelled')
            }
        } else {
            setIsOpen(true)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={handleNativeShare}
                className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all"
                title="Share"
            >
                <Share2 className="w-5 h-5 text-gray-300" />
            </button>

            {/* Share Modal */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute bottom-full mb-2 right-0 z-50 w-72 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <h3 className="font-semibold text-white">Share</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        {/* Platforms */}
                        <div className="p-4 grid grid-cols-4 gap-3">
                            {platforms.map((platform) => (
                                <button
                                    key={platform.name}
                                    onClick={() => handleShare(platform)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${platform.color}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white">
                                        {platform.icon}
                                    </div>
                                    <span className="text-xs text-gray-400">{platform.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Copy Link */}
                        <div className="p-4 pt-0">
                            <button
                                onClick={handleCopyLink}
                                className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                    {copied ? (
                                        <Check className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <Link2 className="w-5 h-5 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-white">
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                                        {shareUrl}
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
