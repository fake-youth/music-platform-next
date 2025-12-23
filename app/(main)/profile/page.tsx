"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mail, Music, Heart, ListMusic, LogOut, Loader2, Save, X, Edit2, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserIdFromCookie } from "@/lib/utils";
import { useToast } from "@/components/providers/ToastContext";

interface UserProfile {
    id: string;
    email: string;
    role: string;
    profile: {
        fullName: string;
        gender: string;
        avatarUrl?: string;
    } | null;
}

interface Playlist {
    id: string;
    name: string;
    songs: { song: { id: string; title: string } }[];
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [likedSongsCount, setLikedSongsCount] = useState(0);
    const [totalPlays, setTotalPlays] = useState(0);
    const [loading, setLoading] = useState(true);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ fullName: '', gender: '' });
    const [updating, setUpdating] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Password Change State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [changingPassword, setChangingPassword] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { showToast } = useToast();

    const handleChangePassword = async () => {
        if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
            showToast('All fields are required', 'error');
            return;
        }
        if (passwordForm.new !== passwordForm.confirm) {
            showToast('New passwords do not match', 'error');
            return;
        }
        if (passwordForm.new.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setChangingPassword(true);
        try {
            const userId = getUserIdFromCookie();
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    currentPassword: passwordForm.current,
                    newPassword: passwordForm.new
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Password changed successfully', 'success');
                setIsPasswordModalOpen(false);
                setPasswordForm({ current: '', new: '', confirm: '' });
            } else {
                showToast(data.error || 'Failed to change password', 'error');
            }
        } catch (e) {
            showToast('Failed to change password', 'error');
        } finally {
            setChangingPassword(false);
        }
    };

    useEffect(() => {
        const userId = getUserIdFromCookie();
        if (!userId) {
            router.push('/login');
            return;
        }

        // Fetch current user
        fetch(`/api/users/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.id) {
                    setUser(data);
                    setEditForm({
                        fullName: data.profile?.fullName || '',
                        gender: data.profile?.gender || ''
                    });
                    // Fetch playlists for this user
                    return fetch(`/api/playlists?userId=${data.id}`);
                }
            })
            .then(res => res?.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPlaylists(data);
                }
                // Fetch liked songs count
                return fetch(`/api/likes?userId=${userId}`);
            })
            .then(res => res?.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLikedSongsCount(data.length);
                }
                // Fetch total plays count
                return fetch(`/api/stats/user?userId=${userId}`);
            })
            .then(res => res?.json())
            .then(data => {
                if (data?.totalPlays !== undefined) {
                    setTotalPlays(data.totalPlays);
                }
            })
            .catch(err => {
                console.error('Failed to fetch user data:', err);
                // Fallback: try to get from users list
                fetch('/api/users')
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data)) {
                            const currentUser = data.find(u => u.id === userId) || data[0];
                            if (currentUser) {
                                setUser(currentUser);
                                return fetch(`/api/playlists?userId=${currentUser.id}`);
                            }
                        }
                    })
                    .then(res => res?.json())
                    .then(data => {
                        if (Array.isArray(data)) setPlaylists(data);
                    });
            })
            .finally(() => setLoading(false));
    }, [router]);

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim() || !user) return;
        setCreating(true);
        try {
            const res = await fetch('/api/playlists', {
                method: 'POST',
                body: JSON.stringify({ name: newPlaylistName, userId: user.id }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                const newPlaylist = await res.json();
                setPlaylists([newPlaylist, ...playlists]);
                setNewPlaylistName('');
                showToast('Playlist created successfully', 'success');
            } else {
                showToast('Failed to create playlist', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to create playlist', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleDeletePlaylist = async (id: string) => {
        if (!confirm('Delete this playlist?')) return;
        try {
            const res = await fetch(`/api/playlists?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPlaylists(playlists.filter(p => p.id !== id));
                showToast('Playlist deleted', 'success');
            } else {
                showToast('Failed to delete playlist', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to delete playlist', 'error');
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const handleUpdateProfile = async () => {
        const userId = getUserIdFromCookie();
        if (!userId) return;

        setUpdating(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    fullName: editForm.fullName,
                    gender: editForm.gender
                })
            });

            if (res.ok) {
                const updatedProfile = await res.json();
                setUser(prev => prev ? {
                    ...prev,
                    profile: {
                        ...prev.profile,
                        ...updatedProfile
                    }
                } : null);
                setEditing(false);
                showToast('Profile updated successfully', 'success');
            } else {
                showToast('Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            showToast('Failed to update profile', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const userId = getUserIdFromCookie();
        if (!userId) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image too large. Maximum size is 5MB', 'error');
            return;
        }

        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'image');

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) {
                throw new Error('Upload failed');
            }

            const uploadData = await uploadRes.json();
            const avatarUrl = uploadData.url;

            // Update profile with new avatar URL
            const profileRes = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, avatarUrl })
            });

            if (profileRes.ok) {
                setUser(prev => prev ? {
                    ...prev,
                    profile: {
                        ...prev.profile,
                        fullName: prev.profile?.fullName || '',
                        gender: prev.profile?.gender || '',
                        avatarUrl
                    }
                } : null);
                showToast('Avatar updated successfully', 'success');
            } else {
                showToast('Failed to update avatar', 'error');
            }
        } catch (error) {
            console.error('Avatar upload failed:', error);
            showToast('Failed to upload avatar', 'error');
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#00e5ff]" size={32} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <p className="text-zinc-400">Please log in to view your profile</p>
                <Link href="/login" className="text-[#00e5ff] hover:underline">Login</Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto pt-4">
            {/* Profile Header */}
            <div className="flex items-center gap-6 p-6 bg-zinc-900/50 rounded-2xl border border-white/5">
                <div className="relative group">
                    <div className="size-24 rounded-full bg-gradient-to-br from-[#00e5ff]/30 to-[#00e5ff]/5 flex items-center justify-center border border-[#00e5ff]/30 overflow-hidden">
                        {uploadingAvatar ? (
                            <Loader2 className="animate-spin text-[#00e5ff]" size={32} />
                        ) : user.profile?.avatarUrl ? (
                            <img src={user.profile.avatarUrl} alt="" className="size-full rounded-full object-cover" />
                        ) : (
                            <User size={40} className="text-[#00e5ff]" />
                        )}
                    </div>
                    <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                        <Camera size={24} className="text-white" />
                    </button>
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                    />
                </div>
                <div className="flex-1">
                    {editing ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={editForm.fullName}
                                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                placeholder="Full Name"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00e5ff] outline-none"
                            />
                            <select
                                value={editForm.gender}
                                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00e5ff] outline-none"
                            >
                                <option value="">Select Gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={updating}
                                    className="px-4 py-2 bg-[#00e5ff] text-black rounded-lg text-sm font-medium hover:bg-[#00e5ff]/80 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {updating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setEditForm({
                                            fullName: user.profile?.fullName || '',
                                            gender: user.profile?.gender || ''
                                        });
                                    }}
                                    className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 flex items-center gap-2"
                                >
                                    <X size={14} /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold">{user.profile?.fullName || 'User'}</h1>
                            <p className="text-zinc-400 flex items-center gap-2">
                                <Mail size={14} /> {user.email}
                            </p>
                            <div className="flex gap-4 mt-3">
                                <span className="text-xs bg-[#00e5ff]/10 text-[#00e5ff] px-2 py-1 rounded-full border border-[#00e5ff]/30">
                                    {user.role}
                                </span>
                                {user.profile?.gender && (
                                    <span className="text-xs bg-white/5 text-zinc-400 px-2 py-1 rounded-full">
                                        {user.profile.gender}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </div>
                <div className="flex gap-2">
                    {!editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Edit2 size={16} /> Edit
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                    {!editing && (
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                        >
                            Change Password
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 text-center">
                    <ListMusic className="mx-auto mb-2 text-[#00e5ff]" size={24} />
                    <p className="text-2xl font-bold">{playlists.length}</p>
                    <p className="text-zinc-500 text-sm">Playlists</p>
                </div>
                <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 text-center">
                    <Heart className="mx-auto mb-2 text-rose-400" size={24} />
                    <p className="text-2xl font-bold">{likedSongsCount}</p>
                    <p className="text-zinc-500 text-sm">Liked Songs</p>
                </div>
                <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 text-center">
                    <Music className="mx-auto mb-2 text-emerald-400" size={24} />
                    <p className="text-2xl font-bold">{totalPlays}</p>
                    <p className="text-zinc-500 text-sm">Plays</p>
                </div>
            </div>

            {/* Playlists */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Playlists</h2>

                {/* Create New */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="New playlist name..."
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#00e5ff] outline-none"
                    />
                    <button
                        onClick={handleCreatePlaylist}
                        disabled={creating || !newPlaylistName.trim()}
                        className="px-4 py-2 bg-[#00e5ff] text-black rounded-lg font-medium hover:bg-[#00e5ff]/80 disabled:opacity-50 flex items-center gap-2"
                    >
                        {creating && <Loader2 size={14} className="animate-spin" />}
                        Create
                    </button>
                </div>

                {/* Playlist List */}
                {playlists.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                        <ListMusic size={32} className="mx-auto mb-2 text-zinc-700" />
                        <p>No playlists yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {playlists.map(playlist => (
                            <div key={playlist.id} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-white/5 hover:border-[#00e5ff]/30 transition-colors">
                                <Link href={`/playlists/${playlist.id}`} className="flex items-center gap-3 flex-1">
                                    <div className="size-12 bg-gradient-to-br from-[#00e5ff]/20 to-transparent rounded-lg flex items-center justify-center">
                                        <ListMusic size={20} className="text-[#00e5ff]" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{playlist.name}</p>
                                        <p className="text-zinc-500 text-sm">{playlist.songs?.length || 0} songs</p>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => handleDeletePlaylist(playlist.id)}
                                    className="text-zinc-500 hover:text-red-400 text-sm ml-4"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Change Password</h2>
                            <button onClick={() => setIsPasswordModalOpen(false)} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="password"
                                placeholder="Current Password"
                                value={passwordForm.current}
                                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#00e5ff] outline-none"
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={passwordForm.new}
                                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#00e5ff] outline-none"
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={passwordForm.confirm}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#00e5ff] outline-none"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">Cancel</button>
                            <button
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                                className="px-4 py-2 text-sm font-medium bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {changingPassword && <Loader2 size={14} className="animate-spin" />} Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
