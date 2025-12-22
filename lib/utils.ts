import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

// Helper function to get user ID from cookies (client-side)
export function getUserIdFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    const userIdCookie = cookies.find(c => c.trim().startsWith('user_id='));
    return userIdCookie ? userIdCookie.split('=')[1] : null;
}

// Helper function to get user role from cookies (client-side)
export function getUserRoleFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    const roleCookie = cookies.find(c => c.trim().startsWith('user_role='));
    return roleCookie ? roleCookie.split('=')[1] : null;
}