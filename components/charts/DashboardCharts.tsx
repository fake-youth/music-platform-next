"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const DEFAULT_GENDER_DATA = [
    { name: 'No Data', value: 1, color: '#333' }
];

const DEFAULT_ACTIVITY_DATA = [
    { name: 'Mon', streams: 0 },
];

export interface ChartDataPoint {
    name: string;
    value?: number;
    streams?: number;
    color?: string;
    [key: string]: unknown; // Required for recharts dynamic access
}

export function GenderDistributionChart({ data }: { data?: ChartDataPoint[] }) {
    const chartData = (data && data.length > 0) ? data : DEFAULT_GENDER_DATA;

    return (
        <div className="h-[300px] w-full bg-zinc-900/50 rounded-xl p-4 border border-white/5">
            <h3 className="text-lg font-semibold mb-4">Listener Demographics</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ActivityChart({ data }: { data?: ChartDataPoint[] }) {
    const chartData = (data && data.length > 0) ? data : DEFAULT_ACTIVITY_DATA;

    return (
        <div className="h-[300px] w-full bg-zinc-900/50 rounded-xl p-4 border border-white/5">
            <h3 className="text-lg font-semibold mb-4">Usage Activity</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#71717a' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#71717a" tick={{ fill: '#71717a' }} axisLine={false} tickLine={false} />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    />
                    <Bar dataKey="streams" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
