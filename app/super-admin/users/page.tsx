"use client";

import { useEffect, useState } from "react";
import { Trash2, UserX, UserCheck, Loader2, Search } from "lucide-react";
import { useToast } from "@/components/providers/ToastContext";

interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (Array.isArray(data)) setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleRoleChange = async (id: string, newRole: string) => {
        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                body: JSON.stringify({ id, role: newRole }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                showToast(`User role updated to ${newRole}`, "success");
                setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
            } else {
                showToast("Failed to update role", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to update role", "error");
        }
    }

    const handleBan = async (id: string, currentRole: string) => {
        const isBanned = currentRole === 'BANNED';
        const action = isBanned ? 'unban' : 'ban';
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'POST',
                body: JSON.stringify({ banned: !isBanned }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                showToast(`User ${action}ned successfully`, "success");
                setUsers(users.map(u => u.id === id ? { ...u, role: isBanned ? 'USER' : 'BANNED' } : u));
            } else {
                showToast(`Failed to ${action} user`, "error");
            }
        } catch (e) {
            console.error(e);
            showToast(`Failed to ${action} user`, "error");
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to DELETE this user? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast("User deleted successfully", "success");
                setUsers(users.filter(u => u.id !== id));
            } else {
                showToast("Failed to delete user", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to delete user", "error");
        }
    }

    const filteredUsers = users.filter(user =>
        (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-zinc-400">Control user roles and access.</p>
                </div>
            </div>

            {/* Search */}
            <div className="flex gap-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#00e5ff] transition-colors"
                    />
                </div>
            </div>

            <div className="bg-zinc-900/50 rounded-xl border border-white/5 overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-zinc-500">Loading users...</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-zinc-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No users found.</td></tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{user.fullName || 'No Name'}</span>
                                            <span className="text-zinc-500 text-xs">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-zinc-300 focus:border-[#00e5ff] outline-none"
                                        >
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                            <option value="BANNED">BANNED</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${user.role === 'BANNED'
                                            ? 'text-red-400 bg-red-400/10 border-red-400/20'
                                            : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                                            }`}>
                                            {user.role === 'BANNED' ? 'Banned' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleBan(user.id, user.role)}
                                                className={`p-2 hover:bg-white/5 rounded transition-colors ${user.role === 'BANNED' ? 'text-emerald-400 hover:text-emerald-300' : 'text-zinc-400 hover:text-red-400'
                                                    }`}
                                                title={user.role === 'BANNED' ? 'Unban User' : 'Ban User'}
                                            >
                                                {user.role === 'BANNED' ? <UserCheck size={16} /> : <UserX size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-zinc-400 hover:text-red-400 p-2 hover:bg-white/5 rounded transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
