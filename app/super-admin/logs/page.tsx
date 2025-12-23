"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ShieldAlert, Clock, Loader2 } from "lucide-react";

interface Log {
    id: string;
    action: string;
    entity: string;
    details: string;
    createdAt: string;
    user: {
        email: string;
        profile?: {
            fullName: string;
        }
    }
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/audit-logs')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setLogs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'text-red-400';
        if (action.includes('BAN')) return 'text-orange-400';
        if (action.includes('UPDATE')) return 'text-blue-400';
        return 'text-zinc-400';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">System Activity Logs</h1>
                <p className="text-zinc-400">Audit trail of critical administrative actions.</p>
            </div>

            <div className="bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-zinc-500 flex justify-center items-center gap-2">
                        <Loader2 className="animate-spin" size={20} /> Loading logs...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">No activity recorded yet.</div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {logs.map(log => (
                            <div key={log.id} className="p-4 hover:bg-white/5 transition-colors flex items-start gap-4">
                                <div className="p-2 bg-white/5 rounded-lg text-zinc-400 mt-1">
                                    <ShieldAlert size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-white">
                                            <span className={getActionColor(log.action)}>{log.action}</span>
                                            <span className="text-zinc-500 mx-2">•</span>
                                            <span className="text-zinc-300">{log.entity}</span>
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                            <Clock size={12} />
                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-400 mt-1">{log.details}</p>
                                    <div className="mt-2 text-xs flex items-center gap-2 text-zinc-500">
                                        <span>by</span>
                                        <span className="text-white bg-white/10 px-1.5 py-0.5 rounded">
                                            {log.user.profile?.fullName || log.user.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
