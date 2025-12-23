import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, format } from 'date-fns';

export async function GET() {
    try {
        const totalUsers = await prisma.user.count();
        const totalSongs = await prisma.song.count();
        const totalGenres = await prisma.genre.count();

        // Active Listeners (Users who liked at least one song)
        // Note: In a real app, this might be users who played a song in the last 30 days
        const activeListenersGroup = await prisma.like.groupBy({
            by: ['userId'],
        });
        const activeListeners = activeListenersGroup.length;

        // Activity Data (Last 7 days plays)
        const sevenDaysAgo = startOfDay(subDays(new Date(), 6));
        const playHistory = await prisma.playHistory.findMany({
            where: {
                playedAt: {
                    gte: sevenDaysAgo,
                },
            },
            select: {
                playedAt: true,
            },
        });

        // Group by day using date-fns
        const activityMap = new Map<string, number>();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Initialize last 7 days with 0
        for (let i = 0; i < 7; i++) {
            const date = subDays(new Date(), i);
            const dayName = format(date, 'EEE'); // 'Mon', 'Tue' etc.
            if (!activityMap.has(dayName)) {
                activityMap.set(dayName, 0);
            }
        }

        playHistory.forEach(play => {
            const dayName = format(play.playedAt, 'EEE');
            activityMap.set(dayName, (activityMap.get(dayName) || 0) + 1);
        });

        // Convert to array and reverse to show chronological order if needed, 
        // but for a bar chart "Mon, Tue..." order implies "Day of week". 
        // Actually, dashboards usually show "Last 7 days" moving window.
        // Let's rely on standard day sorting or just return the map entries.
        // For simplicity in UI, let's just return the last 7 days in order.
        const activityData = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dayName = format(date, 'EEE');
            activityData.push({
                name: dayName,
                streams: activityMap.get(dayName) || 0
            });
        }

        // Gender Stats
        const genderStats = await prisma.profile.groupBy({
            by: ['gender'],
            _count: {
                gender: true,
            },
        });

        const formattedGenderData = genderStats.map((stat: { gender: string | null; _count: { gender: number } }) => {
            const genderUpper = stat.gender ? stat.gender.toUpperCase() : 'UNKNOWN';
            let color = '#71717a'; // Default zinc-500
            if (genderUpper === 'MALE') color = '#00e5ff'; // Cyan
            if (genderUpper === 'FEMALE') color = '#ec4899'; // Pink
            if (genderUpper === 'OTHER') color = '#a855f7'; // Purple

            return {
                name: stat.gender || 'Not Specified',
                value: stat._count.gender,
                color: color
            };
        });

        // Add default if empty
        if (formattedGenderData.length === 0) {
            formattedGenderData.push({ name: 'No Data', value: 1, color: '#333' });
        }

        return NextResponse.json({
            summary: {
                totalUsers,
                totalSongs,
                totalGenres,
                activeListeners: activeListeners || 0,
            },
            charts: {
                activity: activityData,
                gender: formattedGenderData,
            }
        });

    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
