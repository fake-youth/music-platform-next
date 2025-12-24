import { z } from 'zod';

// Auth validations
export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

// Song validations
export const songSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    artist: z.string().min(1, 'Artist is required').max(200, 'Artist name too long'),
    lyrics: z.string().optional(),
    audioUrl: z.string().min(1, 'Audio URL required'),
    coverUrl: z.string().optional().or(z.literal('')),
    duration: z.number().int().positive('Duration must be positive'),
    genreId: z.string().uuid('Invalid genre ID'),
});

// Genre validations
export const genreSchema = z.object({
    name: z.string().min(1, 'Genre name is required').max(50, 'Genre name too long'),
});

// Profile validations
export const profileSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Name too long').optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

// Playlist validations
export const playlistSchema = z.object({
    name: z.string().min(1, 'Playlist name is required').max(100, 'Playlist name too long'),
    userId: z.string().uuid('Invalid user ID'),
});

// File upload constants
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// File validation helper
export function validateFile(file: File, type: 'audio' | 'image'): { valid: boolean; error?: string } {
    if (type === 'audio') {
        if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
            return { valid: false, error: 'Invalid audio format. Allowed: MP3, WAV, OGG, M4A' };
        }
        if (file.size > MAX_AUDIO_SIZE) {
            return { valid: false, error: `File too large. Maximum size: ${MAX_AUDIO_SIZE / 1024 / 1024}MB` };
        }
    } else {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return { valid: false, error: 'Invalid image format. Allowed: JPEG, PNG, WebP, GIF' };
        }
        if (file.size > MAX_IMAGE_SIZE) {
            return { valid: false, error: `File too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB` };
        }
    }
    return { valid: true };
}

