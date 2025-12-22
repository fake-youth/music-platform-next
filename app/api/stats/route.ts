import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const totalUsers = await prisma.user.count();
        const totalSongs = await prisma.song.count();
        const totalGenres = await prisma.genre.count();

        // SQLite compatible group by
        const activeListenersGroup = await prisma.like.groupBy({
            by: ['userId'],
        });
        const activeListeners = activeListenersGroup.length;

        // Mocking Activity Data 
        const activityData = [
            { name: 'Mon', streams: Math.floor(Math.random() * 5000) },
            { name: 'Tue', streams: Math.floor(Math.random() * 5000) },
            { name: 'Wed', streams: Math.floor(Math.random() * 5000) },
            { name: 'Thu', streams: Math.floor(Math.random() * 5000) },
            { name: 'Fri', streams: Math.floor(Math.random() * 5000) },
            { name: 'Sat', streams: Math.floor(Math.random() * 5000) },
            { name: 'Sun', streams: Math.floor(Math.random() * 5000) },
        ];

        // Gender Stats
        const genderStats = await prisma.profile.groupBy({
            by: ['gender'],
            _count: {
                gender: true,
            },
        });

        const formattedGenderData = genderStats.map((stat: { gender: string | null; _count: { gender: number } }) => {
            const genderUpper = stat.gender ? stat.gender.toUpperCase() : 'UNKNOWN';
            let color = '#8b5cf6'; // Default Other
            if (genderUpper === 'MALE') color = '#00e5ff'; // Primary Cyan
            if (genderUpper === 'FEMALE') color = '#FF00E5'; // Accent Pink

            return {
                name: stat.gender || 'Unknown',
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
