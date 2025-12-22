"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Trash2, Search, ExternalLink } from "lucide-react";
import { useToast } from "@/components/providers/ToastContext";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        profile?: {
            fullName: string;
            avatarUrl?: string;
        };
    };
    song?: {
        id: string;
        title: string;
        artistName: string;
    };
    replies?: Comment[];
}

export default function CommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const res = await fetch('/api/comments');
            const data = await res.json();
            if (data.comments) setComments(data.comments);
        } catch (e) {
            console.error(e);
            showToast("Failed to fetch comments", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast("Comment deleted successfully", "success");
                setComments(comments.filter(c => c.id !== id));
            } else {
                showToast("Failed to delete comment", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to delete comment", "error");
        }
    };

    const filteredComments = comments.filter(comment =>
        comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.user.profile?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.song?.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Comments Moderation</h1>
                    <p className="text-zinc-400">Review and moderate user comments.</p>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search comments, users, or songs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-[#00e5ff] outline-none"
                    />
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center text-zinc-500 py-12">Loading comments...</div>
                ) : filteredComments.length === 0 ? (
                    <div className="text-center text-zinc-500 py-12">No comments found.</div>
                ) : (
                    filteredComments.map((comment) => (
                        <div key={comment.id} className="bg-zinc-900/50 rounded-xl border border-white/5 p-4 flex gap-4 hover:border-white/10 transition-colors">
                            <div className="size-10 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden">
                                {comment.user.profile?.avatarUrl ? (
                                    <img src={comment.user.profile.avatarUrl} alt="" className="size-full object-cover" />
                                ) : (
                                    <div className="size-full flex items-center justify-center bg-zinc-700">
                                        <span className="text-xs font-bold text-zinc-400">
                                            {comment.user.profile?.fullName?.[0] || '?'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-white text-sm">
                                            {comment.user.profile?.fullName || 'Unknown User'}
                                        </span>
                                        <span className="text-zinc-500 text-xs">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-colors"
                                        title="Delete Comment"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className="text-zinc-300 text-sm mb-2 break-words">{comment.content}</p>

                                {comment.song && (
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 bg-black/20 p-2 rounded">
                                        <MessageSquare size={12} />
                                        <span>On: </span>
                                        <Link href={`/albums/${comment.song.id}`} className="text-[#00e5ff] hover:underline flex items-center gap-1">
                                            {comment.song.title} - {comment.song.artistName}
                                            <ExternalLink size={10} />
                                        </Link>
                                    </div>
                                )}

                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-2 pl-4 border-l border-white/10 space-y-2">
                                        {comment.replies.map(reply => (
                                            <div key={reply.id} className="text-xs">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-medium text-zinc-300">
                                                        {reply.user.profile?.fullName}
                                                    </span>
                                                    <span className="text-zinc-600">
                                                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                                    </span>
                                                    <button onClick={() => handleDelete(reply.id)} className="text-zinc-600 hover:text-red-400 ml-auto">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                                <p className="text-zinc-400">{reply.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
